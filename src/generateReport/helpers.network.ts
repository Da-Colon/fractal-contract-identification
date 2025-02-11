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

export function getNetworkConfig() {
  return [base, optimism, polygon, mainnet, sepolia].map((chain) => {
    const chainId = chain.id;
    return {
      chain,
      alchemyUrl: `https://eth-${chain.name === "Base" ? "b" : chain.name}.g.alchemy.com/v2`,
      factories: getFactories(chainId),
      isTestnet: chain.name !== "Ethereum",
    };
  });
}
