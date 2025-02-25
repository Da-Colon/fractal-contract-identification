import { abis, addresses } from "@fractal-framework/fractal-contracts";
import { type PublicClient, type Address, zeroAddress, getAddress, getContract } from "viem";
import { getInstancesForMasterCopy, identifyContract } from "./helpers.contract";
import type { NetworkConfig } from "./types.network";
import { getContractType, type ContractType } from "./types.contract";
import { SENTINEL_ADDRESS } from "./variables.common";

type AzoriusStrategy = { address: Address; type: ContractType };

// ! @note depreciated for now; don't delete
export async function getAzoriusModuleInstances(viemClient: PublicClient, network: NetworkConfig) {
  // get the azorius module master copy address
  const azoriusModuleMasterCopyAddress = Object.entries(
    addresses[viemClient.chain!.id.toString() as keyof typeof addresses],
  ).filter(([name]) => name === "Azorius")[0];

  // get all instances of the azorius module
  return getInstancesForMasterCopy(
    viemClient,
    azoriusModuleMasterCopyAddress[1] as Address,
    network.factories,
  );
}

async function getAzoriusStrategies(azoriusModuleAddress: Address, viemClient: PublicClient) {
  const [s, ns] = await viemClient.readContract({
    address: azoriusModuleAddress,
    abi: abis.Azorius,
    functionName: "getStrategies",
    args: [SENTINEL_ADDRESS, 3n],
  });

  return Promise.all(
    [...s, ns]
      .filter((strategy) => strategy !== SENTINEL_ADDRESS && strategy !== zeroAddress)
      .map(async (strategy) => {
        // get the identify each of the DAO's strategies
        return {
          address: strategy,
          type: await identifyContract(viemClient, strategy),
        };
      }),
  );
}

async function getProposals(
  azoriusModuleAddress: Address,
  deploymentBlockNumber: bigint,
  viemClient: PublicClient,
) {
  const azoriusContract = getContract({
    address: azoriusModuleAddress,
    abi: abis.Azorius,
    client: viemClient,
  });
  const logs = await azoriusContract.getEvents.ProposalCreated({
    fromBlock: deploymentBlockNumber,
  });
  const proposalsData = logs.map((log) => {
    const { proposalId, proposer } = log.args;
    return {
      proposalId: proposalId as bigint,
      proposer: getAddress(proposer as Address),
      strategy: getAddress(log.args.strategy as Address),
    };
  });

  return proposalsData;
}

async function getAzoriusProposalsData(
  proposals: {
    proposalId: bigint;
    proposer: Address;
    strategy: Address;
  }[],
  azoriusStrategies: AzoriusStrategy[],
  deploymentBlockNumber: bigint,
  viemClient: PublicClient,
) {
  const allUniqueUsers = new Set<Address>();
  let voteCount = 0;

  for (const proposal of proposals) {
    allUniqueUsers.add(proposal.proposer);
  }

  for (const strategy of azoriusStrategies) {
    const strategyType = getContractType(strategy.type);
    if (strategyType === "ERC20-L" || strategyType === "ERC20-LH") {
      const strategyContract = getContract({
        address: strategy.address,
        abi: abis.LinearERC20Voting,
        client: viemClient,
      });
      const votes = await strategyContract.getEvents.Voted({
        fromBlock: deploymentBlockNumber,
      });
      for (const vote of votes) {
        allUniqueUsers.add(getAddress(vote.args.voter as Address));
      }
      voteCount += votes.length;
    }
    if (strategyType === "ERC721-L" || strategyType === "ERC721-LH") {
      const strategyContract = getContract({
        address: strategy.address,
        abi: abis.LinearERC721Voting,
        client: viemClient,
      });
      const votes = await strategyContract.getEvents.Voted({
        fromBlock: deploymentBlockNumber,
      });
      for (const vote of votes) {
        allUniqueUsers.add(getAddress(vote.args.voter as Address));
      }
      voteCount += votes.length;
    }
  }
  return { uniqueUsers: Array.from(allUniqueUsers), voteCount };
}

export async function getAzoriusData(
  deploymentBlockNumber: bigint,
  azoriusModuleAddress: Address | undefined,
  viemClient: PublicClient,
) {
  if (!azoriusModuleAddress) {
    return {
      strategies: [],
      azoriusProposals: [],
      uniqueAzoriusUsers: [],
      azoriusVotesCount: 0,
    };
  }
  const azoriusStrategies: { address: Address; type: ContractType }[] = [];
  azoriusStrategies.push(...(await getAzoriusStrategies(azoriusModuleAddress, viemClient)));

  const azoriusProposals = await getProposals(
    azoriusModuleAddress,
    deploymentBlockNumber,
    viemClient,
  );

  const { uniqueUsers, voteCount } = await getAzoriusProposalsData(
    azoriusProposals,
    azoriusStrategies,
    deploymentBlockNumber,
    viemClient,
  );

  return {
    strategies: azoriusStrategies,
    azoriusProposals: azoriusProposals.map((p) => ({
      proposalId: p.proposalId,
    })),
    uniqueAzoriusUsers: uniqueUsers,
    azoriusVotesCount: voteCount,
  };
}
