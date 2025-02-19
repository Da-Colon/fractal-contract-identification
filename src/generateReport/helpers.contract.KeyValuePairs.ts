import { fractalRegistryAbi } from "@/abis/FractalRegistry";
import { abis, addresses } from "@fractal-framework/fractal-contracts";
import { type Address, type PublicClient, createPublicClient, http } from "viem";
import { getSpecificNetworkConfig } from "./helpers.network";
import { getFractalRegistryContract } from "./helpers.contract";

export function getKeyValuePairContract(chainId: number) {
  // @ts-ignore
  switch (chainId) {
    case 1:
      return {
        address: addresses[1].KeyValuePairs,
        deploymentBlock: 17389311n,
      };
    case 10:
      return {
        address: addresses[10].KeyValuePairs,
        deploymentBlock: 118640420n,
      };
    case 137:
      return {
        address: addresses[137].KeyValuePairs,
        deploymentBlock: 43952879n,
      };
    case 8453:
      return {
        address: addresses[8453].KeyValuePairs,
        deploymentBlock: 12996645n,
      };
    case 11155111:
      return {
        address: addresses[11155111].KeyValuePairs,
        deploymentBlock: 4916643n,
      };
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
}

type GetDAOAddressFromKeyValuePairsContractReturnType = {
  daoName: string | null;
  daoAddress: Address;
};

export async function getDAOAddressFromKeyValuePairsContract(
  client: PublicClient,
): Promise<GetDAOAddressFromKeyValuePairsContractReturnType[]> {
  // Set up an ENS lookup client if needed.
  const isENSSupported = [1, 1115511].includes(client.chain!.id);
  const networkConfig = getSpecificNetworkConfig(isENSSupported ? client.chain!.id : 1);
  const mainnetOrSepoliaClient = createPublicClient({
    chain: isENSSupported ? client.chain : networkConfig.chain,
    transport: http(networkConfig.alchemyUrl),
  });

  const keyValuePairs = getKeyValuePairContract(client.chain!.id);
  const keyValuePairsLogs = await client.getContractEvents({
    address: keyValuePairs.address,
    abi: abis.KeyValuePairs,
    eventName: "ValueUpdated",
    fromBlock: keyValuePairs.deploymentBlock,
  });
  const fractalRegistry = getFractalRegistryContract(client.chain!.id);
  const fractalRegistryLogs = await client.getContractEvents({
    address: fractalRegistry.address,
    abi: fractalRegistryAbi,
    eventName: "FractalNameUpdated",
    fromBlock: fractalRegistry.deploymentBlock,
  });

  // We'll consider events that have either "daoName" or "snapshotENS" as a potential name update.
  const validNameKeys = new Set(["daoName"]);

  // Map to store the latest valid name event for each DAO address.
  const latestNameForAddress = new Map<string, { blockNumber: bigint; name: string }>();
  // Also track every unique DAO address seen.
  const uniqueAddresses = new Set<string>();

  for (const log of keyValuePairsLogs) {
    const daoAddress = log.args.theAddress;
    if (!daoAddress) continue;
    uniqueAddresses.add(daoAddress);

    // Only process events that have a key that might contain a name.
    if (!validNameKeys.has(log.args.key ?? "0x")) continue;

    // Ignore events with empty values.
    if (!log.args.value || log.args.value === "0x" || log.args.value === "") continue;

    const blockNumber = log.blockNumber;
    const current = latestNameForAddress.get(daoAddress);
    // Use the event with the highest block number.
    if (!current || blockNumber > current.blockNumber) {
      latestNameForAddress.set(daoAddress, { blockNumber, name: log.args.value });
    }
  }
  for (const log of fractalRegistryLogs) {
    const daoAddress = log.args.daoAddress;
    if (!daoAddress) continue;
    uniqueAddresses.add(daoAddress);

    // Only process events that have a key that might contain a name.

    // Ignore events with empty values.
    if (!log.args.daoName) continue;

    const blockNumber = log.blockNumber;
    const current = latestNameForAddress.get(daoAddress);
    // Use the event with the highest block number.
    if (!current || blockNumber > current.blockNumber) {
      latestNameForAddress.set(daoAddress, { blockNumber, name: log.args.daoName });
    }
  }

  // Build our result by using the latest name event for each unique address.
  // If no name event exists, try to resolve via ENS.
  const results: GetDAOAddressFromKeyValuePairsContractReturnType[] = [];
  for (const daoAddress of uniqueAddresses) {
    let daoName: string | null = null;
    const nameEvent = latestNameForAddress.get(daoAddress);
    if (nameEvent) {
      daoName = nameEvent.name;
    } else if (!daoName) {
      // Fallback: try ENS lookup.
      daoName = await mainnetOrSepoliaClient.getEnsName({ address: daoAddress });
    } else {
      daoName = "--";
    }
    results.push({ daoAddress, daoName });
  }

  return results;
}
