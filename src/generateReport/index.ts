import { abis } from "@fractal-framework/fractal-contracts";
import { type Address, createPublicClient, http, zeroAddress } from "viem";
import { SENTINEL_ADDRESS } from "./variables.common";
import { filterNetworks, getNetworkConfig, parseNetworksArg } from "./helpers.network";
import { getAzoriusModuleInstances, identifyContract } from "./helpers.contract";
import { formatUSDValue, getERC20TokenData } from "./helpers.token";
import { getContractType, type ContractType } from "./types.contract";
import { GenerateReportLogs } from "../logging/LogMessage";
interface DAOData {
  address: Address;
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

    // get all instances of the azorius module
    const azoriusInstances = await getAzoriusModuleInstances(client, network);

    logs.updateNetworkSearch();
    // get owner of each instance (which is the DAO)
    for (const instance of azoriusInstances) {
      const daoAddress = await client.readContract({
        address: instance,
        abi: abis.Azorius,
        functionName: "owner",
      });

      const [s, ns] = await client.readContract({
        address: instance,
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

      const tokensData = await getERC20TokenData(daoAddress, client.chain.id);
      const totalTokenBalance = formatUSDValue(
        tokensData.reduce((acc, token) => acc + (token?.usdBalance ?? 0), 0),
      );

      daoData.push({
        address: daoAddress,
        network: network.chain.name,
        strategies,
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
