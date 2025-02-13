import { base, optimism, polygon, mainnet, sepolia } from "viem/chains";
import type { NetworkConfig } from "./types.network";
import { getFactories } from "./helpers.contract";

export function parseNetworksArg(): string {
  const networksArg = process.argv.find((arg) => arg.startsWith("--networks="));
  return networksArg ? networksArg.split("=")[1] : "all";
}

export function filterNetworks(networks: NetworkConfig[], filter: string): NetworkConfig[] {
  switch (filter) {
    case "testnets":
      return networks.filter((n) => n.isTestnet);
    case "mainnets":
      return networks.filter((n) => !n.isTestnet);
    case "all":
    default:
      return networks;
  }
}

function getAlchemyUrl(chainId: number): string {
  switch (chainId) {
    case 1:
      return "https://eth-mainnet.g.alchemy.com/v2";
    case 11155111:
      return "https://eth-sepolia.g.alchemy.com/v2";
    case 10:
      return "https://opt-mainnet.g.alchemy.com/v2";
    case 137:
      return "https://polygon-mainnet.g.alchemy.com/v2";
    case 8453:
      return "https://base-mainnet.g.alchemy.com/v2";
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
}

export function getNetworkConfig() {
  return [base, optimism, polygon, mainnet, sepolia].map((chain) => {
    const chainId = chain.id;
    return {
      chain,
      alchemyUrl: `${getAlchemyUrl(chainId)}/${process.env.ALCHEMY_API_KEY}`,
      factories: getFactories(chainId),
      isTestnet: !!chain.testnet,
    };
  });
}

export function getSpecificNetworkConfig(chainId: number) {
  const network = getNetworkConfig().find((n) => n.chain.id === chainId);
  if (!network) throw new Error(`Network with chain ID ${chainId} not found`);
  return network;
}
