import React, { useState, useEffect } from "react";
import { Search, Copy, Heart, X, CheckCircle, Loader2 } from "lucide-react";
import {
  createPublicClient,
  http,
  createWalletClient,
  custom,
  encodeFunctionData,
  decodeEventLog,
} from "viem";
import { baseSepolia } from "viem/chains";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import CONTRACT_ABI from "../constants/contractAbi";
import MintSuccessAlert from "./MintSuccessAlert";

const CONTRACT_ADDRESS = "0x68a9b61aad98960b6ec11ca433fb3e9ceb19cffe";
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  icon?: React.ComponentType<{ size: number; className: string }>;
}

interface FormData {
  partnerAddress: string;
  location: string;
  officiant: string;
  partnerName: string; // First partner's name (minter)
  secondPartnerName: string; // Second partner's name
}

interface MintFormProps {
  authenticated: boolean;
  user: {
    wallet?: {
      address: string;
    };
  };
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChange,
  placeholder,
  icon: Icon,
}) => (
  <div className="relative transition-all duration-200 ease-in-out transform hover:scale-[1.02] focus-within:scale-[1.02]">
    <label className="block text-sm font-medium text-gray-700 mb-1 ml-1">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <Icon
          className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={20}
        />
      )}
      <Input
        type="text"
        className={`w-full ${
          Icon ? "pl-12" : "pl-4"
        } pr-4 py-3 bg-white/20 backdrop-blur-xl 
        border border-white/30 rounded-xl focus:ring-2 focus:ring-rose-500 
        text-gray-800 transition-all duration-200 ease-in-out`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  </div>
);

