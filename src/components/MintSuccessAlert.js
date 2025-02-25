"use client";
import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { useWindowSize } from "@uidotdev/usehooks";
import { X, ExternalLink } from "lucide-react";
import { createPublicClient, http } from "viem";
import { baseSepolia } from "viem/chains";
import CONTRACT_ABI from "../constants/contractAbi";
const CONTRACT_ADDRESS = "0x68a9b61aad98960b6ec11ca433fb3e9ceb19cffe";
const MintSuccessAlert = ({ tokenId, partnerAddress, onClose, }) => {
    const { width, height } = useWindowSize();
    const [showConfetti, setShowConfetti] = useState(true);
    const [nftMetadata, setNftMetadata] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [linkCopied, setLinkCopied] = useState(false);
    const publicClient = createPublicClient({
        chain: baseSepolia,
        transport: http(),
    });
    useEffect(() => {
        const fetchMetadata = async () => {
            setIsLoading(true);
            setError(null);
            try {
                await new Promise((resolve) => setTimeout(resolve, 2000));
                try {
                    const exists = await publicClient.readContract({
                        address: CONTRACT_ADDRESS,
                        abi: CONTRACT_ABI,
                        functionName: "_exists",
                        args: [BigInt(tokenId)],
                    });
                    if (!exists) {
                        console.log("Token does not exist yet");
                        throw new Error("Token not fully minted yet. Please wait a moment.");
                    }
                }
                catch (existsError) {
                    console.log("Error checking if token exists:", existsError);
                }
                try {
                    const marriageDetails = (await publicClient.readContract({
                        address: CONTRACT_ADDRESS,
                        abi: CONTRACT_ABI,
                        functionName: "marriages",
                        args: [BigInt(tokenId)],
                    }));
                    console.log("Marriage details:", marriageDetails);
                    if (marriageDetails) {
                        const metadata = {
                            name: `Marriage Certificate #${tokenId}`,
                            description: "This NFT certifies the marriage between two individuals.",
                            attributes: [
                                {
                                    trait_type: "Partner 1",
                                    value: marriageDetails[0],
                                },
                                {
                                    trait_type: "Partner 2",
                                    value: marriageDetails[1],
                                },
                                {
                                    trait_type: "Location",
                                    value: marriageDetails[2],
                                },
                                {
                                    trait_type: "Officiant",
                                    value: marriageDetails[3],
                                },
                                {
                                    trait_type: "Best Man",
                                    value: marriageDetails[4],
                                },
                                {
                                    trait_type: "Maid of Honor",
                                    value: marriageDetails[5],
                                },
                                {
                                    trait_type: "Date",
                                    value: String(marriageDetails[6]),
                                },
                            ],
                        };
                        setNftMetadata(metadata);
                        return;
                    }
                }
                catch (marriageError) {
                    console.log("Error fetching marriage details:", marriageError);
                }
                const metadataUri = await publicClient.readContract({
                    address: CONTRACT_ADDRESS,
                    abi: CONTRACT_ABI,
                    functionName: "tokenURI",
                    args: [BigInt(tokenId)],
                });
                console.log("Metadata URI:", metadataUri);
                if (typeof metadataUri === "string") {
                    if (metadataUri.startsWith("data:application/json;base64,")) {
                        const base64Data = metadataUri.replace("data:application/json;base64,", "");
                        const jsonString = atob(base64Data);
                        const metadata = JSON.parse(jsonString);
                        console.log("Parsed Base64 Metadata:", metadata);
                        setNftMetadata(metadata);
                    }
                    else {
                        const response = await fetch(metadataUri);
                        const metadata = await response.json();
                        console.log("Fetched Metadata:", metadata);
                        setNftMetadata(metadata);
                    }
                }
                else {
                    throw new Error("Invalid metadata URI format");
                }
            }
            catch (error) {
                console.error("Error fetching NFT metadata:", error);
                setError(error instanceof Error ? error.message : "Failed to load NFT details");
            }
            finally {
                setIsLoading(false);
            }
        };
        if (tokenId) {
            fetchMetadata();
        }
    }, [tokenId]);
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowConfetti(false);
        }, 5000);
        return () => clearTimeout(timer);
    }, []);
    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(`<span class="math-inline">\{window\.location\.origin\}/mint\-partner?tokenId\=</span>{tokenId}`);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2000);
        }
        catch (err) {
            console.error("Failed to copy:", err);
            alert("Failed to copy link. Please try again.");
        }
    };
    return (_jsxs("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4", children: [showConfetti && _jsx(Confetti, { width: width || 0, height: height || 0 }), _jsxs("div", { className: "relative bg-white/90 dark:bg-gray-900/90 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 max-w-md w-full shadow-lg", children: [_jsx("button", { onClick: onClose, className: "absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors", children: _jsx(X, { size: 20, className: "text-gray-600 dark:text-gray-400" }) }), _jsxs("div", { className: "text-center space-y-6", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-800 dark:text-white", children: "\uD83C\uDF89 Mint Successful!" }), isLoading ? (_jsxs("div", { className: "py-8 text-center", children: [_jsx("div", { className: "mx-auto w-12 h-12 border-4 border-gray-200 border-t-rose-500 rounded-full animate-spin" }), _jsx("p", { className: "mt-4 text-gray-600 dark:text-gray-300", children: "Loading NFT details..." })] })) : error ? (_jsxs("div", { className: "py-6 text-center", children: [_jsx("p", { className: "text-red-500 dark:text-red-400", children: error }), _jsx("button", { onClick: () => {
                                            setIsLoading(true);
                                            // Retry fetching after a short delay
                                            setTimeout(async () => {
                                                try {
                                                    const metadataUri = await publicClient.readContract({
                                                        address: CONTRACT_ADDRESS,
                                                        abi: CONTRACT_ABI,
                                                        functionName: "tokenURI",
                                                        args: [BigInt(tokenId)],
                                                    });
                                                    if (typeof metadataUri === "string") {
                                                        if (metadataUri.startsWith("data:application/json;base64,")) {
                                                            // Parse the base64 encoded JSON
                                                            const base64Data = metadataUri.replace("data:application/json;base64,", "");
                                                            const jsonString = atob(base64Data);
                                                            const metadata = JSON.parse(jsonString);
                                                            setNftMetadata(metadata);
                                                            setError(null);
                                                        }
                                                        else {
                                                            const response = await fetch(metadataUri);
                                                            const metadata = await response.json();
                                                            setNftMetadata(metadata);
                                                            setError(null);
                                                        }
                                                    }
                                                }
                                                catch (retryError) {
                                                    console.error("Retry error:", retryError);
                                                    setError("Still unable to fetch NFT data. The blockchain may need more time to process.");
                                                }
                                                finally {
                                                    setIsLoading(false);
                                                }
                                            }, 3000);
                                        }, className: "mt-4 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600", children: "Try Again" })] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "space-y-4", children: [_jsx("p", { className: "text-gray-600 dark:text-gray-300", children: "Your Marriage Certificate NFT has been minted." }), nftMetadata?.image && (_jsx("div", { className: "bg-gray-100 dark:bg-gray-800 p-4 rounded-lg", children: _jsx("img", { src: nftMetadata.image, alt: "NFT Preview", className: "w-full h-48 object-cover rounded-lg" }) })), _jsxs("div", { className: "bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-left", children: [_jsx("h3", { className: "font-semibold text-lg mb-2 text-center", children: nftMetadata?.name || `Marriage Certificate #${tokenId}` }), _jsx("p", { className: "text-sm text-gray-600 dark:text-gray-400 mb-3", children: nftMetadata?.description ||
                                                            "This NFT certifies your marriage on the blockchain." }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "font-medium", children: "Token ID:" }), _jsx("span", { children: tokenId })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "font-medium", children: "Partner Address:" }), _jsx("span", { className: "truncate max-w-[180px]", children: partnerAddress })] }), nftMetadata?.attributes &&
                                                                nftMetadata.attributes.length > 0 && (_jsx("div", { className: "mt-3 pt-3 border-t border-gray-200 dark:border-gray-700", children: nftMetadata.attributes.map((attr, idx) => (_jsxs("div", { className: "flex justify-between text-sm my-1", children: [_jsxs("span", { className: "font-medium", children: [attr.trait_type, ":"] }), _jsx("span", { className: "truncate max-w-[180px]", children: attr.value })] }, idx))) }))] })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsx("button", { onClick: handleCopyLink, className: "w-full bg-gradient-to-r from-rose-500 to-purple-500 text-white font-medium py-3 rounded-full hover:opacity-90 transition-opacity flex items-center justify-center gap-2", children: linkCopied ? "Copied!" : "Copy Partner Minting Link" }), _jsxs("a", { href: `https://sepolia.basescan.org/token/${CONTRACT_ADDRESS}?a=${tokenId}`, target: "_blank", rel: "noopener noreferrer", className: "w-full bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-medium py-3 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2", children: [_jsx(ExternalLink, { size: 16 }), "View on BaseScan"] })] })] }))] })] })] }));
};
export default MintSuccessAlert;
