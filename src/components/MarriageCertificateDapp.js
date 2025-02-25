"use strict";
"use client";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_auth_1 = require("@privy-io/react-auth");
const next_themes_1 = require("next-themes");
const react_1 = require("react");
const Navbar_1 = __importDefault(require("@/components/Navbar"));
const MintForm_1 = __importDefault(require("@/components/MintForm"));
const MarriageCertificateDapp = () => {
    const { login, logout, user, authenticated } = (0, react_auth_1.usePrivy)();
    const { theme } = (0, next_themes_1.useTheme)();
    const [mounted, setMounted] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        setMounted(true);
    }, []);
    return ((0, jsx_runtime_1.jsxs)("div", { className: `min-h-screen transition-colors duration-300 ${theme === "dark"
            ? "bg-gradient-to-br from-gray-900 to-black text-gray-100"
            : "bg-gradient-to-br from-rose-50 to-indigo-50 text-gray-900"}`, children: [(0, jsx_runtime_1.jsx)(Navbar_1.default, { authenticated: authenticated, user: user, onLogin: login, onLogout: logout }), (0, jsx_runtime_1.jsx)("main", { className: "pt-24 px-4", children: (0, jsx_runtime_1.jsxs)("div", { className: "max-w-4xl mx-auto", children: [(0, jsx_runtime_1.jsxs)("div", { className: "text-center mb-16", children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-5xl font-bold mb-4 bg-gradient-to-r from-rose-500 to-purple-500 bg-clip-text text-transparent", children: "Eternalize Your Love On-Chain" }), (0, jsx_runtime_1.jsx)("p", { className: "text-xl text-gray-600 dark:text-gray-300", children: "Mint your marriage certificate on Base network and make your commitment eternal" })] }), authenticated && user && (0, jsx_runtime_1.jsx)(MintForm_1.default, { authenticated: authenticated, user: user })] }) })] }));
};
exports.default = MarriageCertificateDapp;
