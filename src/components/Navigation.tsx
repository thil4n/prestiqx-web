import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Crown, Wallet, Calendar, Home, Settings } from "lucide-react";
import { useWallet } from "../ethereum/useWallet";
import { shortenAddress } from "../utils/address";

export const Navigation: React.FC = () => {
    const location = useLocation();
    const { connect, account, isConnected } = useWallet();

    const navItems = [
        { path: "/", label: "Home", icon: Home },
        { path: "/events", label: "Events", icon: Calendar },
        { path: "/my-tickets", label: "My Collection", icon: Wallet },
        { path: "/dashboard", label: "Organizer", icon: Settings },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-lg border-b border-gold/20">
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-3 group">
                        <div className="relative">
                            <Crown className="w-8 h-8 text-gold group-hover:text-yellow-300 transition-colors duration-300" />
                            <div className="absolute -inset-1 bg-gold/20 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-gold via-yellow-300 to-gold bg-clip-text text-transparent">
                            PresTiqx
                        </span>
                    </Link>

                    {/* Nav + Wallet */}
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-8">
                            {navItems.map(({ path, label, icon: Icon }) => (
                                <Link
                                    key={path}
                                    to={path}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                                        location.pathname === path
                                            ? "bg-gold/20 text-gold shadow-lg shadow-gold/25"
                                            : "text-gray-300 hover:text-gold hover:bg-gold/10"
                                    }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="font-medium">{label}</span>
                                </Link>
                            ))}
                        </div>

                        {/* Wallet Button */}
                        {!isConnected ? (
                            <button
                                onClick={connect}
                                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gold text-black font-semibold hover:bg-yellow-300 transition-all"
                            >
                                <Wallet className="w-5 h-5" />
                                <span>Connect Wallet</span>
                            </button>
                        ) : (
                            <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gold/20 text-gold border border-gold/30">
                                <Wallet className="w-5 h-5" />
                                <span className="font-mono text-sm">
                                    {shortenAddress(account!)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};
