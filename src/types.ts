import type { Address, Abi, Chain } from "viem";

export type AddressTest = {
  address: Address;
  expectedType: keyof ContractType;
};

export type ContractType = {
  isClaimErc20: boolean;
  isFreezeGuardAzorius: boolean;
  isFreezeGuardMultisig: boolean;
  isFreezeVotingErc20: boolean;
  isFreezeVotingErc721: boolean;
  isFreezeVotingMultisig: boolean;
  isLinearVotingErc20: boolean;
  isLinearVotingErc721: boolean;
  isModuleAzorius: boolean;
  isModuleFractal: boolean;
  isVotesErc20: boolean;
  isVotesErc20Wrapper: boolean;
};

export type ContractFunctionTest = {
  abi: Abi;
  functionNames: string[];
  revertFunctionNames?: string[];
  resultKey: keyof ContractType;
};

export type NetworkConfig = {
  chain: Chain;
  alchemyUrl: string;
  factories: {
    address: Address;
    deploymentBlock: bigint;
  }[];
  MASTER_COPY_ADDRESSES: {
    address: Address;
    expectedType: keyof ContractType;
  }[];
  isTestnet: boolean;
};

export type TestStats = {
  totalTests: number;
  exactMatches: number;
  noMatches: number;
  multipleMatches: number;
};

export type StatsMap = {
  [K in keyof ContractType]: TestStats;
};

export type NetworkStats = {
  networkName: string;
  stats: StatsMap;
};
