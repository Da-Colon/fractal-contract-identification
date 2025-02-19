import { abis, addresses } from "@fractal-framework/fractal-contracts";
import { type PublicClient, type Address, zeroAddress } from "viem";
import { getInstancesForMasterCopy, identifyContract } from "./helpers.contract";
import type { NetworkConfig } from "./types.network";
import type { ContractType } from "./types.contract";
import { getERC20TokenData, formatUSDValue } from "./helpers.token";
import { SENTINEL_ADDRESS } from "./variables.common";

// ! @note depreciated for now; don't delete
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

export async function getAzoriusData(
  daoAddress: Address,
  modules: {
    address: Address;
    type: ContractType;
  }[],
  viemClient: PublicClient,
) {
  const [azoriusModule] = modules.filter((module) => module.type.isModuleAzorius);
  const governanceType = azoriusModule ? "Azorius" : "Multisig";

  const azoriusStrategies: { address: Address; type: ContractType }[] = [];
  if (governanceType === "Azorius") {
    const [s, ns] = await viemClient.readContract({
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
            type: await identifyContract(viemClient, strategy),
          };
        }),
    );
    azoriusStrategies.push(...strategies);
  }

  const tokensData = await getERC20TokenData(daoAddress, viemClient.chain!.id);
  const totalTokenBalance = tokensData.reduce((acc, token) => acc + (token?.usdBalance ?? 0), 0);

  const totalTokenBalanceFrmt = formatUSDValue(totalTokenBalance);
  return {
    governanceType: governanceType as "Azorius" | "Multisig",
    strategies: azoriusStrategies,
    tokensData,
    totalTokenBalance,
    totalTokenBalanceFrmt,
  };
}
