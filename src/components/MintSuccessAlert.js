"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_confetti_1 = __importDefault(require("react-confetti"));
const usehooks_1 = require("@uidotdev/usehooks");
const lucide_react_1 = require("lucide-react");
const viem_1 = require("viem");
const chains_1 = require("viem/chains");
const contractAbi_1 = __importDefault(require("@/constants/contractAbi"));
const CONTRACT_ADDRESS = "0x68a9b61aad98960b6ec11ca433fb3e9ceb19cffe";
const MintSuccessAlert = ({ tokenId, partnerAddress, onClose, }) => {
    const { width, height } = (0, usehooks_1.useWindowSize)();
    const [showConfetti, setShowConfetti] = (0, react_1.useState)(true);
    const [nftMetadata, setNftMetadata] = (0, react_1.useState)(null);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    const [error, setError] = (0, react_1.useState)(null);
    const [linkCopied, setLinkCopied] = (0, react_1.useState)(false);
    const publicClient = (0, viem_1.createPublicClient)({
        chain: chains_1.baseSepolia,
        transport: (0, viem_1.http)(),
    });
    (0, react_1.useEffect)(() => {
        const fetchMetadata = async () => {
            setIsLoading(true);
            setError(null);
            try {
                await new Promise((resolve) => setTimeout(resolve, 2000));
                try {
                    const exists = await publicClient.readContract({
                        address: CONTRACT_ADDRESS,
                        abi: contractAbi_1.default,
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
                        abi: contractAbi_1.default,
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
                    abi: contractAbi_1.default,
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
    (0, react_1.useEffect)(() => {
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
    return ((0, jsx_runtime_1.jsxs)("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4", children: [showConfetti && (0, jsx_runtime_1.jsx)(react_confetti_1.default, { width: width || 0, height: height || 0 }), (0, jsx_runtime_1.jsxs)("div", { className: "relative bg-white/90 dark:bg-gray-900/90 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 max-w-md w-full shadow-lg", children: [(0, jsx_runtime_1.jsx)("button", { onClick: onClose, className: "absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 20, className: "text-gray-600 dark:text-gray-400" }) }), (0, jsx_runtime_1.jsxs)("div", { className: "text-center space-y-6", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-2xl font-bold text-gray-800 dark:text-white", children: "\uD83C\uDF89 Mint Successful!" }), isLoading ? ((0, jsx_runtime_1.jsxs)("div", { className: "py-8 text-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "mx-auto w-12 h-12 border-4 border-gray-200 border-t-rose-500 rounded-full animate-spin" }), (0, jsx_runtime_1.jsx)("p", { className: "mt-4 text-gray-600 dark:text-gray-300", children: "Loading NFT details..." })] })) : error ? ((0, jsx_runtime_1.jsxs)("div", { className: "py-6 text-center", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-red-500 dark:text-red-400", children: error }), (0, jsx_runtime_1.jsx)("button", { onClick: () => {
                                            setIsLoading(true);
                                            // Retry fetching after a short delay
                                            setTimeout(async () => {
                                                try {
                                                    const metadataUri = await publicClient.readContract({
                                                        address: CONTRACT_ADDRESS,
                                                        abi: contractAbi_1.default,
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
                                        }, className: "mt-4 px-4 py-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600", children: "Try Again" })] })) : ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsxs)("div", { className: "space-y-4", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-gray-600 dark:text-gray-300", children: "Your Marriage Certificate NFT has been minted." }), nftMetadata?.image && ((0, jsx_runtime_1.jsx)("div", { className: "bg-gray-100 dark:bg-gray-800 p-4 rounded-lg", children: (0, jsx_runtime_1.jsx)("img", { src: nftMetadata.image, alt: "NFT Preview", className: "w-full h-48 object-cover rounded-lg" }) })), (0, jsx_runtime_1.jsxs)("div", { className: "bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-left", children: [(0, jsx_runtime_1.jsx)("h3", { className: "font-semibold text-lg mb-2 text-center", children: nftMetadata?.name || `Marriage Certificate #${tokenId}` }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-gray-600 dark:text-gray-400 mb-3", children: nftMetadata?.description ||
                                                            "This NFT certifies your marriage on the blockchain." }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-2", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between text-sm", children: [(0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: "Token ID:" }), (0, jsx_runtime_1.jsx)("span", { children: tokenId })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between text-sm", children: [(0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: "Partner Address:" }), (0, jsx_runtime_1.jsx)("span", { className: "truncate max-w-[180px]", children: partnerAddress })] }), nftMetadata?.attributes &&
                                                                nftMetadata.attributes.length > 0 && ((0, jsx_runtime_1.jsx)("div", { className: "mt-3 pt-3 border-t border-gray-200 dark:border-gray-700", children: nftMetadata.attributes.map((attr, idx) => ((0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between text-sm my-1", children: [(0, jsx_runtime_1.jsxs)("span", { className: "font-medium", children: [attr.trait_type, ":"] }), (0, jsx_runtime_1.jsx)("span", { className: "truncate max-w-[180px]", children: attr.value })] }, idx))) }))] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-3", children: [(0, jsx_runtime_1.jsx)("button", { onClick: handleCopyLink, className: "w-full bg-gradient-to-r from-rose-500 to-purple-500 text-white font-medium py-3 rounded-full hover:opacity-90 transition-opacity flex items-center justify-center gap-2", children: linkCopied ? "Copied!" : "Copy Partner Minting Link" }), (0, jsx_runtime_1.jsxs)("a", { href: `https://sepolia.basescan.org/token/${CONTRACT_ADDRESS}?a=${tokenId}`, target: "_blank", rel: "noopener noreferrer", className: "w-full bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-medium py-3 rounded-full hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.ExternalLink, { size: 16 }), "View on BaseScan"] })] })] }))] })] })] }));
};
exports.default = MintSuccessAlert;
