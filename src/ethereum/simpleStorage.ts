import { ethers } from "ethers";
import SimpleStorageArtifact from "../contracts/SimpleStorage.json";

type TruffleArtifact = {
    abi: any;
    networks: {
        [chainId: string]: {
            address: string;
        };
    };
};

const artifact = SimpleStorageArtifact as unknown as TruffleArtifact;

export const getSimpleStorageContract = async (
    provider: ethers.BrowserProvider
) => {
    const network = await provider.getNetwork();
    const networkId = network.chainId.toString();

    const deployedNetwork = artifact.networks[networkId];

    if (!deployedNetwork) {
        throw new Error(`SimpleStorage not deployed on chain ${networkId}`);
    }

    const signer = await provider.getSigner();

    return new ethers.Contract(deployedNetwork.address, artifact.abi, signer);
};
