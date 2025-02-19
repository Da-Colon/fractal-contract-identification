import type { Abi } from "viem";

export type ContractType = {
  isClaimErc20: boolean;
  isFreezeGuardAzorius: boolean;
  isFreezeGuardMultisig: boolean;
  isFreezeVotingErc20: boolean;
  isFreezeVotingErc721: boolean;
  isFreezeVotingMultisig: boolean;
  isLinearVotingErc20: boolean;
  isLinearVotingErc20WithHatsProposalCreation: boolean;
  isLinearVotingErc721: boolean;
  isLinearVotingErc721WithHatsProposalCreation: boolean;
  isModuleAzorius: boolean;
  isModuleFractal: boolean;
  isVotesErc20: boolean;
};

export function getContractType(type: ContractType): string {
  if (type.isLinearVotingErc20) return "ERC20-L";
  if (type.isLinearVotingErc20WithHatsProposalCreation) return "ERC20-LH";
  if (type.isLinearVotingErc721) return "ERC721-L";
  if (type.isLinearVotingErc721WithHatsProposalCreation) return "ERC721-LH";
  // leaving here but don't need just part of tests
  if (type.isModuleAzorius) return "Azorius Module";
  if (type.isModuleFractal) return "Fractal Module";
  if (type.isVotesErc20) return "ERC20 Votes";
  if (type.isFreezeGuardAzorius) return "Azorius Freeze Guard";
  if (type.isFreezeGuardMultisig) return "Multisig Freeze Guard";
  if (type.isFreezeVotingErc20) return "ERC20 Freeze Voting";
  if (type.isFreezeVotingErc721) return "ERC721 Freeze Voting";
  if (type.isFreezeVotingMultisig) return "Multisig Freeze Voting";
  if (type.isClaimErc20) return "ERC20 Claim";
  return "Unknown";
}

export type ContractFunctionTest = {
  // The ABI of the contract to test
  abi: Abi;
  // These functions must not revert when called
  functionNames: string[];
  // These functions must revert when called
  revertFunctionNames?: string[];
  // The key in the result object to set
  resultKey: keyof ContractType;
};
