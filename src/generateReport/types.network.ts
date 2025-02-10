import type { Address, Chain } from "viem";

export type NetworkConfig = {
  chain: Chain;
  alchemyUrl: string;
  factories: {
    address: Address;
    deploymentBlock: bigint;
  }[];
  isTestnet: boolean;
};
