import type { Abi } from "viem";
import type { DAOData } from "./types.common";
import type { NetworkConfig } from "./types.network";
import { formatUSDValue } from "./helpers.token";

export function combineAbis(...abisToCombine: Abi[]): Abi {
  return abisToCombine.flat();
}

export const createAddressSubstring = (address: string) => {
  return `${address.substring(0, 6)}...${address.slice(-4)}`;
};

// Define a structured type for overalTotals
interface FormattedOveralTotals {
  Metric: string;
  Value: string | number;
}

export function formatDAOData(daoData: DAOData[], networks: NetworkConfig[]) {
  // Aggregate network totals
  const networkTotals = networks.map((n) => {
    const networkName = n.chain.name;
    const daoOnNetwork = daoData.filter((d) => d.network === networkName);

    const totalBalance = daoOnNetwork.reduce((acc, dao) => acc + Number(dao.totalTokenBalance), 0);
    const totalUSD = formatUSDValue(totalBalance);
    const totalMultisigs = daoOnNetwork.filter((d) => d.governanceType === "Multisig").length;
    const totalAzorius = daoOnNetwork.filter((d) => d.governanceType === "Azorius").length;
    const uniqueUsers = new Set<string>();
    daoOnNetwork.forEach((dao) => dao.uniqueUsers.forEach((user) => uniqueUsers.add(user)));
    const totalUniqueUsers = uniqueUsers.size;
    const totalVotes = daoOnNetwork.reduce((acc, dao) => acc + dao.votesCount, 0);
    const totalProposals = daoOnNetwork.reduce((acc, dao) => acc + dao.proposalCount, 0);

    return {
      Network: networkName,
      "Total Daos": daoOnNetwork.length,
      "Total Balance": totalBalance,
      "Total USD": totalUSD,
      "Total Multisigs": totalMultisigs,
      "Total Azorius": totalAzorius,
      "Total Unique Users": totalUniqueUsers,
      "Total Votes": totalVotes,
      "Total Proposals": totalProposals,
    };
  });

  // Aggregate all DAOs
  const totalBalance = daoData.reduce((acc, dao) => acc + Number(dao.totalTokenBalance), 0);
  const totalUSD = formatUSDValue(totalBalance);
  const totalMultisigs = daoData.filter((d) => d.governanceType === "Multisig").length;
  const totalAzorius = daoData.filter((d) => d.governanceType === "Azorius").length;
  const uniqueUsers = new Set<string>();
  daoData.forEach((dao) => dao.uniqueUsers.forEach((user) => uniqueUsers.add(user)));
  const totalUniqueUsers = uniqueUsers.size;
  const totalVotes = daoData.reduce((acc, dao) => acc + dao.votesCount, 0);
  const totalProposals = daoData.reduce((acc, dao) => acc + dao.proposalCount, 0);
  const totalDaos = daoData.length;

  const daoDataFrmt = daoData.map((dao) => {
    const strategies = dao.strategies.reduce(
      (acc, strategy, index) => {
        acc[`Strategy ${index}`] = strategy;
        return acc;
      },
      {} as Record<string, string>,
    );

    return {
      "Dao Address": dao.address,
      "Dao Name": dao.name || "",
      Governance: dao.governanceType,
      Network: dao.network,
      "Proposal Count": dao.proposalCount,
      "Unique Users": dao.uniqueUsers.length,
      "Votes Count": dao.votesCount,
      Balance: dao.totalTokenBalanceFrmt,
      ...strategies,
    };
  });

  // Ensure overalTotals is formatted as an array of objects
  const overalTotals: FormattedOveralTotals[] = [
    { Metric: "Total DAOs", Value: totalDaos },
    { Metric: "Total Balance", Value: totalBalance.toLocaleString() },
    { Metric: "Total USD", Value: totalUSD },
    { Metric: "Total Multisigs", Value: totalMultisigs },
    { Metric: "Total Azorius", Value: totalAzorius },
    { Metric: "Total Unique Users", Value: totalUniqueUsers },
    { Metric: "Total Votes", Value: totalVotes },
    { Metric: "Total Proposals", Value: totalProposals },
  ];

  return {
    networkTotals,
    overalTotals,
    daoData: daoDataFrmt,
  };
}
