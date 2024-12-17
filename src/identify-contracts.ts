import { createPublicClient, http, type Address } from "viem";
import { filterNetworks, NETWORKS, parseNetworksArg } from "./networks";
import { type NetworkStats, initializeStats, logTestResults, updateStats } from "./stats";
import { getInstancesForMasterCopy, identifyContract, type ContractType } from "./contracts";

const main = async () => {
  const networksFilter = parseNetworksArg();
  const filteredNetworks = filterNetworks(NETWORKS, networksFilter);
  const allNetworkStats: NetworkStats[] = [];

  for (const network of filteredNetworks) {
    console.log(`
=================================================================
Contract Type Identification Test Suite - ${network.chain.name}
=================================================================

This test suite uses known contract instances to validate our
contract type detection logic. 

We can gather reliable test data because these contracts are created
through Zodiac Module Proxy Factories. Each proxy instance points to
a specific "master copy" implementation, so we know with certainty
what type each proxy instance should be.

We'll gather instances from ${network.factories.length} factory contract(s):
${network.factories
  .map((f, i) => `${i + 1}. ${f.address} (from block ${f.deploymentBlock})`)
  .join("\n")}
=================================================================\n`);

    const client = createPublicClient({
      chain: network.chain,
      transport: http(`${network.alchemyUrl}/${process.env.ALCHEMY_API_KEY}`),
    });

    const allInstances = new Map<keyof ContractType, Address[]>();
    let totalInstances = 0;

    for (const masterCopy of network.MASTER_COPY_ADDRESSES) {
      const instances = await getInstancesForMasterCopy(
        client,
        masterCopy.address,
        network.factories
      );
      allInstances.set(masterCopy.expectedType, instances);
      totalInstances += instances.length;
    }

    if (totalInstances === 0) {
      continue;
    }

    const stats = initializeStats();

    for (const [contractType, instances] of allInstances) {
      if (instances.length > 0) {
        for (const instance of instances) {
          const result = await identifyContract(client, instance);
          logTestResults(instance, contractType, result);
          updateStats(stats, contractType, result);
        }
      }
    }

    // Save the stats for this network
    allNetworkStats.push({
      networkName: network.chain.name,
      stats,
    });
  }

  // Print final statistics for all networks at the end
  console.log("\n=================================================================");
  console.log("Final Statistics Across All Networks:");
  console.log("=================================================================\n");

  for (const networkStats of allNetworkStats) {
    console.log(`\nNetwork: ${networkStats.networkName}`);
    console.log("================");
    Object.entries(networkStats.stats).forEach(([contractType, stat]) => {
      if (stat.totalTests > 0) {
        const allPassed = stat.exactMatches === stat.totalTests;
        console.log(`\n${contractType}: ${allPassed ? "✅" : "❌"}`);
        console.log(`  Total tests: ${stat.totalTests}`);
        console.log(
          `  Exact matches: ${stat.exactMatches} (${(
            (stat.exactMatches / stat.totalTests) *
            100
          ).toFixed(1)}%)`
        );
        console.log(
          `  No matches: ${stat.noMatches} (${((stat.noMatches / stat.totalTests) * 100).toFixed(
            1
          )}%)`
        );
        console.log(
          `  Multiple matches: ${stat.multipleMatches} (${(
            (stat.multipleMatches / stat.totalTests) *
            100
          ).toFixed(1)}%)`
        );
      }
    });
    console.log("\n-----------------");
  }
};

main();
