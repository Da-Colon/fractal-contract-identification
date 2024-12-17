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
