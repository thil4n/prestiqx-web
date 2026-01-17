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

/**
 * signerOrProvider can be:
 * - BrowserProvider (read-only)
 * - JsonRpcSigner (write)
 */
export const getEventManagerContract = async (
    signerOrProvider: ethers.BrowserProvider | ethers.JsonRpcSigner
) => {
    let address: string;

    // If it's a signer, get the provider to read network
    let provider: ethers.BrowserProvider;
    if ("getNetwork" in signerOrProvider) {
        provider = signerOrProvider;
    } else {
        provider = signerOrProvider.provider as ethers.BrowserProvider;
    }

    const network = await provider.getNetwork();
    const networkId = network.chainId.toString();

    const deployedNetwork = artifact.networks[networkId];

    if (!deployedNetwork) {
        throw new Error(`EventManager is not deployed on chain ${networkId}`);
    }

    return new ethers.Contract(
        deployedNetwork.address,
        artifact.abi,
        signerOrProvider
    );
};
