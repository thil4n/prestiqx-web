import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";

interface WalletContextType {
    provider: ethers.BrowserProvider | null;
    account: string | null;
    isConnected: boolean;
    connect: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [provider, setProvider] = useState<ethers.BrowserProvider | null>(
        null
    );
    const [account, setAccount] = useState<string | null>(null);

    const connect = async () => {
        if (!window.ethereum) {
            alert("MetaMask not installed");
            return;
        }

        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(browserProvider);

        const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
        });

        setAccount(accounts[0]);
    };

    useEffect(() => {
        if (!window.ethereum) return;

        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(browserProvider);

        window.ethereum
            .request({ method: "eth_accounts" })
            .then((accounts: string[]) => {
                if (accounts.length) setAccount(accounts[0]);
            });

        const handleAccountsChanged = (accounts: string[]) => {
            setAccount(accounts.length ? accounts[0] : null);
        };

        window.ethereum.on("accountsChanged", handleAccountsChanged);

        return () => {
            window.ethereum.removeListener(
                "accountsChanged",
                handleAccountsChanged
            );
        };
    }, []);

    return (
        <WalletContext.Provider
            value={{
                provider,
                account,
                isConnected: !!account,
                connect,
            }}
        >
            {children}
        </WalletContext.Provider>
    );
};

export const useWallet = () => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error("useWallet must be used within WalletProvider");
    }
    return context;
};
