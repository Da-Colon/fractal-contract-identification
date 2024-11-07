import { createPublicClient, http, Abi, Address, PublicClient, Chain } from "viem";
import { sepolia, mainnet, polygon, optimism, base } from "viem/chains";
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

type NetworkConfig = {
  chain: Chain;
  alchemyUrl: string;
  factories: {
    address: Address;
    deploymentBlock: bigint;
  }[];
  masterCopies: {
    address: Address;
    expectedType: keyof ContractType;
  }[];
};

const networks: NetworkConfig[] = [
  {
    chain: base,
    alchemyUrl: "https://base-mainnet.g.alchemy.com/v2",
    factories: [
      {
        address: "0x31Bf73048056fe947B827C0Fe159ACcB5Ae30237",
        deploymentBlock: 12996642n,
      },
      {
        address: "0x000000000000addb49795b0f9ba5bc298cdda236",
        deploymentBlock: 7414414n,
      },
    ],
    masterCopies: [
      {
        address: "0xc3A952B79FdEE28ee6c598ed1411e99d0BBe4D94",
        expectedType: "isClaimErc20",
      },
      {
        address: "0xF45EAc866BAD509B0CD233869b61be8b0BC6dBd8",
        expectedType: "isFreezeGuardAzorius",
      },
      {
        address: "0xcd6c149b3C0FE7284005869fa15080e85887c8F1",
        expectedType: "isFreezeGuardMultisig",
      },
      {
        address: "0xB1011541a6c195540506A0272E4Bb2f53797b477",
        expectedType: "isFreezeVotingErc20",
      },
      {
        address: "0x8F992966AAFbf311A8f2D33b8531476C04af0447",
        expectedType: "isFreezeVotingErc721",
      },
      {
        address: "0xFe376AAD5bB1c3Ce27fb27Ece130F7B0ba8D9642",
        expectedType: "isFreezeVotingMultisig",
      },
      {
        address: "0xdA92DE0BF973De947d0CcEE739E89bA64697e47F",
        expectedType: "isLinearVotingErc20",
      },
      {
        address: "0x6198B4a8E53108F06B768804A16152471EDa471b",
        expectedType: "isLinearVotingErc721",
      },
      {
        address: "0xD16368a8b709cBAfd47c480607a843144Bcd27Dc",
        expectedType: "isModuleAzorius",
      },
      {
        address: "0x87326A981fc56823e26599Ff4D0A4eceAFfF3be0",
        expectedType: "isModuleFractal",
      },
      {
        address: "0x7bE7B12DA74d48E541131DB1626Ee651A2105c45",
        expectedType: "isVotesErc20",
      },
      {
        address: "0x2b67F79f927Be670d44D56338A914BB6d17548C7",
        expectedType: "isVotesErc20Wrapper",
      },
    ],
  },
  {
    chain: optimism,
    alchemyUrl: "https://opt-mainnet.g.alchemy.com/v2",
    factories: [
      {
        address: "0x31Bf73048056fe947B827C0Fe159ACcB5Ae30237",
        deploymentBlock: 118640417n,
      },
      {
        address: "0x000000000000addb49795b0f9ba5bc298cdda236",
        deploymentBlock: 46817372n,
      },
    ],
    masterCopies: [
      {
        address: "0xc3A952B79FdEE28ee6c598ed1411e99d0BBe4D94",
        expectedType: "isClaimErc20",
      },
      {
        address: "0xF45EAc866BAD509B0CD233869b61be8b0BC6dBd8",
        expectedType: "isFreezeGuardAzorius",
      },
      {
        address: "0xcd6c149b3C0FE7284005869fa15080e85887c8F1",
        expectedType: "isFreezeGuardMultisig",
      },
      {
        address: "0xB1011541a6c195540506A0272E4Bb2f53797b477",
        expectedType: "isFreezeVotingErc20",
      },
      {
        address: "0x8F992966AAFbf311A8f2D33b8531476C04af0447",
        expectedType: "isFreezeVotingErc721",
      },
      {
        address: "0xFe376AAD5bB1c3Ce27fb27Ece130F7B0ba8D9642",
        expectedType: "isFreezeVotingMultisig",
      },
      {
        address: "0xdA92DE0BF973De947d0CcEE739E89bA64697e47F",
        expectedType: "isLinearVotingErc20",
      },
      {
        address: "0x6198B4a8E53108F06B768804A16152471EDa471b",
        expectedType: "isLinearVotingErc721",
      },
      {
        address: "0xD16368a8b709cBAfd47c480607a843144Bcd27Dc",
        expectedType: "isModuleAzorius",
      },
      {
        address: "0x87326A981fc56823e26599Ff4D0A4eceAFfF3be0",
        expectedType: "isModuleFractal",
      },
      {
        address: "0x7bE7B12DA74d48E541131DB1626Ee651A2105c45",
        expectedType: "isVotesErc20",
      },
      {
        address: "0x2b67F79f927Be670d44D56338A914BB6d17548C7",
        expectedType: "isVotesErc20Wrapper",
      },
    ],
  },
  {
    chain: polygon,
    alchemyUrl: "https://polygon-mainnet.g.alchemy.com/v2",
    factories: [
      {
        address: "0x537D9E0d8F66C1eEe391C77f5D8a39d00444428c",
        deploymentBlock: 43952877n,
      },
      {
        address: "0x000000000000addb49795b0f9ba5bc298cdda236",
        deploymentBlock: 36581177n,
      },
    ],
    masterCopies: [
      {
        address: "0x8B84158Fc3ab787C2Ab23703dD341a8a0211cEFf",
        expectedType: "isClaimErc20",
      },
      {
        address: "0x090dFe64Bc0A2742605b3Eb8064EF8b199f4C6Ae",
        expectedType: "isFreezeGuardAzorius",
      },
      {
        address: "0xd5c1EdE7dcE48Aa8b16b8a3390b1d8596847C15a",
        expectedType: "isFreezeGuardMultisig",
      },
      {
        address: "0x5026f2A188ef4afd931722Cf79cF272423aBAEb3",
        expectedType: "isFreezeVotingErc20",
      },
      {
        address: "0xaa2361554dCcAd8568798BF5C5A4282D6a7382be",
        expectedType: "isFreezeVotingErc721",
      },
      {
        address: "0xc90bC2F41EC8155F469581A2EC25705fcBCd9beF",
        expectedType: "isFreezeVotingMultisig",
      },
      {
        address: "0x99c55527cE2D3fA6d5D0CB12CD0b8e4d04E0C0A6",
        expectedType: "isLinearVotingErc20",
      },
      {
        address: "0x05DdAbED004C00A2874F68F1e81a8034c4D546FA",
        expectedType: "isLinearVotingErc721",
      },
      {
        address: "0x0C8f5b3986bC2292c7d6B541a0B0aD0637AE3347",
        expectedType: "isModuleAzorius",
      },
      {
        address: "0x13dB2c731DdC76c14E7e4ffEd879C8AacD7eE3b5",
        expectedType: "isModuleFractal",
      },
      {
        address: "0x83C89b1D6282526aA171Ad79CCCa2261FaC5823F",
        expectedType: "isVotesErc20",
      },
      {
        address: "0x19ed1990ffA463bA376b48a1BF65CE978E9aFe26",
        expectedType: "isVotesErc20Wrapper",
      },
    ],
  },
  {
    chain: mainnet,
    alchemyUrl: "https://eth-mainnet.g.alchemy.com/v2",
    factories: [
      {
        address: "0x31Bf73048056fe947B827C0Fe159ACcB5Ae30237",
        deploymentBlock: 17389310n,
      },
      {
        address: "0x000000000000addb49795b0f9ba5bc298cdda236",
        deploymentBlock: 16140611n,
      },
    ],
    masterCopies: [
      {
        address: "0xc3A952B79FdEE28ee6c598ed1411e99d0BBe4D94",
        expectedType: "isClaimErc20",
      },
      {
        address: "0xF45EAc866BAD509B0CD233869b61be8b0BC6dBd8",
        expectedType: "isFreezeGuardAzorius",
      },
      {
        address: "0xcd6c149b3C0FE7284005869fa15080e85887c8F1",
        expectedType: "isFreezeGuardMultisig",
      },
      {
        address: "0xB1011541a6c195540506A0272E4Bb2f53797b477",
        expectedType: "isFreezeVotingErc20",
      },
      {
        address: "0xd71e2bdC28BFa907652Cfb8BeAfdF59822B71B1B",
        expectedType: "isFreezeVotingErc721",
      },
      {
        address: "0xFe376AAD5bB1c3Ce27fb27Ece130F7B0ba8D9642",
        expectedType: "isFreezeVotingMultisig",
      },
      {
        address: "0xdA92DE0BF973De947d0CcEE739E89bA64697e47F",
        expectedType: "isLinearVotingErc20",
      },
      {
        address: "0x75411F04c58C84daBDdEADE7cF6E1c1F40d4B611",
        expectedType: "isLinearVotingErc721",
      },
      {
        address: "0xD16368a8b709cBAfd47c480607a843144Bcd27Dc",
        expectedType: "isModuleAzorius",
      },
      {
        address: "0x87326A981fc56823e26599Ff4D0A4eceAFfF3be0",
        expectedType: "isModuleFractal",
      },
      {
        address: "0x7bE7B12DA74d48E541131DB1626Ee651A2105c45",
        expectedType: "isVotesErc20",
      },
      {
        address: "0x2b67F79f927Be670d44D56338A914BB6d17548C7",
        expectedType: "isVotesErc20Wrapper",
      },
    ],
  },
  {
    chain: sepolia,
    alchemyUrl: "https://eth-sepolia.g.alchemy.com/v2",
    factories: [
      {
        address: "0xE93e4B198097C4CB3A6de594c90031CDaC0B88f3",
        deploymentBlock: 4916639n,
      },
      {
        address: "0x000000000000addb49795b0f9ba5bc298cdda236",
        deploymentBlock: 3059000n,
      },
    ],
    masterCopies: [
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
    ],
  },
];

