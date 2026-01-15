import { useEffect, useState } from "react";
import { ethers } from "ethers";

export const useWallet = () => {
    const [account, setAccount] = useState<string | null>(null);
    const [provider, setProvider] = useState<ethers.BrowserProvider | null>(
        null
    );

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
        if (accounts.length > 0) setAccount(accounts[0]);
    };

    useEffect(() => {
        if (!window.ethereum) return;

        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(browserProvider);

        const handleAccountsChanged = (accounts: string[]) => {
            setAccount(accounts.length ? accounts[0] : null);
        };

        window.ethereum.on("accountsChanged", handleAccountsChanged);

        window.ethereum
            .request({ method: "eth_accounts" })
            .then((accounts: string[]) => {
                if (accounts.length > 0) setAccount(accounts[0]);
            });

        return () => {
            window.ethereum.removeListener(
                "accountsChanged",
                handleAccountsChanged
            );
        };
    }, []);

    return {
        account,
        provider,
        connect,
        isConnected: !!account,
    };
};
