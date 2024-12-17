import { ClaimErc20Abi } from "./abis/ClaimErc20Abi";
import { FreezeGuardAzoriusAbi } from "./abis/FreezeGuardAzoriusAbi";
import { FreezeGuardMultisigAbi } from "./abis/FreezeGuardMultisigAbi";
import { FreezeVotingErc20Abi } from "./abis/FreezeVotingErc20Abi";
import { FreezeVotingErc721Abi } from "./abis/FreezeVotingErc721Abi";
import { FreezeVotingMultisigAbi } from "./abis/FreezeVotingMultisigAbi";
import { LinearVotingErc20Abi } from "./abis/LinearVotingErc20Abi";
import { LinearVotingErc721Abi } from "./abis/LinearVotingErc721Abi";
import { ModuleAzoriusAbi } from "./abis/ModuleAzoriusAbi";
import { ModuleFractalAbi } from "./abis/ModuleFractalAbi";
import { VotesErc20Abi } from "./abis/VotesErc20Abi";
import { VotesErc20WrapperAbi } from "./abis/VotesErc20WrapperAbi";

import type { AddressTest, ContractType, ContractFunctionTest } from "./types";
import type { Abi } from "viem";

function combineAbis(...abis: Abi[]): Abi {
  return abis.flat();
}

export const MASTER_COPY_ADDRESSES: AddressTest[] = [
  // formerly MASTER_COPY_ADDRESSES
  {
    address: "0x0e18C56f0B4153065bD3a3127c61515819e8E4a2",
    expectedType: "isClaimErc20",
  },
  {
    address: "0x43Be57fbe7f255363BE5b7724EbA5513300a6D75",
    expectedType: "isFreezeGuardAzorius",
  },
  {
    address: "0x4B3c155C9bB21F482E894B4321Ac4d2DCF4A6746",
    expectedType: "isFreezeGuardMultisig",
  },
  {
    address: "0x7c5f4c0c171953f43a1F81C5b79B3450bC7AA7a4",
    expectedType: "isFreezeVotingErc20",
  },
  {
    address: "0xC49B7DA5098f6DeAD7Dffe3B5a49b0aA6bE854a9",
    expectedType: "isFreezeVotingErc721",
  },
  {
    address: "0x10Aff1BEB279C6b0077eee0DB2f0Cc9Cedd4c507",
    expectedType: "isFreezeVotingMultisig",
  },
  {
    address: "0xe04BC1f515Af4276d8d3907aBe359DC03b2f141b",
    expectedType: "isLinearVotingErc20",
  },
  {
    address: "0xE3B744725631326162777721Ed37cF32A0928714",
    expectedType: "isLinearVotingErc721",
  },
  {
    address: "0x8D4F390dae8c1F0F3b42199c6c3859aD6C9b3B3D",
    expectedType: "isModuleAzorius",
  },
  {
    address: "0x1B26345a4A41d9f588E1B161b6e8f21D27547184",
    expectedType: "isModuleFractal",
  },
  {
    address: "0x51c852BdF6ed00bAca4225EE940b426a56853ec9",
    expectedType: "isVotesErc20",
  },
  {
    address: "0xc2427b5D77Bd319511672095E9a5A845AA80f979",
    expectedType: "isVotesErc20Wrapper",
  },
];

export const DEFAULT_CONTRACT_TYPE: ContractType = {
  // formerly defaultContractType
  isClaimErc20: false,
  isFreezeGuardAzorius: false,
  isFreezeGuardMultisig: false,
  isFreezeVotingErc20: false,
  isFreezeVotingErc721: false,
  isFreezeVotingMultisig: false,
  isLinearVotingErc20: false,
  isLinearVotingErc721: false,
  isModuleAzorius: false,
  isModuleFractal: false,
  isVotesErc20: false,
  isVotesErc20Wrapper: false,
};

