import React, { useState } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CONTRACT_ABI from "@/constants/contractAbi";
import MintSuccessAlert from "./MintSuccessAlert"; // Import the MintSuccessAlert component

const CONTRACT_ADDRESS = "0x68a9b61aad98960b6ec11ca433fb3e9ceb19cffe";

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
  bestMan: string;
  maidOfHonor: string;
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
    bestMan: "",
    maidOfHonor: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [mintedTokenId, setMintedTokenId] = useState<number | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http(),
  });

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCopyLink = async () => {
    if (!mintedTokenId) return;
    const link = `${window.location.origin}/mint-partner?tokenId=${mintedTokenId}`;
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const mintCertificate = async () => {
    if (!user?.wallet?.address || !formData.partnerAddress) return;

    setIsLoading(true);
    setError(null);
    setMintedTokenId(null);
    setShowSuccessAlert(false);

    try {
      const walletClient = createWalletClient({
        chain: baseSepolia,
        transport: custom(window.ethereum),
      });
      const [address] = await walletClient.getAddresses();

      const data = encodeFunctionData({
        abi: CONTRACT_ABI,
        functionName: "mintMarriageCertificate",
        args: [
          formData.partnerAddress,
          formData.location,
          formData.officiant,
          formData.bestMan,
          formData.maidOfHonor,
        ],
      });

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

      // Find the MarriageCertificateMinted event
      if (receipt.logs && receipt.logs.length > 0) {
        try {
          // Try to find and decode the MarriageCertificateMinted event
          for (const log of receipt.logs) {
            try {
              if (
                log.address.toLowerCase() === CONTRACT_ADDRESS.toLowerCase()
              ) {
                const decoded = decodeEventLog({
                  abi: CONTRACT_ABI,
                  data: log.data,
                  topics: log.topics,
                });

                // Check if this is the MarriageCertificateMinted event
                if (decoded.eventName === "MarriageCertificateMinted") {
                  // Add a nullish check here
                  if (decoded.args) {
                    const tokenId = Number(decoded.args[2]);
                    console.log("Minted token ID:", tokenId);
                    setMintedTokenId(tokenId);
                    setShowSuccessAlert(true);
                    break;
                  } else {
                    console.error("Decoded args are undefined.");
                  }
                }
              }
            } catch (e) {
              // Skip logs that can't be decoded as our event
              continue;
            }
          }
        } catch (e) {
          console.error("Error decoding logs:", e);
        }
      }

      // Fallback if we couldn't get the tokenId from events
      if (mintedTokenId === null) {
        // Query the marriageByAddress mapping to get the tokenId
        const tokenId = await publicClient.readContract({
          address: CONTRACT_ADDRESS,
          abi: CONTRACT_ABI,
          functionName: "marriageByAddress",
          args: [address],
        });

        if (tokenId && Number(tokenId) > 0) {
          console.log("Retrieved token ID from contract:", Number(tokenId));
          setMintedTokenId(Number(tokenId));
          setShowSuccessAlert(true);
        } else {
          throw new Error("Failed to retrieve token ID");
        }
      }
    } catch (error) {
      console.error("Error minting certificate:", error);
      setError(
        "Failed to mint certificate. Please check the console for details."
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
            label="Location"
            value={formData.location}
            onChange={(e) => updateField("location", e.target.value)}
            placeholder="City, Country"
          />
          <FormField
            label="Officiant"
            value={formData.officiant}
            onChange={(e) => updateField("officiant", e.target.value)}
            placeholder="Full Name"
          />
          <FormField
            label="Best Man"
            value={formData.bestMan}
            onChange={(e) => updateField("bestMan", e.target.value)}
            placeholder="Full Name"
          />
          <FormField
            label="Maid of Honor"
            value={formData.maidOfHonor}
            onChange={(e) => updateField("maidOfHonor", e.target.value)}
            placeholder="Full Name"
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
            disabled={!authenticated || !isFormValid || isLoading}
            className={`bg-gradient-to-r from-rose-500 to-purple-500 
            hover:opacity-90 transition-all duration-300 
            transform hover:scale-105 disabled:opacity-50 
            disabled:hover:scale-100 min-w-[140px]`}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="animate-spin" size={16} />
                Minting...
              </div>
            ) : (
              "Mint Certificate"
            )}
          </Button>
        </CardHeader>
        <CardContent>
          {mintedTokenId ? (
            <div className="space-y-4 animate-fadeIn">
              <Button
                onClick={handleCopyLink}
                className="bg-gradient-to-r from-rose-500 to-purple-500 
                hover:opacity-90 transition-all duration-300 
                transform hover:scale-105 flex items-center gap-2"
              >
                {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                {copied ? "Copied!" : "Copy Partner Minting Link"}
              </Button>
            </div>
          ) : (
            <p className="text-gray-600">
              Fill in all details to mint your marriage certificate.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Show the success alert if minted */}
      {showSuccessAlert && mintedTokenId && (
        <MintSuccessAlert
          tokenId={mintedTokenId}
          partnerAddress={formData.partnerAddress}
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
