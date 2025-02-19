import { createPublicClient, http } from "viem";
import { filterNetworks, getNetworkConfig, parseNetworksArg } from "./helpers.network";
import { formatUSDValue, getTokenData } from "./helpers.token";
import { GenerateReportLogs } from "../logging/LogMessage";
import SafeApiKit from "@safe-global/api-kit";
import type { DAOData } from "./types.common";
import { formatDAOData } from "./helpers.common";
import { getDAOAddressFromKeyValuePairsContract } from "./helpers.contract.KeyValuePairs";
import { getAzoriusData } from "./helpers.contract.Azorius";
import { getSafeData } from "./helpers.safe";

async function main() {
  const networksFilter = parseNetworksArg();
  const filteredNetworks = filterNetworks(getNetworkConfig(), networksFilter);

  const logs = new GenerateReportLogs();

  const daoData: DAOData[] = [];

  logs.generateReportStart(filteredNetworks.map((n) => n.chain.name));

  for (const network of filteredNetworks) {
    logs.startNetworkSearch(network.chain.name);
    // get the client
    const viemClient = createPublicClient({
      chain: network.chain,
      transport: http(`${network.alchemyUrl}`),
    });

    const safeClient = new SafeApiKit({
      chainId: BigInt(network.chain.id),
    });

    const daoKeyValueDatas = await getDAOAddressFromKeyValuePairsContract(viemClient);
    logs.updateNetworkSearch("Found", `${daoKeyValueDatas.length} DAOs`, network.chain.name);

    for (const daoKeyValueData of daoKeyValueDatas) {
      logs.updateNetworkSearch(
        "Gathering DAO Info",
        daoKeyValueData.daoName,
        daoKeyValueData.daoAddress,
      );

      const {
        timeOfSafeCreation,
        deploymentTransactionHash,
        owners,
        guard,
        modules,
        multisigTransactions,
        uniqueMultisigUsers,
        multisigVotesCount,
      } = await getSafeData(daoKeyValueData.daoAddress, safeClient, viemClient);
      const [azoriusModule] = modules.filter((module) => module.type.isModuleAzorius);

      const governanceType = azoriusModule ? "Azorius" : "Multisig";
      const { strategies, azoriusProposals, uniqueAzoriusUsers, azoriusVotesCount } =
        await getAzoriusData(deploymentTransactionHash, azoriusModule?.address, viemClient);

      const { tokensData, totalTokenBalance, totalTokenBalanceFrmt } = await getTokenData(
        daoKeyValueData.daoAddress,
        viemClient,
      );

      logs.updateNetworkSearch("Governance Type", governanceType, daoKeyValueData.daoAddress);
      logs.updateNetworkSearch(
        "DAO Treasury holds",
        totalTokenBalanceFrmt,
        daoKeyValueData.daoAddress,
      );

      const proposalCount = !!azoriusModule ? azoriusProposals.length : multisigTransactions.length;
      const votesCount = !!azoriusModule ? azoriusVotesCount : multisigVotesCount;
      const uniqueUsers = Array.from(new Set([...uniqueMultisigUsers, ...uniqueAzoriusUsers]));

      daoData.push({
        timeOfSafeCreation,
        address: daoKeyValueData.daoAddress,
        name: daoKeyValueData.daoName,
        owners,
        guard,
        governanceType,
        network: network.chain.name,
        strategies,
        totalTokenBalance,
        totalTokenBalanceFrmt,
        tokens: tokensData.map((token) => ({
          address: token.address,
          symbol: token.symbol,
          usdBalance: token.usdBalance,
          usdPrice: token.usdPrice,
          logo: token.logo,
          name: token.name,
        })),
        proposalCount,
        uniqueUsers,
        votesCount,
      });
    }
  }

  logs.finishNetworkSearch();

  // todo total aggregate treasury amount in all daos, platform wide ✅
  // todo total aggregate number of proposals in all daos, platform wide ✅
  // todo total aggregate number of votes in all daos, platform wide ✅
  // todo total number of unique addresses that have interacted with the platform ✅
  // todo total amount of $ in airdrops through platform
  // todo total amount of $ in streams through platform
  // todo total amount of $ in transfers through platform

  console.table(
    filteredNetworks.map((n) => {
      const daoOnNetwork = daoData.filter((d) => d.network === n.chain.name);
      const totalBalance = daoOnNetwork.reduce(
        (acc, dao) => acc + Number(dao.totalTokenBalance),
        0,
      );
      const totalUSD = formatUSDValue(totalBalance);
      const totalMultisigs = daoOnNetwork.filter((d) => d.governanceType === "Multisig").length;
      const totalAzorius = daoOnNetwork.filter((d) => d.governanceType === "Azorius").length;
      return {
        Network: n.chain.name,
        DAOs: daoOnNetwork.length,
        "Total USD": totalUSD,
        Multisigs: totalMultisigs,
        Azorius: totalAzorius,
      };
    }),
  );

  console.table(formatDAOData(daoData));
}

main();
