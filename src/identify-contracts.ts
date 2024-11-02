import {
  createPublicClient,
  http,
  ContractFunctionExecutionError,
  Abi,
  Address,
  getContract,
  PublicClient,
} from "viem";
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
import { ZodiacModuleProxyFactoryAbi } from "./abis/ZodiacModuleProxyFactoryAbi";

const zodiacModuleProxyFactoryAddress = "0xE93e4B198097C4CB3A6de594c90031CDaC0B88f3";
const zodiacModuleProxyFactoryDeploymentBlock = 4916639n;
const zodiacModuleProxyFactoryAddress2 = "0x000000000000addb49795b0f9ba5bc298cdda236";
const ZodiacModuleProxyFactoryDeploymentBlock2 = 3059000n;

type AddressTest = {
  address: Address;
  expectedType: keyof ContractType;
};

const masterCopies: AddressTest[] = [
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

export async function identifyContract(
  client: PublicClient,
  address: Address
): Promise<ContractType> {
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

async function getInstancesForMasterCopy(
  client: PublicClient,
  masterCopyAddress: Address
): Promise<Address[]> {
  // Get instances from first factory
  const logs1 = await client.getContractEvents({
    address: zodiacModuleProxyFactoryAddress,
    abi: ZodiacModuleProxyFactoryAbi,
    eventName: "ModuleProxyCreation",
    args: {
      masterCopy: masterCopyAddress,
    },
    fromBlock: zodiacModuleProxyFactoryDeploymentBlock,
  });

  // Get instances from second factory
  const logs2 = await client.getContractEvents({
    address: zodiacModuleProxyFactoryAddress2,
    abi: ZodiacModuleProxyFactoryAbi,
    eventName: "ModuleProxyCreation",
    args: {
      masterCopy: masterCopyAddress,
    },
    fromBlock: ZodiacModuleProxyFactoryDeploymentBlock2,
  });

  // Combine and sort all logs by block number (most recent first)
  const allLogs = [...logs1, ...logs2].sort(
    (a, b) => Number(b.blockNumber) - Number(a.blockNumber)
  );

  // Extract proxy addresses
  return allLogs.map((log) => log.args.proxy!);
}

type TestStats = {
  totalTests: number;
  exactMatches: number;
  noMatches: number;
  multipleMatches: number;
};

type StatsMap = {
  [K in keyof ContractType]: TestStats;
};

function initializeStats(): StatsMap {
  return Object.keys(defaultContractType).reduce((acc, key) => {
    acc[key] = {
      totalTests: 0,
      exactMatches: 0,
      noMatches: 0,
      multipleMatches: 0,
    };
    return acc;
  }, {} as StatsMap);
}

function logTestResults(address: Address, expectedType: keyof ContractType, result: ContractType) {
  const trueCount = Object.values(result).filter((v) => v).length;
  const matchedTypes = Object.entries(result)
    .filter(([_, value]) => value)
    .map(([key]) => key);
  const matchedExpected = result[expectedType];

  console.log(
    `${address}: expected=${expectedType}, matches=${trueCount} (${
      matchedTypes.join(", ") || "none"
    }) ${matchedExpected ? "✅" : "❌"}${!matchedExpected || trueCount !== 1 ? " ⚠️" : ""}`
  );
}

function updateStats(stats: StatsMap, expectedType: keyof ContractType, result: ContractType) {
  const trueCount = Object.values(result).filter((v) => v).length;
  const matchedExpected = result[expectedType];

  stats[expectedType].totalTests++;

  if (trueCount === 0) {
    stats[expectedType].noMatches++;
  } else if (trueCount === 1 && matchedExpected) {
    stats[expectedType].exactMatches++;
  } else {
    stats[expectedType].multipleMatches++;
  }
}

const main = async () => {
  console.log(`
=================================================================
Contract Type Identification Test Suite
=================================================================

This test suite uses known contract instances to validate our
contract type detection logic. 

We can gather reliable test data because these contracts are created
through Zodiac Module Proxy Factories. Each proxy instance points to
a specific "master copy" implementation, so we know with certainty
what type each proxy instance should be.

We'll gather instances from two factory contracts:
1. ${zodiacModuleProxyFactoryAddress} (Decent's deployment, which we started with)
2. ${zodiacModuleProxyFactoryAddress2} (Zodiac's deployment, which we switched to)

=================================================================\n`);

  const client = createPublicClient({
    chain: sepolia,
    transport: http(`https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`),
  });

  console.log("Phase 1: Gathering Test Data\n");
  console.log("Querying factory contracts for instances of each contract type...\n");

  const allInstances = new Map<keyof ContractType, Address[]>();
  let totalInstances = 0;

  for (const masterCopy of masterCopies) {
    const instances = await getInstancesForMasterCopy(client, masterCopy.address);
    allInstances.set(masterCopy.expectedType, instances);
    totalInstances += instances.length;

    console.log(`${masterCopy.expectedType}: ${instances.length} instances found`);
  }

  console.log(`\nTotal test instances found: ${totalInstances}`);
  console.log("\n=================================================================\n");
  console.log("Phase 2: Running Contract Type Detection Tests\n");

  // Now proceed with testing
  const stats = initializeStats();

  for (const [contractType, instances] of allInstances) {
    console.log(`Testing ${contractType} instances:\n`);
    console.log(`Found ${instances.length} instances to test\n`);

    if (instances.length > 0) {
      for (const instance of instances) {
        const result = await identifyContract(client, instance);
        logTestResults(instance, contractType, result);
        updateStats(stats, contractType, result);
      }
    } else {
      console.log("No instances found to test");
    }

    console.log("\n===================\n");
  }

  // Print final statistics
  console.log("\nFinal Statistics:");
  console.log("================");
  Object.entries(stats).forEach(([contractType, stat]) => {
    if (stat.totalTests > 0) {
      const allPassed = stat.exactMatches === stat.totalTests;
      console.log(`\n${contractType}: ${allPassed ? "✅" : "❌"}`);
      console.log(`  Total tests: ${stat.totalTests}`);
      console.log(
        `  Exact matches: ${stat.exactMatches} (${(
          (stat.exactMatches / stat.totalTests) *
          100
        ).toFixed(1)}%)`
      );
      console.log(
        `  No matches: ${stat.noMatches} (${((stat.noMatches / stat.totalTests) * 100).toFixed(
          1
        )}%)`
      );
      console.log(
        `  Multiple matches: ${stat.multipleMatches} (${(
          (stat.multipleMatches / stat.totalTests) *
          100
        ).toFixed(1)}%)`
      );
    }
  });
};

main();
