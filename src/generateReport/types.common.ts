import type { Address } from "viem";

export interface DAOData {
  address: Address;
  timeOfSafeCreation: string;
  name: string | null;
  governanceType: "Azorius" | "Multisig";
  owners: Address[];
  guard: Address;
  network: string;
  strategies: ("ERC20-L" | "ERC20-LH" | "ERC721-L" | "ERC721-LH")[];
  totalTokenBalance: number;
  totalTokenBalanceFrmt: string;
  tokens: {
    address: Address;
    symbol: string | null;
    usdBalance: number | undefined;
    usdPrice: string | undefined;
    logo: string | null;
    name: string | null;
  }[];
  proposalCount: number;
  uniqueUsers: Address[];
  votesCount: number;
}
