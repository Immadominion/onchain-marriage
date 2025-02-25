"use client";

import { Heart, Copy, Wallet, LogOut, Sun, Moon } from "lucide-react";
import { Button } from "../components/ui/button";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState } from "react";

interface NavbarProps {
  authenticated: boolean;
  user: { wallet?: { address?: string } } | null;
  onLogin: () => void;
  onLogout: () => void;
}

const ThemeSwitch = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div
      role="button"
      tabIndex={0}
      className="w-16 h-10 rounded-full bg-gray-200 dark:bg-gray-700 relative cursor-pointer flex items-center transition-colors duration-300"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          setTheme(theme === "dark" ? "light" : "dark");
        }
      }}
    >
      <div
        className={`
        w-8 h-8 rounded-full bg-white dark:bg-gray-900 shadow-sm flex items-center justify-center
        transition-transform duration-300
        ${theme === "dark" ? "translate-x-8" : "translate-x-1"}
      `}
      >
        {theme === "dark" ? (
          <Sun size={20} className="text-yellow-500" />
        ) : (
          <Moon size={20} className="text-gray-600 dark:text-gray-400" />
        )}
      </div>
    </div>
  );
};

const WalletDropdown = ({
  address,
  onLogout,
}: {
  address?: string;
  onLogout: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 px-4 py-2 rounded-full transition-colors"
      >
        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-teal-200 to-teal-300" />
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-gray-900 shadow-lg py-2 z-50">
          <div className="px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-200 to-teal-300" />
              <div className="text-base text-white">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </div>
            </div>
            <div
              className="flex items-center gap-2 mt-3 px-3 py-2 text-red-400 hover:bg-gray-800 rounded-xl cursor-pointer"
              onClick={() => {
                onLogout();
                setIsOpen(false);
              }}
            >
              <LogOut size={20} />
              <span>Disconnect</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Navbar: React.FC<NavbarProps> = ({
  authenticated,
  user,
  onLogin,
  onLogout,
}) => {
  return (
    <nav className="fixed top-0 w-full px-4 py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 z-40">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 group cursor-pointer">
            <Heart
              className="text-rose-500 transition-transform group-hover:scale-110"
              size={26}
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-rose-500 to-purple-600 bg-clip-text text-transparent">
              Marriage.eth
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <ThemeSwitch />
            {authenticated ? (
              <WalletDropdown
                address={user?.wallet?.address}
                onLogout={onLogout}
              />
            ) : (
              <Button
                onClick={onLogin}
                className="bg-gradient-to-r from-rose-500 to-purple-600 rounded-full font-medium shadow-lg hover:shadow-purple-500/20 transition-all duration-300"
              >
                <Wallet size={18} className="mr-2" />
                Connect Wallet
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
