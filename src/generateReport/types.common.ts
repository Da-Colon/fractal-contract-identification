import type { Address } from "viem";
import type { ContractType } from "./types.contract";

export interface DAOData {
  address: Address;
  name: string | null;
  governanceType: "Azorius" | "Multisig";
  owners: Address[];
  guard: Address;
  network: string;
  strategies: {
    address: Address;
    type: ContractType;
  }[];
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
}
