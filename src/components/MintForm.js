"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
const viem_1 = require("viem");
const chains_1 = require("viem/chains");
const card_1 = require("@/components/ui/card");
const button_1 = require("@/components/ui/button");
const input_1 = require("@/components/ui/input");
const contractAbi_1 = __importDefault(require("@/constants/contractAbi"));
const MintSuccessAlert_1 = __importDefault(require("./MintSuccessAlert")); // Import the MintSuccessAlert component
const CONTRACT_ADDRESS = "0x68a9b61aad98960b6ec11ca433fb3e9ceb19cffe";
const FormField = ({ label, value, onChange, placeholder, icon: Icon, }) => ((0, jsx_runtime_1.jsxs)("div", { className: "relative transition-all duration-200 ease-in-out transform hover:scale-[1.02] focus-within:scale-[1.02]", children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-gray-700 mb-1 ml-1", children: label }), (0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [Icon && ((0, jsx_runtime_1.jsx)(Icon, { className: "absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400", size: 20 })), (0, jsx_runtime_1.jsx)(input_1.Input, { type: "text", className: `w-full ${Icon ? "pl-12" : "pl-4"} pr-4 py-3 bg-white/20 backdrop-blur-xl 
        border border-white/30 rounded-xl focus:ring-2 focus:ring-rose-500 
        text-gray-800 transition-all duration-200 ease-in-out`, placeholder: placeholder, value: value, onChange: onChange })] })] }));
const MintForm = ({ authenticated, user }) => {
    const [formData, setFormData] = (0, react_1.useState)({
        partnerAddress: "",
        location: "",
        officiant: "",
        bestMan: "",
        maidOfHonor: "",
    });
    const [isLoading, setIsLoading] = (0, react_1.useState)(false);
    const [mintedTokenId, setMintedTokenId] = (0, react_1.useState)(null);
    const [showSuccessAlert, setShowSuccessAlert] = (0, react_1.useState)(false);
    const [copied, setCopied] = (0, react_1.useState)(false);
    const [error, setError] = (0, react_1.useState)(null);
    const publicClient = (0, viem_1.createPublicClient)({
        chain: chains_1.baseSepolia,
        transport: (0, viem_1.http)(),
    });
    const updateField = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };
    const handleCopyLink = async () => {
        if (!mintedTokenId)
            return;
        const link = `${window.location.origin}/mint-partner?tokenId=${mintedTokenId}`;
        await navigator.clipboard.writeText(link);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    const mintCertificate = async () => {
        if (!user?.wallet?.address || !formData.partnerAddress)
            return;
        setIsLoading(true);
        setError(null);
        setMintedTokenId(null);
        setShowSuccessAlert(false);
        try {
            const walletClient = (0, viem_1.createWalletClient)({
                chain: chains_1.baseSepolia,
                transport: (0, viem_1.custom)(window.ethereum),
            });
            const [address] = await walletClient.getAddresses();
            const data = (0, viem_1.encodeFunctionData)({
                abi: contractAbi_1.default,
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
                chain: chains_1.baseSepolia,
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
                            if (log.address.toLowerCase() === CONTRACT_ADDRESS.toLowerCase()) {
                                const decoded = (0, viem_1.decodeEventLog)({
                                    abi: contractAbi_1.default,
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
                                    }
                                    else {
                                        console.error("Decoded args are undefined.");
                                    }
                                }
                            }
                        }
                        catch (e) {
                            // Skip logs that can't be decoded as our event
                            continue;
                        }
                    }
                }
                catch (e) {
                    console.error("Error decoding logs:", e);
                }
            }
            // Fallback if we couldn't get the tokenId from events
            if (mintedTokenId === null) {
                // Query the marriageByAddress mapping to get the tokenId
                const tokenId = await publicClient.readContract({
                    address: CONTRACT_ADDRESS,
                    abi: contractAbi_1.default,
                    functionName: "marriageByAddress",
                    args: [address],
                });
                if (tokenId && Number(tokenId) > 0) {
                    console.log("Retrieved token ID from contract:", Number(tokenId));
                    setMintedTokenId(Number(tokenId));
                    setShowSuccessAlert(true);
                }
                else {
                    throw new Error("Failed to retrieve token ID");
                }
            }
        }
        catch (error) {
            console.error("Error minting certificate:", error);
            setError("Failed to mint certificate. Please check the console for details.");
        }
        finally {
            setIsLoading(false);
        }
    };
    const isFormValid = Object.values(formData).every((value) => value.trim() !== "");
    return ((0, jsx_runtime_1.jsxs)("div", { className: "max-w-2xl mx-auto p-6 space-y-8 relative", children: [(0, jsx_runtime_1.jsxs)("div", { className: "space-y-6", children: [(0, jsx_runtime_1.jsx)(FormField, { label: "Partner's Ethereum Address", value: formData.partnerAddress, onChange: (e) => updateField("partnerAddress", e.target.value), placeholder: "0x...", icon: lucide_react_1.Search }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [(0, jsx_runtime_1.jsx)(FormField, { label: "Location", value: formData.location, onChange: (e) => updateField("location", e.target.value), placeholder: "City, Country" }), (0, jsx_runtime_1.jsx)(FormField, { label: "Officiant", value: formData.officiant, onChange: (e) => updateField("officiant", e.target.value), placeholder: "Full Name" }), (0, jsx_runtime_1.jsx)(FormField, { label: "Best Man", value: formData.bestMan, onChange: (e) => updateField("bestMan", e.target.value), placeholder: "Full Name" }), (0, jsx_runtime_1.jsx)(FormField, { label: "Maid of Honor", value: formData.maidOfHonor, onChange: (e) => updateField("maidOfHonor", e.target.value), placeholder: "Full Name" })] })] }), error && ((0, jsx_runtime_1.jsxs)("div", { className: "bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative", role: "alert", children: [(0, jsx_runtime_1.jsx)("span", { className: "block sm:inline", children: error }), (0, jsx_runtime_1.jsx)("span", { className: "absolute top-0 bottom-0 right-0 px-4 py-3", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { onClick: () => setError(null), className: "cursor-pointer" }) })] })), (0, jsx_runtime_1.jsxs)(card_1.Card, { className: "bg-white/20 backdrop-blur-xl border border-white/30 transition-all duration-300 hover:shadow-lg", children: [(0, jsx_runtime_1.jsxs)(card_1.CardHeader, { className: "flex flex-row items-center justify-between", children: [(0, jsx_runtime_1.jsxs)(card_1.CardTitle, { className: "text-2xl font-semibold text-gray-800 flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Heart, { className: "text-rose-500" }), "Marriage Certificate"] }), (0, jsx_runtime_1.jsx)(button_1.Button, { onClick: mintCertificate, disabled: !authenticated || !isFormValid || isLoading, className: `bg-gradient-to-r from-rose-500 to-purple-500 
            hover:opacity-90 transition-all duration-300 
            transform hover:scale-105 disabled:opacity-50 
            disabled:hover:scale-100 min-w-[140px]`, children: isLoading ? ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Loader2, { className: "animate-spin", size: 16 }), "Minting..."] })) : ("Mint Certificate") })] }), (0, jsx_runtime_1.jsx)(card_1.CardContent, { children: mintedTokenId ? ((0, jsx_runtime_1.jsx)("div", { className: "space-y-4 animate-fadeIn", children: (0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: handleCopyLink, className: "bg-gradient-to-r from-rose-500 to-purple-500 \n                hover:opacity-90 transition-all duration-300 \n                transform hover:scale-105 flex items-center gap-2", children: [copied ? (0, jsx_runtime_1.jsx)(lucide_react_1.CheckCircle, { size: 16 }) : (0, jsx_runtime_1.jsx)(lucide_react_1.Copy, { size: 16 }), copied ? "Copied!" : "Copy Partner Minting Link"] }) })) : ((0, jsx_runtime_1.jsx)("p", { className: "text-gray-600", children: "Fill in all details to mint your marriage certificate." })) })] }), showSuccessAlert && mintedTokenId && ((0, jsx_runtime_1.jsx)(MintSuccessAlert_1.default, { tokenId: mintedTokenId, partnerAddress: formData.partnerAddress, onClose: () => setShowSuccessAlert(false) })), (0, jsx_runtime_1.jsx)("style", { children: `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      ` })] }));
};
exports.default = MintForm;
