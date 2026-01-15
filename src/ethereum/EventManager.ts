import { ethers } from "ethers";
import EventManagerArtifact from "../contracts/EventManager.json";

type TruffleArtifact = {
    abi: any;
    networks: {
        [chainId: string]: {
            address: string;
        };
    };
};

const artifact = EventManagerArtifact as unknown as TruffleArtifact;

export const getEventManagerContract = async (
    provider: ethers.BrowserProvider
) => {
    const network = await provider.getNetwork();
    const networkId = network.chainId.toString();

    const deployedNetwork = artifact.networks[networkId];

    if (!deployedNetwork) {
        throw new Error(`EventManager is not deployed on chain ${networkId}`);
    }

    const signer = await provider.getSigner();

    return new ethers.Contract(deployedNetwork.address, artifact.abi, signer);
};
