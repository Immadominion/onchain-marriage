"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const lucide_react_1 = require("lucide-react");
const button_1 = require("@/components/ui/button");
const next_themes_1 = require("next-themes");
const react_1 = require("react");
const ThemeSwitch = () => {
    const { theme, setTheme } = (0, next_themes_1.useTheme)();
    const [mounted, setMounted] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        setMounted(true);
    }, []);
    if (!mounted)
        return null;
    return ((0, jsx_runtime_1.jsx)("div", { role: "button", tabIndex: 0, className: "w-16 h-10 rounded-full bg-gray-200 dark:bg-gray-700 relative cursor-pointer flex items-center transition-colors duration-300", onClick: () => setTheme(theme === "dark" ? "light" : "dark"), onKeyDown: (e) => {
            if (e.key === "Enter" || e.key === " ") {
                setTheme(theme === "dark" ? "light" : "dark");
            }
        }, children: (0, jsx_runtime_1.jsx)("div", { className: `
        w-8 h-8 rounded-full bg-white dark:bg-gray-900 shadow-sm flex items-center justify-center
        transition-transform duration-300
        ${theme === "dark" ? "translate-x-8" : "translate-x-1"}
      `, children: theme === "dark" ? ((0, jsx_runtime_1.jsx)(lucide_react_1.Sun, { size: 20, className: "text-yellow-500" })) : ((0, jsx_runtime_1.jsx)(lucide_react_1.Moon, { size: 20, className: "text-gray-600 dark:text-gray-400" })) }) }));
};
const WalletDropdown = ({ address, onLogout, }) => {
    const [isOpen, setIsOpen] = (0, react_1.useState)(false);
    const dropdownRef = (0, react_1.useRef)(null);
    // Close dropdown when clicking outside
    (0, react_1.useEffect)(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current &&
                !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    return ((0, jsx_runtime_1.jsxs)("div", { className: "relative", ref: dropdownRef, children: [(0, jsx_runtime_1.jsxs)("button", { onClick: () => setIsOpen(!isOpen), className: "flex items-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 px-4 py-2 rounded-full transition-colors", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-6 h-6 rounded-full bg-gradient-to-r from-teal-200 to-teal-300" }), (0, jsx_runtime_1.jsxs)("span", { className: "text-sm font-medium text-gray-800 dark:text-gray-200", children: [address?.slice(0, 6), "...", address?.slice(-4)] })] }), isOpen && ((0, jsx_runtime_1.jsx)("div", { className: "absolute right-0 mt-2 w-64 rounded-2xl bg-gray-900 shadow-lg py-2 z-50", children: (0, jsx_runtime_1.jsxs)("div", { className: "px-4 py-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-8 h-8 rounded-full bg-gradient-to-r from-teal-200 to-teal-300" }), (0, jsx_runtime_1.jsxs)("div", { className: "text-base text-white", children: [address?.slice(0, 6), "...", address?.slice(-4)] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2 mt-3 px-3 py-2 text-red-400 hover:bg-gray-800 rounded-xl cursor-pointer", onClick: () => {
                                onLogout();
                                setIsOpen(false);
                            }, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.LogOut, { size: 20 }), (0, jsx_runtime_1.jsx)("span", { children: "Disconnect" })] })] }) }))] }));
};
const Navbar = ({ authenticated, user, onLogin, onLogout, }) => {
    return ((0, jsx_runtime_1.jsx)("nav", { className: "fixed top-0 w-full px-4 py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 z-40", children: (0, jsx_runtime_1.jsxs)("div", { className: "max-w-7xl mx-auto flex justify-between items-center", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex items-center gap-8", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3 group cursor-pointer", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Heart, { className: "text-rose-500 transition-transform group-hover:scale-110", size: 26 }), (0, jsx_runtime_1.jsx)("span", { className: "text-2xl font-bold bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent", children: "Marriage.eth" })] }) }), (0, jsx_runtime_1.jsx)("div", { className: "flex items-center gap-6", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-4", children: [(0, jsx_runtime_1.jsx)(ThemeSwitch, {}), authenticated ? ((0, jsx_runtime_1.jsx)(WalletDropdown, { address: user?.wallet?.address, onLogout: onLogout })) : ((0, jsx_runtime_1.jsxs)(button_1.Button, { onClick: onLogin, className: "bg-gradient-to-r from-rose-500 to-purple-600 rounded-full font-medium shadow-lg hover:shadow-purple-500/20 transition-all duration-300", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Wallet, { size: 18, className: "mr-2" }), "Connect Wallet"] }))] }) })] }) }));
};
exports.default = Navbar;
