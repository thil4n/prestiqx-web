import { useEffect, useState } from "react";
import { ethers } from "ethers";

export const useWallet = () => {
    const [account, setAccount] = useState<string | null>(null);
    const [provider, setProvider] = useState<ethers.BrowserProvider | null>(
        null
    );
    const [chainId, setChainId] = useState<number | null>(null);

    const connect = async () => {
        if (!window.ethereum) {
            alert("MetaMask not installed");
            return;
        }

        const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
        });

        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        const network = await browserProvider.getNetwork();

        setAccount(accounts[0]);
        setProvider(browserProvider);
        setChainId(Number(network.chainId));
    };

    const disconnect = () => {
        // MetaMask doesn't truly disconnect
        setAccount(null);
        setProvider(null);
        setChainId(null);
    };

    useEffect(() => {
        if (!window.ethereum) return;

        window.ethereum.on("accountsChanged", (accounts: string[]) => {
            setAccount(accounts.length ? accounts[0] : null);
        });

        window.ethereum.on("chainChanged", (chainId: string) => {
            setChainId(parseInt(chainId, 16));
        });

        return () => {
            window.ethereum.removeAllListeners();
        };
    }, []);

    return {
        account,
        provider,
        chainId,
        connect,
        disconnect,
        isConnected: !!account,
    };
};
