import { abis, addresses } from "@fractal-framework/fractal-contracts";
import { type Address, createPublicClient, http, zeroAddress } from "viem";
import { SENTINEL_ADDRESS } from "./variables.common";
import { filterNetworks, getNetworkConfig, parseNetworksArg } from "./helpers.network";
import { getInstancesForMasterCopy, identifyContract } from "./helpers.contract";
import { formatUSDValue, getERC20TokenData } from "./helpers.token";
import type { ContractType } from "./types.contract";

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
  console.log("Generating report...");
  const networksFilter = parseNetworksArg();
  const filteredNetworks = filterNetworks(getNetworkConfig(), networksFilter);

  const daoData: DAOData[] = [];

  console.log(`
    =================================================================
    Generating DAO reports for ${filteredNetworks.map((n) => n.chain.name).join(", ")} networks:
    =================================================================`);
  for (const network of filteredNetworks) {
    console.log(`
      =================================================================
      Starting to gather data for ${network.chain.name}
      =================================================================`);

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

      const [s, ns] = await client.readContract({
        address: instance,
        abi: abis.Azorius,
        functionName: "getStrategies",
        args: [SENTINEL_ADDRESS, 3n],
      });

      // identify each of the DAO's strategies
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

      console.log(`
        =================================================================
        Found ${strategies.length} strategies for ${daoAddress}
        =================================================================`);

      const tokensData = await getERC20TokenData(daoAddress, client.chain.id);
      console.log("🚀 ~ tokensData:", tokensData);
      const totalTokenBalance = formatUSDValue(
        tokensData.reduce((acc, token) => acc + (token?.usdBalance ?? 0), 0),
      );

      console.log(`
        =================================================================
        Found ${tokensData.length} tokens for ${daoAddress}, Total Value ${totalTokenBalance}
        =================================================================`);

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

  console.log(`
    =================================================================
    Finished gathering data for ${daoData.length} DAOs
    =================================================================`);

  // wait for 5 seconds
  setTimeout(() => {}, 5000);
  console.log(`
    =================================================================
    Generating report...
    =================================================================`);

  console.table(
    daoData.map((dao) => ({
      address: dao.address,
      network: dao.network,
      ...dao.strategies.map((strategy) => ({
        [`${strategy.type}`]: strategy.type,
      })),
      totalTokenBalance: dao.totalTokenBalance,
      tokenCount: dao.tokens.length,
    })),
  );
}

main();
