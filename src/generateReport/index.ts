import { abis, addresses } from "@fractal-framework/fractal-contracts";
import { type Address, createPublicClient, http, zeroAddress } from "viem";
import { SENTINEL_ADDRESS } from "./variables.common";
import { filterNetworks, getNetworkConfig, parseNetworksArg } from "./helpers.network";
import { getInstancesForMasterCopy, identifyContract } from "./helpers.contract";

async function main() {
  console.log("Generating report...");
  const networksFilter = parseNetworksArg();
  const filteredNetworks = filterNetworks(getNetworkConfig(), networksFilter);
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

      const [s, ns] = await client.readContract({
        address: instance,
        abi: abis.Azorius,
        functionName: "getStrategies",
        args: [SENTINEL_ADDRESS, 3n],
      });

      // identify each of the DAO's strategies
      const strategies = [...s, ns]
        .filter((strategy) => strategy !== SENTINEL_ADDRESS && strategy !== zeroAddress)
        .map((strategy) => {
          return {
            address: strategy,
            type: identifyContract(client, strategy),
          };
        });

      console.log(`
        =================================================================
        Found ${strategies.length} strategies for ${daoAddress}
        =================================================================`);

      // @todo get the DAO's treasury token balances
      // moralis?
      // @todo get the DAO's treasury total USD
    }
  }
}

main();
