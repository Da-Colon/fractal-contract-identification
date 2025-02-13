import { abis } from "@fractal-framework/fractal-contracts";
import { type Address, createPublicClient, http, zeroAddress } from "viem";
import { SENTINEL_ADDRESS } from "./variables.common";
import { filterNetworks, getNetworkConfig, parseNetworksArg } from "./helpers.network";
import { getDAOAddressFromKeyValuePairsContract, identifyContract } from "./helpers.contract";
import { formatUSDValue, getERC20TokenData } from "./helpers.token";
import { getContractType, type ContractType } from "./types.contract";
import { GenerateReportLogs } from "../logging/LogMessage";
import SafeApiKit from "@safe-global/api-kit";
interface DAOData {
  address: Address;
  governanceType: "Azorius" | "Multisig";
  network: string;
  strategies: {
    address: Address;
    type: ContractType;
  }[];
  totalTokenBalance: string;
  tokens: {
    address: Address;
    symbol: string | null;
    usdBalance: number | undefined;
    usdPrice: string | undefined;
    logo: string | null;
    name: string | null;
  }[];
}

async function main() {
  const networksFilter = parseNetworksArg();
  const filteredNetworks = filterNetworks(getNetworkConfig(), networksFilter);

  const logs = new GenerateReportLogs();

  const daoData: DAOData[] = [];

  logs.generateReportStart(filteredNetworks.map((n) => n.chain.name));
  logs.startNetworkSearch(filteredNetworks.length);

  for (const network of filteredNetworks) {
    // get the client
    const client = createPublicClient({
      chain: network.chain,
      transport: http(`${network.alchemyUrl}`),
    });

    const safeClient = new SafeApiKit({
      chainId: BigInt(network.chain.id),
    });

    // get all dao created via Decent dApp via KeyValuePairs
    const daoAddresses = await getDAOAddressFromKeyValuePairsContract(client);
    for (const daoAddress of daoAddresses) {
      // get safe info
      const safeInfo = await safeClient.getSafeInfo(daoAddress);
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

      const azoriusStrategies: { address: Address; type: ContractType }[] = [];
      if (azoriusModule) {
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

      const tokensData = await getERC20TokenData(daoAddress, client.chain.id);
      const totalTokenBalance = formatUSDValue(
        tokensData.reduce((acc, token) => acc + (token?.usdBalance ?? 0), 0),
      );

      logs.updateNetworkSearch();

      daoData.push({
        address: daoAddress,
        governanceType: azoriusModule ? "Azorius" : "Multisig",
        network: network.chain.name,
        strategies: azoriusStrategies,
        totalTokenBalance,
        tokens: tokensData.map((token) => ({
          address: token.address,
          symbol: token.symbol,
          usdBalance: token.usdBalance,
          usdPrice: token.usdPrice,
          logo: token.logo,
          name: token.name,
        })),
      });
      setTimeout(() => {}, 300);
    }
  }

  logs.finishNetworkSearch();
  console.table(
    daoData.map((dao) => ({
      address: dao.address,
      network: dao.network,
      totalTokenBalance: dao.totalTokenBalance,
      tokenCount: dao.tokens.length,
      ...dao.strategies.reduce(
        (acc, strategy, index) => {
          const type = getContractType(strategy.type);
          acc[`Strategy ${index}`] = type;
          return acc;
        },
        {} as Record<string, string>,
      ),
    })),
  );
}

main();