const MintForm: React.FC<MintFormProps> = ({ authenticated, user }) => {
  const [formData, setFormData] = useState<FormData>({
    partnerAddress: "",
    location: "",
    officiant: "",
    partnerName: "",
    secondPartnerName: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isImageGenerating, setIsImageGenerating] = useState(false);
  const [mintedTokenId, setMintedTokenId] = useState<number | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [certificateImageUrl, setCertificateImageUrl] = useState<string | null>(
    null
  );

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(),
  });

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;

    // Make sure we're copying the actual shareUrl, not a template string
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Step 1: Generate the image first
  const generateCertificateImage = async (tokenId: number) => {
    try {
      setIsImageGenerating(true);

      // Call the backend to generate the certificate image
      const response = await fetch(
        `${BASE_URL}/images/certificate/${tokenId}?husband=${encodeURIComponent(
          formData.partnerName
        )}&wife=${encodeURIComponent(formData.secondPartnerName)}`,
        { method: "GET" }
      );

      if (!response.ok) throw new Error("Failed to generate certificate image");

      const data = await response.json();

      setCertificateImageUrl(data.httpUrl);
      return data.ipfsUrl;
    } catch (error) {
      console.error("Error generating certificate image:", error);
      setError("Failed to generate certificate image");
      throw error;
    } finally {
      setIsImageGenerating(false);
    }
  };

  // Step 2: Create share link after successful minting
  const createShareLink = async (tokenId: number, imageUrl: string) => {
    try {
      const response = await fetch(`${BASE_URL}/share/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstPartnerAddress: user.wallet?.address,
          firstPartnerName: formData.partnerName,
          secondPartnerName: formData.secondPartnerName,
          nftId: tokenId,
          imageUrl: imageUrl,
        }),
      });

      if (!response.ok) throw new Error("Failed to create share link");

      const data = await response.json();

      if (data.success) {
        // Store the actual share URL returned from the backend
        setShareUrl(data.shareUrl);
        console.log("Share URL set:", data.shareUrl);
        return data.shareUrl;
      } else {
        throw new Error(data.error || "Unknown error creating share link");
      }
    } catch (error) {
      console.error("Error creating share link:", error);
      setError(
        "Failed to create share link: " +
          (error instanceof Error ? error.message : String(error))
      );
      throw error;
    }
  };

  // Main mint function - orchestrates the entire process
  const mintCertificate = async () => {
    if (!user?.wallet?.address || !formData.partnerAddress) return;

    setIsLoading(true);
    setError(null);
    setMintedTokenId(null);
    setShowSuccessAlert(false);
    setCertificateImageUrl(null);
    setShareUrl(null);

    try {
      // Connect wallet client for transaction
      const walletClient = createWalletClient({
        chain: baseSepolia,
        transport: custom(window.ethereum),
      });
      const [address] = await walletClient.getAddresses();

      // Encode function data for smart contract call
      const data = encodeFunctionData({
        abi: CONTRACT_ABI,
        functionName: "mintMarriageCertificate",
        args: [
          formData.partnerAddress,
          formData.location,
          formData.officiant,
          formData.partnerName,
          formData.secondPartnerName,
        ],
      });

      // Send transaction to mint certificate
      const hash = await walletClient.sendTransaction({
        account: address,
        to: CONTRACT_ADDRESS,
        data,
        chain: baseSepolia,
        value: 5000000000000000n, // 0.005 ETH
      });

      console.log("Transaction sent:", hash);

      // Wait for the transaction receipt
      const receipt = await publicClient.waitForTransactionReceipt({ hash });
      console.log("Transaction receipt:", receipt);

      // Extract token ID from event logs
      let tokenId = null;
      if (receipt.logs && receipt.logs.length > 0) {
        for (const log of receipt.logs) {
          try {
            if (log.address.toLowerCase() === CONTRACT_ADDRESS.toLowerCase()) {
              const decoded = decodeEventLog({
                abi: CONTRACT_ABI,
                data: log.data,
                topics: log.topics,
              });

              if (
                decoded.eventName === "MarriageCertificateMinted" &&
                decoded.args
              ) {
                tokenId = Number(decoded.args[2]);
                console.log("Minted token ID:", tokenId);
                setMintedTokenId(tokenId);
                break;
              }
            }
          } catch (e) {
            // Skip logs that can't be decoded as our event
            continue;
          }
        }
      }

      // Fallback if we couldn't get the tokenId from events
      if (tokenId === null) {
        tokenId = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "marriageByAddress",
          args: [address],
        });

        if (tokenId && Number(tokenId) > 0) {
          tokenId = Number(tokenId);
          console.log("Retrieved token ID from contract:", tokenId);
          setMintedTokenId(tokenId);
        } else {
          throw new Error("Failed to retrieve token ID");
        }
      }

      // Now generate the certificate image
      const imageUrl = await generateCertificateImage(tokenId);

      // Create the share link with the image URL
      await createShareLink(tokenId, imageUrl);

      // Show success alert
      setShowSuccessAlert(true);
    } catch (error) {
      console.error("Error in minting process:", error);
      setError(
        "Minting failed: " +
          (error instanceof Error ? error.message : "Unknown error")
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = Object.values(formData).every(
    (value) => value.trim() !== ""
  );

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8 relative">
      <div className="space-y-6">
        <FormField
          label="Partner's Ethereum Address"
          value={formData.partnerAddress}
          onChange={(e) => updateField("partnerAddress", e.target.value)}
          placeholder="0x..."
          icon={Search}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Your Name"
            value={formData.partnerName}
            onChange={(e) => updateField("partnerName", e.target.value)}
            placeholder="Your Full Name"
          />
          <FormField
            label="Partner's Name"
            value={formData.secondPartnerName}
            onChange={(e) => updateField("secondPartnerName", e.target.value)}
            placeholder="Partner's Full Name"
          />
          <FormField
            label="Location"
            value={formData.location}
            onChange={(e) => updateField("location", e.target.value)}
            placeholder="City, Country"
          />
          <FormField
            label="Officiant"
            value={formData.officiant}
            onChange={(e) => updateField("officiant", e.target.value)}
            placeholder="Officiant Name"
          />
        </div>
      </div>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
          role="alert"
        >
          <span className="block sm:inline">{error}</span>
          <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
            <X onClick={() => setError(null)} className="cursor-pointer" />
          </span>
        </div>
      )}

      <Card className="bg-white/20 backdrop-blur-xl border border-white/30 transition-all duration-300 hover:shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            <Heart className="text-rose-500" />
            Marriage Certificate
          </CardTitle>
          <Button
            onClick={mintCertificate}
            disabled={
              !authenticated || !isFormValid || isLoading || isImageGenerating
            }
            className={`bg-gradient-to-r from-rose-500 to-purple-500 
            hover:opacity-90 transition-all duration-300 
            transform hover:scale-105 disabled:opacity-50 
            disabled:hover:scale-100 min-w-[140px]`}
          >
            {isLoading || isImageGenerating ? (
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin" size={16} />
                {isImageGenerating ? "Generating..." : "Minting..."}
              </div>
            ) : (
              "Mint Certificate"
            )}
          </Button>
        </CardHeader>
        <CardContent>
          {certificateImageUrl && (
            <div className="mb-4">
              <img
                src={certificateImageUrl}
                alt="Marriage Certificate"
                className="w-full rounded-lg shadow-md"
              />
            </div>
          )}

          {shareUrl ? (
            <div className="space-y-4 animate-fadeIn">
              <Button
                onClick={handleCopyLink}
                className="bg-gradient-to-r from-rose-500 to-purple-500 
                hover:opacity-90 transition-all duration-300 
                transform hover:scale-105 flex items-center gap-2 w-full"
              >
                {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                {copied ? "Copied!" : "Copy Partner Minting Link"}
              </Button>
              <p className="text-sm text-gray-600 mt-2">
                Share this link with your partner so they can mint their copy of
                the marriage certificate.
              </p>
            </div>
          ) : (
            <p className="text-gray-600">
              Fill in all details to mint your marriage certificate. Your
              partner will receive a link to mint their copy.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Show the success alert if minted */}
      {showSuccessAlert && mintedTokenId !== null && (
        <MintSuccessAlert
          tokenId={mintedTokenId}
          partnerAddress={formData.partnerAddress}
          certificateImageUrl={certificateImageUrl}
          shareUrl={shareUrl}
          onClose={() => setShowSuccessAlert(false)}
        />
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default MintForm;
