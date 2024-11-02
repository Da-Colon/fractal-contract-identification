import { createPublicClient, http, ContractFunctionExecutionError, Abi, Address } from "viem";
import { sepolia } from "viem/chains";
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

type ContractType = {
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

const defaultContractType: ContractType = {
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

type ContractFunctionTest = {
  abi: Abi;
  functionNames: string[];
  revertFunctionNames?: string[];
  resultKey: keyof ContractType;
};

// Helper function to combine ABIs
function combineAbis(...abis: Abi[]): Abi {
  return abis.flat();
}

const contractTests: ContractFunctionTest[] = [
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
    functionNames: ["DOMAIN_SEPARATOR", "decimals", "name", "owner", "symbol", "totalSupply"],
    revertFunctionNames: ["underlying"],
    resultKey: "isVotesErc20",
  },
  {
    abi: VotesErc20WrapperAbi,
    functionNames: [
      "DOMAIN_SEPARATOR",
      "decimals",
      "name",
      "owner",
      "symbol",
      "totalSupply",
      "underlying",
    ],
    resultKey: "isVotesErc20Wrapper",
  },
];

export async function identifyContract(address: Address): Promise<ContractType> {
  const client = createPublicClient({
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`),
  });

  const result = { ...defaultContractType };

  const allCalls = contractTests.flatMap((test) => [
    ...test.functionNames.map((fn) => ({
      address,
      abi: test.abi,
      functionName: fn,
      args: [],
    })),
    ...(test.revertFunctionNames?.map((fn) => ({
      address,
      abi: test.abi,
      functionName: fn,
      args: [],
    })) ?? []),
  ]);

  const allResults = await client.multicall({
    contracts: allCalls,
  });

  let resultIndex = 0;
  for (const test of contractTests) {
    const successResults = allResults.slice(resultIndex, resultIndex + test.functionNames.length);
    const successPassed = successResults.every((r) => !r.error);
    resultIndex += test.functionNames.length;

    let revertPassed = true;
    if (test.revertFunctionNames?.length) {
      const revertResults = allResults.slice(
        resultIndex,
        resultIndex + test.revertFunctionNames.length
      );
      revertPassed = revertResults.every((r) => r.error);
      resultIndex += test.revertFunctionNames.length;
    }

    result[test.resultKey] = successPassed && revertPassed;
  }

  return result;
}

type AddressTest = {
  address: Address;
  expectedType: keyof ContractType;
};

const testAddresses: AddressTest[] = [
  {
    address: "0x0e20C41E62AFB943d484A96B8cfB536f5c6628Ba",
    expectedType: "isClaimErc20",
  },
  {
    address: "0x7Fd5ddAc1bE02848D646a4c366379b611EBf3a44",
    expectedType: "isFreezeGuardAzorius",
  },
  {
    address: "0x8017FEc7a6158636B5626CF85f632472EbC7200d",
    expectedType: "isFreezeGuardMultisig",
  },
  {
    address: "0xb9D151Bf68BEb6fa126eb98f3ea53b2843960292",
    expectedType: "isFreezeVotingErc20",
  },
  {
    address: "0xe0f5cE9305B648Ec344807d9bFeebCF6D90a9c3B",
    expectedType: "isFreezeVotingErc721",
  },
  {
    address: "0x2d2D4BE19c89083B78e5cf3B831208CD1c1A42c3",
    expectedType: "isFreezeVotingMultisig",
  },
  {
    address: "0x18A298215Ad69e95B6031805F50E929edeb8F317",
    expectedType: "isLinearVotingErc20",
  },
  {
    address: "0xcCdcdE549fa2De58953c4f24388c5263206154FD",
    expectedType: "isLinearVotingErc721",
  },
  {
    address: "0x8ec776a08eCcEAD1Ed62dF0e6012cd3Ab4CF3F5C",
    expectedType: "isModuleAzorius",
  },
  {
    address: "0x7E1b825E1a47fcce2E6F0faa45fb52cF65531d7D",
    expectedType: "isModuleFractal",
  },
  {
    address: "0x75Ca8f34d6FC0Ac4Ff180D61B9ea71c55044B795",
    expectedType: "isVotesErc20",
  },
  {
    address: "0xf019E124745B4Eba96E11AE962D264Df365137D3",
    expectedType: "isVotesErc20Wrapper",
  },
];

const main = async () => {
  console.log("Starting contract identification tests...\n");

  for (const test of testAddresses) {
    console.log(`Testing address: ${test.address}`);
    console.log(`Expected type: ${test.expectedType}`);

    const contractType = await identifyContract(test.address);

    // Count how many types are true
    const trueCount = Object.values(contractType).filter((v) => v).length;

    // Get the matched types
    const matchedTypes = Object.entries(contractType)
      .filter(([_, value]) => value)
      .map(([key]) => key);

    console.log(`Number of matching types: ${trueCount}`);
    console.log(`Matched types: ${matchedTypes.join(", ") || "none"}`);

    // Check if the expected type was matched
    const matchedExpected = contractType[test.expectedType];
    console.log(`Matched expected type: ${matchedExpected ? "✅" : "❌"}`);

    if (!matchedExpected || trueCount !== 1) {
      console.log("⚠️ WARNING: Fingerprint may need adjustment!");
    }

    console.log("\n-------------------\n");
  }
};

main();
