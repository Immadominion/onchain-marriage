import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createWalletClient, custom, encodeFunctionData } from "viem";
import { baseSepolia } from "viem/chains";
import { Heart, Loader2, Check, X } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import CONTRACT_ABI from "../constants/contractAbi";

const CONTRACT_ADDRESS = "0x68a9b61aad98960b6ec11ca433fb3e9ceb19cffe";
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";


export interface UserType {
  wallet?: {
    address: string;
  };
}


interface JoinMarriageProps {
  authenticated: boolean;
  user: {
    wallet?: {
      address: string;
    };
  };
}

const JoinMarriage: React.FC<JoinMarriageProps> = ({ authenticated, user }) => {
  const { shareCode } = useParams<{ shareCode: string }>();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [minting, setMinting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [shareData, setShareData] = useState<any>(null);
  const [tokenId, setTokenId] = useState<number | null>(null);
  const [certificateImageUrl, setCertificateImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!shareCode) return;
    
    const validateShareLink = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BASE_URL}/share/${shareCode}`);
        
        if (!response.ok) {
          throw new Error("Invalid sharing link");
        }
        
        const data = await response.json();
        
        if (!data.success) {
          throw new Error(data.error || "Invalid sharing link");
        }
        
        setShareData(data.shareLink);
        setTokenId(data.shareLink.nftId);
        setCertificateImageUrl(data.previewUrl);
      } catch (error) {
        console.error("Error validating share link:", error);
        setError(error instanceof Error ? error.message : "Failed to validate link");
      } finally {
        setLoading(false);
      }
    };
    
    validateShareLink();
  }, [shareCode]);

  const handleMint = async () => {
    if (!authenticated || !user?.wallet?.address || !tokenId || !shareCode) {
      setError("Please connect your wallet first");
      return;
    }
    
    try {
      setMinting(true);
      setError(null);
      
      // First claim the share link
      const claimResponse = await fetch(`${BASE_URL}/share/${shareCode}/claim`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secondPartnerAddress: user.wallet.address
        })
      });
      
      if (!claimResponse.ok) {
        const errorData = await claimResponse.json();
        throw new Error(errorData.error || "Failed to claim share link");
      }
      
      const claimData = await claimResponse.json();
      
      // Then mint the NFT on-chain
      const walletClient = createWalletClient({
        chain: baseSepolia,
        transport: custom(window.ethereum)
      });
      
      const [address] = await walletClient.getAddresses();
      
      // Encode the partnerMint function call
      const data = encodeFunctionData({
        abi: CONTRACT_ABI,
        functionName: "partnerMint",
        args: [tokenId]
      });
      
      // Send the transaction
      const hash = await walletClient.sendTransaction({
        account: address,
        to: CONTRACT_ADDRESS,
        data
      });
      
      console.log("Partner mint transaction sent:", hash);
      
      // Show success message
      setSuccess(true);
      
      // Redirect to the certificate page after 3 seconds
      setTimeout(() => {
        navigate(`/certificate/${tokenId}`);
      }, 3000);
      
    } catch (error) {
      console.error("Error minting partner certificate:", error);
      setError(error instanceof Error ? error.message : "Failed to mint certificate");
    } finally {
      setMinting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="animate-spin text-rose-500" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-lg shadow-lg">
        <div className="flex justify-center mb-4">
          <X className="text-red-500" size={48} />
        </div>
        <h2 className="text-xl text-center font-semibold text-red-500 mb-4">Error</h2>
        <p className="text-gray-700 text-center">{error}</p>
        <div className="mt-6 flex justify-center">
          <Button onClick={() => navigate("/")} className="bg-gray-500 hover:bg-gray-600">
            Return Home
          </Button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-12 p-6 bg-white rounded-lg shadow-lg">
        <div className="flex justify-center mb-4">
          <Check className="text-green-500" size={48} />
        </div>
        <h2 className="text-xl text-center font-semibold text-green-500 mb-4">Success!</h2>
        <p className="text-gray-700 text-center">
          You have successfully minted your marriage certificate. Redirecting to view your certificate...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <Card className="bg-white/20 backdrop-blur-xl border border-white/30 transition-all duration-300 hover:shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            <Heart className="text-rose-500" />
            Join Marriage Certificate
          </CardTitle>
        </CardHeader>
        <CardContent>
          {shareData && (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-700 mb-2">You've been invited to join a marriage certificate</h3>
                <p className="text-gray-600">
                  <strong>{shareData.firstPartnerName}</strong> has minted a marriage certificate and invited you to join.
                </p>
              </div>
              
              {certificateImageUrl && (
                <div className="mb-6">
                  <img 
                    src={certificateImageUrl} 
                    alt="Marriage Certificate Preview" 
                    className="w-full rounded-lg shadow-md"
                  />
                </div>
              )}
              
              <div className="mt-6">
                <Button
                  onClick={handleMint}
                  disabled={!authenticated || minting}
                  className="w-full bg-gradient-to-r from-rose-500 to-purple-500 
                  hover:opacity-90 transition-all duration-300 
                  transform hover:scale-105 disabled:opacity-50"
                >
                  {minting ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="animate-spin" size={16} />
                      Minting...
                    </div>
                  ) : (
                    "Join Marriage Certificate"
                  )}
                </Button>
                {!authenticated && (
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    Please connect your wallet to mint your certificate.
                  </p>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default JoinMarriage;