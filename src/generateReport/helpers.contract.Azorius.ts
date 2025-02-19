import { abis, addresses } from "@fractal-framework/fractal-contracts";
import { type PublicClient, type Address, zeroAddress, getAddress, type Hex } from "viem";
import { getInstancesForMasterCopy, identifyContract } from "./helpers.contract";
import type { NetworkConfig } from "./types.network";
import type { ContractType } from "./types.contract";
import { getERC20TokenData, formatUSDValue } from "./helpers.token";
import { SENTINEL_ADDRESS } from "./variables.common";

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

async function getTokenData(daoAddress: Address, viemClient: PublicClient) {
  const tokensData = await getERC20TokenData(daoAddress, viemClient.chain!.id);
  const totalTokenBalance = tokensData.reduce((acc, token) => acc + (token?.usdBalance ?? 0), 0);
  const totalTokenBalanceFrmt = formatUSDValue(totalTokenBalance);
  return {
    tokensData,
    totalTokenBalance,
    totalTokenBalanceFrmt,
  };
}

async function getProposals(
  azoriusModuleAddress: Address,
  deploymentBlockNumber: bigint,
  viemClient: PublicClient,
) {
  const logs = await viemClient.getContractEvents({
    address: azoriusModuleAddress,
    abi: abis.Azorius,
    eventName: "ProposalCreated",
    args: [],
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
  deploymentBlockNumber: bigint,
  viemClient: PublicClient,
) {
  const allUniqueUsers = new Set<Address>();
  let voteCount = 0;
  for (const proposal of proposals) {
    allUniqueUsers.add(proposal.proposer);
    const strategy = await identifyContract(viemClient, proposal.strategy);
    if (strategy.isLinearVotingErc20 || strategy.isLinearVotingErc20WithHatsProposalCreation) {
      const votes = await viemClient.getContractEvents({
        address: proposal.strategy,
        abi: abis.LinearERC20Voting,
        eventName: "Voted",
        args: [Number(proposal.proposalId)],
        fromBlock: deploymentBlockNumber,
      });
      for (const vote of votes) {
        allUniqueUsers.add(getAddress(vote.args.voter as Address));
        voteCount += 1;
      }
    }
    if (strategy.isLinearVotingErc721 || strategy.isLinearVotingErc721WithHatsProposalCreation) {
      const votes = await viemClient.getContractEvents({
        address: proposal.strategy,
        abi: abis.LinearERC721Voting,
        eventName: "Voted",
        args: [Number(proposal.proposalId)],
        fromBlock: deploymentBlockNumber,
      });
      for (const vote of votes) {
        allUniqueUsers.add(getAddress(vote.args.voter as Address));
        voteCount += 1;
      }
    }
  }
  return { uniqueUsers: Array.from(allUniqueUsers), voteCount };
}

export async function getAzoriusData(
  daoAddress: Address,
  deploymentTransactionHash: Hex,
  modules: {
    address: Address;
    type: ContractType;
  }[],
  viemClient: PublicClient,
) {
  const [azoriusModule] = modules.filter((module) => module.type.isModuleAzorius);
  const governanceType = azoriusModule ? "Azorius" : "Multisig";

  const azoriusStrategies: { address: Address; type: ContractType }[] = [];
  if (governanceType === "Azorius") {
    azoriusStrategies.push(...(await getAzoriusStrategies(azoriusModule.address, viemClient)));
  }
  const deploymentBlock = await viemClient.getTransaction({
    hash: deploymentTransactionHash,
  });
  const azoriusProposals = await getProposals(
    azoriusModule.address,
    deploymentBlock.blockNumber,
    viemClient,
  );

  const { uniqueUsers, voteCount } = await getAzoriusProposalsData(
    azoriusProposals,
    deploymentBlock.blockNumber,
    viemClient,
  );

  const { tokensData, totalTokenBalance, totalTokenBalanceFrmt } = await getTokenData(
    daoAddress,
    viemClient,
  );

  return {
    governanceType: governanceType as "Azorius" | "Multisig",
    strategies: azoriusStrategies,
    tokensData,
    totalTokenBalance,
    totalTokenBalanceFrmt,
    azoriusProposals: azoriusProposals.map((p) => ({
      proposalId: p.proposalId,
    })),
    uniqueAzoriusUsers: uniqueUsers,
    azoriusVotesCount: voteCount,
  };
}
