import { abis } from "@fractal-framework/fractal-contracts";
import { type Address, createPublicClient, http, zeroAddress } from "viem";
import { SENTINEL_ADDRESS } from "./variables.common";
import { filterNetworks, getNetworkConfig, parseNetworksArg } from "./helpers.network";
import { identifyContract } from "./helpers.contract";
import { formatUSDValue, getERC20TokenData } from "./helpers.token";
import { type ContractType } from "./types.contract";
import { GenerateReportLogs } from "../logging/LogMessage";
import SafeApiKit from "@safe-global/api-kit";
import type { DAOData } from "./types.common";
import { formatDAOData } from "./helpers.common";
import { getDAOAddressFromKeyValuePairsContract } from "./helpers.contract.KeyValuePairs";

async function main() {
  const networksFilter = parseNetworksArg();
  const filteredNetworks = filterNetworks(getNetworkConfig(), networksFilter);

  const logs = new GenerateReportLogs();

  const daoData: DAOData[] = [];

  logs.generateReportStart(filteredNetworks.map((n) => n.chain.name));

  for (const network of filteredNetworks) {
    logs.startNetworkSearch(network.chain.name);
    // get the client
    const client = createPublicClient({
      chain: network.chain,
      transport: http(`${network.alchemyUrl}`),
    });

    const safeClient = new SafeApiKit({
      chainId: BigInt(network.chain.id),
    });

    // get all dao created via Decent dApp via KeyValuePairs
    const daoKeyValueDatas = await getDAOAddressFromKeyValuePairsContract(client);
    logs.updateNetworkSearch("Found", `${daoKeyValueDatas.length} DAOs`, network.chain.name);

    for (const daoKeyValueData of daoKeyValueDatas) {
      logs.updateNetworkSearch(
        "Gathering DAO Info",
        daoKeyValueData.daoName,
        daoKeyValueData.daoAddress,
      );
      // get safe info
      const safeInfo = await safeClient.getSafeInfo(daoKeyValueData.daoAddress);
      const safeCreationInfo = await safeClient.getSafeCreationInfo(daoKeyValueData.daoAddress);
      const modules = safeInfo.modules;
      const owners = safeInfo.owners;
      const guard = safeInfo.guard;

      const decentModules: { address: Address; type: ContractType }[] = [];
      for (const module of modules) {
        const type = await identifyContract(client, module);
        if (type) {
          decentModules.push({
            address: module,
            type,
          });
        }
      }
      const [azoriusModule] = decentModules.filter((module) => module.type.isModuleAzorius);
      const governanceType = azoriusModule ? "Azorius" : "Multisig";
      logs.updateNetworkSearch("Governance Type", governanceType, daoKeyValueData.daoAddress);

      const azoriusStrategies: { address: Address; type: ContractType }[] = [];
      if (governanceType === "Azorius") {
        const [s, ns] = await client.readContract({
          address: azoriusModule.address,
          abi: abis.Azorius,
          functionName: "getStrategies",
          args: [SENTINEL_ADDRESS, 3n],
        });

        // get the identify each of the DAO's strategies
        const strategies = await Promise.all(
          [...s, ns]
            .filter((strategy) => strategy !== SENTINEL_ADDRESS && strategy !== zeroAddress)
            .map(async (strategy) => {
              return {
                address: strategy,
                type: await identifyContract(client, strategy),
              };
            }),
        );
        azoriusStrategies.push(...strategies);
      }

      const tokensData = await getERC20TokenData(daoKeyValueData.daoAddress, client.chain.id);
      const totalTokenBalance = tokensData.reduce(
        (acc, token) => acc + (token?.usdBalance ?? 0),
        0,
      );

      const totalTokenBalanceFrmt = formatUSDValue(totalTokenBalance);
      logs.updateNetworkSearch(
        "DAO Treasury holds",
        totalTokenBalanceFrmt,
        daoKeyValueData.daoAddress,
      );

      daoData.push({
        timeOfCreation: safeCreationInfo.created,
        address: daoKeyValueData.daoAddress,
        name: daoKeyValueData.daoName,
        owners,
        guard,
        governanceType,
        network: network.chain.name,
        strategies: azoriusStrategies,
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
      });
    }
  }

  logs.finishNetworkSearch();

  // todo total aggregate treasury amount in all daos, platform wide
  // todo total aggregate number of proposals in all daos, platform wide
  // todo total aggregate number of votes in all daos, platform wide
  // todo total number of unique addresses that have interacted with the platform
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
