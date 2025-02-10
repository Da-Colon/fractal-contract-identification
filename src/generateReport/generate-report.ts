import { ZodiacModuleProxyFactoryAbi } from "@/abis/ZodiacModuleProxyFactoryAbi";
import { abis, addresses } from "@fractal-framework/fractal-contracts";
import {
  type Abi,
  type Address,
  type Chain,
  createPublicClient,
  http,
  type PublicClient,
} from "viem";
import { base, optimism, polygon, mainnet, sepolia } from "viem/chains";

type ContractType = {
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

function findMasterCopyType(contractName: string): keyof ContractType {
  switch (contractName) {
    case "ERC20Claim":
      return "isClaimErc20";
    case "AzoriusFreezeGuard":
    case "MultisigFreezeGuard":
      return "isFreezeGuardAzorius";
    case "MultisigFreezeGuard":
      return "isFreezeGuardMultisig";
    case "ERC20FreezeVoting":
      return "isFreezeVotingErc20";
    case "ERC721FreezeVoting":
      return "isFreezeVotingErc721";
    case "MultisigFreezeVoting":
      return "isFreezeVotingMultisig";
    case "LinearERC20Voting":
      return "isLinearVotingErc20";
    case "LinearERC20VotingWithHatsProposalCreation":
      return "isLinearVotingErc20WithHatsProposalCreation";
    case "LinearERC721Voting":
      return "isLinearVotingErc721";
    case "LinearERC721VotingWithHatsProposalCreation":
      return "isLinearVotingErc721WithHatsProposalCreation";
    case "Azorius":
      return "isModuleAzorius";
    case "FractalModule":
      return "isModuleFractal";
    case "VotesERC20":
      return "isVotesErc20";
  }
  throw new Error(`Unknown contract name: ${contractName}`);
}

function getFactories(chainId: Number): { address: Address; deploymentBlock: bigint }[] {
  switch (chainId) {
    case 1:
      return [
        {
          address: "0x31Bf73048056fe947B827C0Fe159ACcB5Ae30237",
          deploymentBlock: 17389310n,
        },
        {
          address: "0x000000000000addb49795b0f9ba5bc298cdda236",
          deploymentBlock: 16140611n,
        },
      ];
    case 10:
      return [
        {
          address: "0x31Bf73048056fe947B827C0Fe159ACcB5Ae30237",
          deploymentBlock: 118640417n,
        },
        {
          address: "0x000000000000addb49795b0f9ba5bc298cdda236",
          deploymentBlock: 46817372n,
        },
      ];
    case 137:
      return [
        {
          address: "0x537D9E0d8F66C1eEe391C77f5D8a39d00444428c",
          deploymentBlock: 43952877n,
        },
        {
          address: "0x000000000000addb49795b0f9ba5bc298cdda236",
          deploymentBlock: 36581177n,
        },
      ];
    case 8543:
      return [
        {
          address: "0x31Bf73048056fe947B827C0Fe159ACcB5Ae30237",
          deploymentBlock: 12996642n,
        },
        {
          address: "0x000000000000addb49795b0f9ba5bc298cdda236",
          deploymentBlock: 7414414n,
        },
      ];
    case 11155111:
      return [
        {
          address: "0xE93e4B198097C4CB3A6de594c90031CDaC0B88f3",
          deploymentBlock: 4916639n,
        },
        {
          address: "0x000000000000addb49795b0f9ba5bc298cdda236",
          deploymentBlock: 3059000n,
        },
      ];

    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
}

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
  isLinearVotingErc20WithHatsProposalCreation: false,
  isLinearVotingErc721WithHatsProposalCreation: false,
};

type ContractFunctionTest = {
  // The ABI of the contract to test
  abi: Abi;
  // These functions must not revert when called
  functionNames: string[];
  // These functions must revert when called
  revertFunctionNames?: string[];
  // The key in the result object to set
  resultKey: keyof ContractType;
};

function combineAbis(...abisToCombine: Abi[]): Abi {
  return abisToCombine.flat();
}

const contractTests: ContractFunctionTest[] = [
  // {
  //   abi: abis.ERC20Claim,
  //   functionNames: [
  //     "childERC20",
  //     "parentERC20",
  //     "deadlineBlock",
  //     "funder",
  //     "owner",
  //     "parentAllocation",
  //     "snapShotId",
  //   ],
  //   resultKey: "isClaimErc20",
  // },
  // {
  //   abi: combineAbis(abis.AzoriusFreezeGuard, abis.MultisigFreezeGuard),
  //   functionNames: ["freezeVoting", "owner"],
  //   revertFunctionNames: ["childGnosisSafe", "timelockPeriod", "executionPeriod"],
  //   resultKey: "isFreezeGuardAzorius",
  // },
  // {
  //   abi: abis.MultisigFreezeGuard,
  //   functionNames: [
  //     "childGnosisSafe",
  //     "executionPeriod",
  //     "freezeVoting",
  //     "owner",
  //     "timelockPeriod",
  //   ],
  //   resultKey: "isFreezeGuardMultisig",
  // },
  // {
  //   abi: abis.ERC20FreezeVoting,
  //   functionNames: [
  //     "votesERC20",
  //     "freezePeriod",
  //     "freezeProposalPeriod",
  //     "freezeProposalVoteCount",
  //     "freezeVotesThreshold",
  //     "isFrozen",
  //     "owner",
  //   ],
  //   resultKey: "isFreezeVotingErc20",
  // },
  // {
  //   abi: abis.ERC721FreezeVoting,
  //   functionNames: [
  //     "strategy",
  //     "owner",
  //     "isFrozen",
  //     "freezeVotesThreshold",
  //     "freezePeriod",
  //     "freezeProposalVoteCount",
  //     "freezeProposalPeriod",
  //   ],
  //   resultKey: "isFreezeVotingErc721",
  // },
  // {
  //   abi: abis.MultisigFreezeVoting,
  //   functionNames: [
  //     "parentGnosisSafe",
  //     "freezePeriod",
  //     "freezeProposalPeriod",
  //     "freezeProposalVoteCount",
  //     "isFrozen",
  //     "owner",
  //   ],
  //   resultKey: "isFreezeVotingMultisig",
  // },
  // {
  //   abi: combineAbis(abis.LinearERC20Voting, abis.LinearERC20VotingWithHatsProposalCreation),
  //   revertFunctionNames: ["getWhitelistedHatIds"],
  //   functionNames: [
  //     "BASIS_DENOMINATOR",
  //     "QUORUM_DENOMINATOR",
  //     "azoriusModule",
  //     "basisNumerator",
  //     "governanceToken",
  //     "owner",
  //     "quorumNumerator",
  //     "votingPeriod",
  //     "requiredProposerWeight",
  //   ],
  //   resultKey: "isLinearVotingErc20",
  // },
  // {
  //   abi: abis.LinearERC20VotingWithHatsProposalCreation,
  //   functionNames: [
  //     "BASIS_DENOMINATOR",
  //     "QUORUM_DENOMINATOR",
  //     "azoriusModule",
  //     "basisNumerator",
  //     "governanceToken",
  //     "owner",
  //     "quorumNumerator",
  //     "votingPeriod",
  //     "requiredProposerWeight",
  //     "getWhitelistedHatIds",
  //   ],
  //   resultKey: "isLinearVotingErc20WithHatsProposalCreation",
  // },
  // {
  //   abi: combineAbis(abis.LinearERC721Voting, abis.LinearERC721VotingWithHatsProposalCreation),
  //   revertFunctionNames: ["getWhitelistedHatIds"],
  //   functionNames: [
  //     "BASIS_DENOMINATOR",
  //     "azoriusModule",
  //     "basisNumerator",
  //     "getAllTokenAddresses",
  //     "owner",
  //     "proposerThreshold",
  //     "quorumThreshold",
  //     "votingPeriod",
  //   ],
  //   resultKey: "isLinearVotingErc721",
  // },
  // {
  //   abi: abis.LinearERC721VotingWithHatsProposalCreation,
  //   functionNames: [
  //     "BASIS_DENOMINATOR",
  //     "azoriusModule",
  //     "basisNumerator",
  //     "getAllTokenAddresses",
  //     "owner",
  //     "proposerThreshold",
  //     "quorumThreshold",
  //     "votingPeriod",
  //     "getWhitelistedHatIds",
  //   ],
  //   resultKey: "isLinearVotingErc721WithHatsProposalCreation",
  // },
  {
    abi: abis.Azorius,
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
  // {
  //   abi: combineAbis(abis.FractalModule, abis.Azorius),
  //   functionNames: ["avatar", "target", "getGuard", "guard", "owner"],
  //   revertFunctionNames: [
  //     "timelockPeriod",
  //     "executionPeriod",
  //     "totalProposalCount",
  //     "DOMAIN_SEPARATOR_TYPEHASH",
  //     "TRANSACTION_TYPEHASH",
  //   ],
  //   resultKey: "isModuleFractal",
  // },
  // {
  //   abi: combineAbis(abis.VotesERC20, abis.VotesERC20Wrapper),
  //   functionNames: ["decimals", "name", "owner", "symbol", "totalSupply"],
  //   revertFunctionNames: ["underlying"],
  //   resultKey: "isVotesErc20",
  // },
];

export type NetworkConfig = {
  chain: Chain;
  alchemyUrl: string;
  factories: {
    address: Address;
    deploymentBlock: bigint;
  }[];
  isTestnet: boolean;
};

export function parseNetworksArg(): string {
  const networksArg = process.argv.find((arg) => arg.startsWith("--networks="));
  return networksArg ? networksArg.split("=")[1] : "all";
}

export function filterNetworks(networks: NetworkConfig[], filter: string): NetworkConfig[] {
  switch (filter) {
    case "testnets":
      return networks.filter((n) => n.isTestnet);
    case "mainnets":
      return networks.filter((n) => !n.isTestnet);
    case "all":
    default:
      return networks;
  }
}

const networkConfigs = [base, optimism, polygon, mainnet, sepolia].map((chain) => {
  const chainId = chain.id;
  // const contractAddresses = Object.entries(addresses[chainId]).map(([contractName, address]) => ({
  //   address: address as Address,
  //   expectedType: findMasterCopyType(contractName),
  // }));
  return {
    chain,
    alchemyUrl: `https://eth-${chain.name === "Base" ? "b" : chain.name}.g.alchemy.com/v2`,
    factories: getFactories(chainId),
    isTestnet: chain.name !== "Ethereum",
  };
});

async function getInstancesForMasterCopy(
  client: PublicClient,
  masterCopyAddress: Address,
  factories: NetworkConfig["factories"],
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

async function main() {
  console.log("Generating report...");
  const networksFilter = parseNetworksArg();
  const filteredNetworks = filterNetworks(networkConfigs, networksFilter);
  console.log(`
    =================================================================
    Generating DAO reports for ${filteredNetworks.join(", ")} networks:
    =================================================================`);
  for (const network of filteredNetworks) {
    // get the client
    const client = createPublicClient({
      chain: network.chain,
      transport: http(`${network.alchemyUrl}/${process.env.ALCHEMY_API_KEY}`),
    });

    // get the azorius module master copy address
    const azoriusModuleMasterCopyAddress = Object.entries(
      addresses[network.chain.id.toString() as keyof typeof addresses],
    ).filter(([name]) => name === "Azorius")[0];

    // get all instances of the azorius module
    const azoriusInstances = await getInstancesForMasterCopy(
      client,
      azoriusModuleMasterCopyAddress[1] as Address,
      network.factories,
    );

    console.log(`
      =================================================================
      Found ${azoriusInstances.length} Azorius module instances
      =================================================================`);

    // get owner of each instance (which is the DAO)
    for (const instance of azoriusInstances) {
      const daoAddress = await client.readContract({
        address: instance,
        abi: abis.Azorius,
        functionName: "owner",
      });
      console.log(`
        =================================================================
        Found DAO at ${daoAddress}
        =================================================================`);

      // @todo get the DAO's strategies types
      // @todo get the DAO's treasury token balances
      // @todo get the DAO's treasury total USD
    }
  }
}

main();