export const CONTRACT_TESTS: ContractFunctionTest[] = [
  // formerly contractTests
  {
    abi: ClaimErc20Abi,
    functionNames: [
      "childERC20",
      "parentERC20",
      "deadlineBlock",
      "funder",
      "owner",
      "parentAllocation",
      "snapShotId",
    ],
    resultKey: "isClaimErc20",
  },
  {
    abi: combineAbis(FreezeGuardAzoriusAbi, FreezeGuardMultisigAbi),
    functionNames: ["freezeVoting", "owner"],
    revertFunctionNames: ["childGnosisSafe", "timelockPeriod", "executionPeriod"],
    resultKey: "isFreezeGuardAzorius",
  },
  {
    abi: FreezeGuardMultisigAbi,
    functionNames: [
      "childGnosisSafe",
      "executionPeriod",
      "freezeVoting",
      "owner",
      "timelockPeriod",
    ],
    resultKey: "isFreezeGuardMultisig",
  },
  {
    abi: FreezeVotingErc20Abi,
    functionNames: [
      "votesERC20",
      "freezePeriod",
      "freezeProposalPeriod",
      "freezeProposalVoteCount",
      "freezeVotesThreshold",
      "isFrozen",
      "owner",
    ],
    resultKey: "isFreezeVotingErc20",
  },
  {
    abi: FreezeVotingErc721Abi,
    functionNames: [
      "strategy",
      "owner",
      "isFrozen",
      "freezeVotesThreshold",
      "freezePeriod",
      "freezeProposalVoteCount",
      "freezeProposalPeriod",
    ],
    resultKey: "isFreezeVotingErc721",
  },
  {
    abi: FreezeVotingMultisigAbi,
    functionNames: [
      "parentGnosisSafe",
      "freezePeriod",
      "freezeProposalPeriod",
      "freezeProposalVoteCount",
      "isFrozen",
      "owner",
    ],
    resultKey: "isFreezeVotingMultisig",
  },
  {
    abi: LinearVotingErc20Abi,
    functionNames: [
      "BASIS_DENOMINATOR",
      "QUORUM_DENOMINATOR",
      "azoriusModule",
      "basisNumerator",
      "governanceToken",
      "owner",
      "quorumNumerator",
      "votingPeriod",
      "requiredProposerWeight",
    ],
    resultKey: "isLinearVotingErc20",
  },
  {
    abi: LinearVotingErc721Abi,
    functionNames: [
      "BASIS_DENOMINATOR",
      "azoriusModule",
      "basisNumerator",
      "getAllTokenAddresses",
      "owner",
      "proposerThreshold",
      "quorumThreshold",
      "votingPeriod",
    ],
    resultKey: "isLinearVotingErc721",
  },
  {
    abi: ModuleAzoriusAbi,
    functionNames: [
      "avatar",
      "target",
      "guard",
      "getGuard",
      "executionPeriod",
      "totalProposalCount",
      "timelockPeriod",
      "owner",
      "DOMAIN_SEPARATOR_TYPEHASH",
      "TRANSACTION_TYPEHASH",
    ],
    resultKey: "isModuleAzorius",
  },
  {
    abi: combineAbis(ModuleFractalAbi, ModuleAzoriusAbi),
    functionNames: ["avatar", "target", "getGuard", "guard", "owner"],
    revertFunctionNames: [
      "timelockPeriod",
      "executionPeriod",
      "totalProposalCount",
      "DOMAIN_SEPARATOR_TYPEHASH",
      "TRANSACTION_TYPEHASH",
    ],
    resultKey: "isModuleFractal",
  },
  {
    abi: combineAbis(VotesErc20Abi, VotesErc20WrapperAbi),
    functionNames: ["decimals", "name", "owner", "symbol", "totalSupply"],
    revertFunctionNames: ["underlying"],
    resultKey: "isVotesErc20",
  },
  {
    abi: VotesErc20WrapperAbi,
    functionNames: ["decimals", "name", "owner", "symbol", "totalSupply", "underlying"],
    resultKey: "isVotesErc20Wrapper",
  },
];
