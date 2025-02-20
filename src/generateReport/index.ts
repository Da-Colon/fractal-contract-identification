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
import { getContractType } from "./types.contract";
import { dummyDAOData } from "../ui/mocks.dummyData.daos";
import { generateDAOReport } from "./helpers.pdf";

async function main() {
  const networksFilter = parseNetworksArg();
  const filteredNetworks = filterNetworks(getNetworkConfig(), networksFilter);

  const logs = new GenerateReportLogs();

  const daoData: DAOData[] = networksFilter === "dummy" ? dummyDAOData : [];

  logs.generateReportStart(filteredNetworks.map((n) => n.chain.name));
  if (networksFilter !== "dummy")
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

        const proposalCount = !!azoriusModule
          ? azoriusProposals.length
          : multisigTransactions.length;
        const votesCount = !!azoriusModule ? azoriusVotesCount : multisigVotesCount;
        const uniqueUsers = Array.from(new Set([...uniqueMultisigUsers, ...uniqueAzoriusUsers]));
        const strategiesTypes = strategies.map(
          (strategy) =>
            getContractType(strategy.type) as "ERC20-L" | "ERC20-LH" | "ERC721-L" | "ERC721-LH",
        );
        daoData.push({
          timeOfSafeCreation,
          address: daoKeyValueData.daoAddress,
          name: daoKeyValueData.daoName,
          owners,
          guard,
          governanceType,
          network: network.chain.name,
          strategies: strategiesTypes,
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

  const summaries = formatDAOData(daoData, filteredNetworks);
  if (!daoData.length) {
    console.log("No DAOs found for the selected networks.");
    return;
  } else {
    generateDAOReport(summaries, networksFilter);
  }
}

main();
