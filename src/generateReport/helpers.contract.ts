import { ZodiacModuleProxyFactoryAbi } from "../abis/ZodiacModuleProxyFactoryAbi";
import { type PublicClient, type Address, createPublicClient, http } from "viem";
import type { ContractType } from "./types.contract";
import { defaultContractType, contractTests } from "./variables.common";
import type { NetworkConfig } from "./types.network";
import { abis, addresses } from "@fractal-framework/fractal-contracts";
import { getSpecificNetworkConfig } from "./helpers.network";
import { fractalRegistryAbi } from "../abis/FractalRegistry";

export function getFactories(chainId: Number): { address: Address; deploymentBlock: bigint }[] {
  switch (chainId) {
    case 1:
      return [
        {
          address: "0x31Bf73048056fe947B827C0Fe159ACcB5Ae30237",
          deploymentBlock: 17389310n,
        },
        {
          address: "0x000000000000addb49795b0f9ba5bc298cdda236",
          deploymentBlock: 16140611n,
        },
      ];
    case 10:
      return [
        {
          address: "0x31Bf73048056fe947B827C0Fe159ACcB5Ae30237",
          deploymentBlock: 118640417n,
        },
        {
          address: "0x000000000000addb49795b0f9ba5bc298cdda236",
          deploymentBlock: 46817372n,
        },
      ];
    case 137:
      return [
        {
          address: "0x537D9E0d8F66C1eEe391C77f5D8a39d00444428c",
          deploymentBlock: 43952877n,
        },
        {
          address: "0x000000000000addb49795b0f9ba5bc298cdda236",
          deploymentBlock: 36581177n,
        },
      ];
    case 8453:
      return [
        {
          address: "0x31Bf73048056fe947B827C0Fe159ACcB5Ae30237",
          deploymentBlock: 12996642n,
        },
        {
          address: "0x000000000000addb49795b0f9ba5bc298cdda236",
          deploymentBlock: 7414414n,
        },
      ];
    case 11155111:
      return [
        {
          address: "0xE93e4B198097C4CB3A6de594c90031CDaC0B88f3",
          deploymentBlock: 4916639n,
        },
        {
          address: "0x000000000000addb49795b0f9ba5bc298cdda236",
          deploymentBlock: 3059000n,
        },
      ];

    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
}

function getFractalRegistryContract(chainId: number) {
  switch (chainId) {
    case 1:
      return {
        address: "0x023BDAEFeDDDdd5B43aF125CAA8007a99A886Fd3",
        deploymentBlock: 17389302n,
      };
    case 10:
      return {
        address: "0x023BDAEFeDDDdd5B43aF125CAA8007a99A886Fd3",
        deploymentBlock: 118640391n,
      };
    case 137:
      return {
        address: "0xfE5950B4975a19679be7c31a0A03D626d237f37C",
        deploymentBlock: 43952847n,
      };
    case 8453:
      return {
        address: "0x023bdaefeddddd5b43af125caa8007a99a886fd3",
        deploymentBlock: 12996617n,
      };
    case 11155111:
      return {
        address: "0x4791FF2a6E84F012402c0679C12Cb1d9260450A6",
        deploymentBlock: 4916634n,
      };
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
}

function getKeyValuePairContract(chainId: number) {
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

export async function identifyContract(
  client: PublicClient,
  address: Address,
): Promise<ContractType> {
  const result = { ...defaultContractType };

  const allCalls = contractTests.flatMap((test) => [
    ...test.functionNames.map((fn) => ({
      address,
      abi: test.abi,
      functionName: fn,
      args: [],
    })),
    ...(test.revertFunctionNames?.map((fn) => ({
      address,
      abi: test.abi,
      functionName: fn,
      args: [],
    })) ?? []),
  ]);

  const allResults = await client.multicall({
    contracts: allCalls,
  });

  let resultIndex = 0;
  for (const test of contractTests) {
    const successResults = allResults.slice(resultIndex, resultIndex + test.functionNames.length);
    const successPassed = successResults.every((r: any) => !r.error);
    resultIndex += test.functionNames.length;

    let revertPassed = true;
    if (test.revertFunctionNames?.length) {
      const revertResults = allResults.slice(
        resultIndex,
        resultIndex + test.revertFunctionNames.length,
      );
      revertPassed = revertResults.every((r) => r.error);
      resultIndex += test.revertFunctionNames.length;
    }

    result[test.resultKey] = successPassed && revertPassed;
  }

  return result;
}

export async function getInstancesForMasterCopy(
  client: PublicClient,
  masterCopyAddress: Address,
  factories: NetworkConfig["factories"],
): Promise<Address[]> {
  const allLogs: any[] = [];

  for (const factory of factories) {
    const logs = await client.getContractEvents({
      address: factory.address,
      abi: ZodiacModuleProxyFactoryAbi,
      eventName: "ModuleProxyCreation",
      args: {
        masterCopy: masterCopyAddress,
      },
      fromBlock: factory.deploymentBlock,
    });
    allLogs.push(...logs);
  }

  return allLogs
    .sort((a, b) => Number(b.blockNumber) - Number(a.blockNumber))
    .map((log) => log.args.proxy as Address);
}

// @dev depreciated for now; don't delete
export async function getAzoriusModuleInstances(client: PublicClient, network: NetworkConfig) {
  // get the azorius module master copy address
  const azoriusModuleMasterCopyAddress = Object.entries(
    addresses[client.chain!.id.toString() as keyof typeof addresses],
  ).filter(([name]) => name === "Azorius")[0];

  // get all instances of the azorius module
  return getInstancesForMasterCopy(
    client,
    azoriusModuleMasterCopyAddress[1] as Address,
    network.factories,
  );
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
