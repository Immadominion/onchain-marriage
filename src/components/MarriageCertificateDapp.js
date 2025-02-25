"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { usePrivy } from "@privy-io/react-auth";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import MintForm from "../components/MintForm";
const MarriageCertificateDapp = () => {
    const { login, logout, user, authenticated } = usePrivy();
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);
    return (_jsxs("div", { className: `min-h-screen transition-colors duration-300 ${theme === "dark"
            ? "bg-gradient-to-br from-gray-900 to-black text-gray-100"
            : "bg-gradient-to-br from-rose-50 to-indigo-50 text-gray-900"}`, children: [_jsx(Navbar, { authenticated: authenticated, user: user, onLogin: login, onLogout: logout }), _jsx("main", { className: "pt-24 px-4", children: _jsxs("div", { className: "max-w-4xl mx-auto", children: [_jsxs("div", { className: "text-center mb-16", children: [_jsx("h1", { className: "text-5xl font-bold mb-4 bg-gradient-to-r from-rose-500 to-purple-500 bg-clip-text text-transparent", children: "Eternalize Your Love On-Chain" }), _jsx("p", { className: "text-xl text-gray-600 dark:text-gray-300", children: "Mint your marriage certificate on Base network and make your commitment eternal" })] }), authenticated && user && _jsx(MintForm, { authenticated: authenticated, user: user })] }) })] }));
};
export default MarriageCertificateDapp;