async function getInstancesForMasterCopy(
  client: PublicClient,
  masterCopyAddress: Address,
  factories: NetworkConfig["factories"]
): Promise<Address[]> {
  const allLogs: any[] = [];

  for (const factory of factories) {
    const logs = await client.getContractEvents({
      address: factory.address,
      abi: ZodiacModuleProxyFactoryAbi,
      eventName: "ModuleProxyCreation",
      args: {
        masterCopy: masterCopyAddress,
      },
      fromBlock: factory.deploymentBlock,
    });
    allLogs.push(...logs);
  }

  return allLogs
    .sort((a, b) => Number(b.blockNumber) - Number(a.blockNumber))
    .map((log) => log.args.proxy as Address);
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

type NetworkStats = {
  networkName: string;
  stats: StatsMap;
};

const main = async () => {
  const allNetworkStats: NetworkStats[] = [];

  for (const network of networks) {
    console.log(`
=================================================================
Contract Type Identification Test Suite - ${network.chain.name}
=================================================================

This test suite uses known contract instances to validate our
contract type detection logic. 

We can gather reliable test data because these contracts are created
through Zodiac Module Proxy Factories. Each proxy instance points to
a specific "master copy" implementation, so we know with certainty
what type each proxy instance should be.

We'll gather instances from ${network.factories.length} factory contract(s):
${network.factories
  .map((f, i) => `${i + 1}. ${f.address} (from block ${f.deploymentBlock})`)
  .join("\n")}
=================================================================\n`);

    const client = createPublicClient({
      chain: network.chain,
      transport: http(`${network.alchemyUrl}/${process.env.ALCHEMY_API_KEY}`),
    });

    console.log("Phase 1: Gathering Test Data\n");
    console.log("Querying factory contracts for instances of each contract type...\n");

    const allInstances = new Map<keyof ContractType, Address[]>();
    let totalInstances = 0;

    for (const masterCopy of network.masterCopies) {
      const instances = await getInstancesForMasterCopy(
        client,
        masterCopy.address,
        network.factories
      );
      allInstances.set(masterCopy.expectedType, instances);
      totalInstances += instances.length;

      console.log(`${masterCopy.expectedType}: ${instances.length} instances found`);
    }

    console.log(`\nTotal test instances found: ${totalInstances}`);
    console.log("\n=================================================================\n");

    if (totalInstances === 0) {
      console.log(`No instances found on ${network.chain.name}, skipping tests.\n`);
      continue;
    }

    console.log("Phase 2: Running Contract Type Detection Tests\n");

    const stats = initializeStats();

    for (const [contractType, instances] of allInstances) {
      console.log(`\nTesting ${contractType} instances:`);
      console.log(`Found ${instances.length} instances to test\n`);

      if (instances.length > 0) {
        for (const instance of instances) {
          const result = await identifyContract(client, instance);
          logTestResults(instance, contractType, result);
          updateStats(stats, contractType, result);
        }
      }

      console.log("\n===================\n");
    }

    // Save the stats for this network
    allNetworkStats.push({
      networkName: network.chain.name,
      stats,
    });
  }

  // Print final statistics for all networks at the end
  console.log("\n=================================================================");
  console.log("Final Statistics Across All Networks:");
  console.log("=================================================================\n");

  for (const networkStats of allNetworkStats) {
    console.log(`\nNetwork: ${networkStats.networkName}`);
    console.log("================");
    Object.entries(networkStats.stats).forEach(([contractType, stat]) => {
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
    console.log("\n-----------------");
  }
};

main();
