import React, { useState } from "react";
import { useWallet } from "../ethereum/useWallet";
import { getSimpleStorageContract } from "../ethereum/simpleStorage";

export const OrganizerDashboard: React.FC = () => {
    const { provider, account, isConnected } = useWallet();
    const [storedValue, setStoredValue] = useState<number>(0);
    const [inputValue, setInputValue] = useState<number>(0);

    const setData = async () => {
        alert(provider);
        if (!provider) return;
        const contract = await getSimpleStorageContract(provider);
        const tx = await contract.set(inputValue);
        await tx.wait();
        alert("Value stored!");
    };

    const getData = async () => {
        if (!provider) return;
        const contract = await getSimpleStorageContract(provider);
        const value = await contract.get();
        setStoredValue(value.toString());
    };

    return (
        <div className="p-4 mt-60">
            {!isConnected ? (
                <p>Please connect your wallet first.</p>
            ) : (
                <>
                    <h2>SimpleStorage DApp</h2>

                    <div className="flex space-x-2 mt-2">
                        <input
                            type="number"
                            placeholder="Enter value"
                            value={inputValue}
                            onChange={(e) =>
                                setInputValue(Number(e.target.value))
                            }
                            className="border p-2 rounded"
                        />
                        <button
                            onClick={setData}
                            className="bg-gold px-4 py-2 rounded"
                        >
                            Set Value
                        </button>
                    </div>

                    <div className="mt-4">
                        <button
                            onClick={getData}
                            className="bg-gray-800 px-4 py-2 rounded text-gold"
                        >
                            Get Value
                        </button>
                        <p className="mt-2">Stored Value: {storedValue}</p>
                    </div>
                </>
            )}
        </div>
    );
};
