"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Heart, Wallet, LogOut, Sun, Moon } from "lucide-react";
import { Button } from "../components/ui/button";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";
const ThemeSwitch = () => {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
    }, []);
    if (!mounted)
        return null;
    return (_jsx("div", { role: "button", tabIndex: 0, className: "w-16 h-10 rounded-full bg-gray-200 dark:bg-gray-700 relative cursor-pointer flex items-center transition-colors duration-300", onClick: () => setTheme(theme === "dark" ? "light" : "dark"), onKeyDown: (e) => {
            if (e.key === "Enter" || e.key === " ") {
                setTheme(theme === "dark" ? "light" : "dark");
            }
        }, children: _jsx("div", { className: `
        w-8 h-8 rounded-full bg-white dark:bg-gray-900 shadow-sm flex items-center justify-center
        transition-transform duration-300
        ${theme === "dark" ? "translate-x-8" : "translate-x-1"}
      `, children: theme === "dark" ? (_jsx(Sun, { size: 20, className: "text-yellow-500" })) : (_jsx(Moon, { size: 20, className: "text-gray-600 dark:text-gray-400" })) }) }));
};
const WalletDropdown = ({ address, onLogout, }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current &&
                !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    return (_jsxs("div", { className: "relative", ref: dropdownRef, children: [_jsxs("button", { onClick: () => setIsOpen(!isOpen), className: "flex items-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 px-4 py-2 rounded-full transition-colors", children: [_jsx("div", { className: "w-6 h-6 rounded-full bg-gradient-to-r from-teal-200 to-teal-300" }), _jsxs("span", { className: "text-sm font-medium text-gray-800 dark:text-gray-200", children: [address?.slice(0, 6), "...", address?.slice(-4)] })] }), isOpen && (_jsx("div", { className: "absolute right-0 mt-2 w-64 rounded-2xl bg-gray-900 shadow-lg py-2 z-50", children: _jsxs("div", { className: "px-4 py-3", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-8 h-8 rounded-full bg-gradient-to-r from-teal-200 to-teal-300" }), _jsxs("div", { className: "text-base text-white", children: [address?.slice(0, 6), "...", address?.slice(-4)] })] }), _jsxs("div", { className: "flex items-center gap-2 mt-3 px-3 py-2 text-red-400 hover:bg-gray-800 rounded-xl cursor-pointer", onClick: () => {
                                onLogout();
                                setIsOpen(false);
                            }, children: [_jsx(LogOut, { size: 20 }), _jsx("span", { children: "Disconnect" })] })] }) }))] }));
};
const Navbar = ({ authenticated, user, onLogin, onLogout, }) => {
    return (_jsx("nav", { className: "fixed top-0 w-full px-4 py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 z-40", children: _jsxs("div", { className: "max-w-7xl mx-auto flex justify-between items-center", children: [_jsx("div", { className: "flex items-center gap-8", children: _jsxs("div", { className: "flex items-center gap-3 group cursor-pointer", children: [_jsx(Heart, { className: "text-rose-500 transition-transform group-hover:scale-110", size: 26 }), _jsx("span", { className: "text-2xl font-bold bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent", children: "Marriage.eth" })] }) }), _jsx("div", { className: "flex items-center gap-6", children: _jsxs("div", { className: "flex items-center gap-4", children: [_jsx(ThemeSwitch, {}), authenticated ? (_jsx(WalletDropdown, { address: user?.wallet?.address, onLogout: onLogout })) : (_jsxs(Button, { onClick: onLogin, className: "bg-gradient-to-r from-rose-500 to-purple-600 rounded-full font-medium shadow-lg hover:shadow-purple-500/20 transition-all duration-300", children: [_jsx(Wallet, { size: 18, className: "mr-2" }), "Connect Wallet"] }))] }) })] }) }));
};
export default Navbar;
