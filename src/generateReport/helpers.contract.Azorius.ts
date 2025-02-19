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

async function getAzoriusStrategies(azoriusModuleAddress: Address, viemClient: PublicClient) {
  const [s, ns] = await viemClient.readContract({
    address: azoriusModuleAddress,
    abi: abis.Azorius,
    functionName: "getStrategies",
    args: [SENTINEL_ADDRESS, 3n],
  });

  return Promise.all(
    [...s, ns]
      .filter((strategy) => strategy !== SENTINEL_ADDRESS && strategy !== zeroAddress)
      .map(async (strategy) => {
        // get the identify each of the DAO's strategies
        return {
          address: strategy,
          type: await identifyContract(viemClient, strategy),
        };
      }),
  );
}

async function getTokenData(daoAddress: Address, viemClient: PublicClient) {
  const tokensData = await getERC20TokenData(daoAddress, viemClient.chain!.id);
  const totalTokenBalance = tokensData.reduce((acc, token) => acc + (token?.usdBalance ?? 0), 0);
  const totalTokenBalanceFrmt = formatUSDValue(totalTokenBalance);
  return {
    tokensData,
    totalTokenBalance,
    totalTokenBalanceFrmt,
  };
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
    azoriusStrategies.push(...(await getAzoriusStrategies(azoriusModule.address, viemClient)));
  }

  const { tokensData, totalTokenBalance, totalTokenBalanceFrmt } = await getTokenData(
    daoAddress,
    viemClient,
  );

  return {
    governanceType: governanceType as "Azorius" | "Multisig",
    strategies: azoriusStrategies,
    tokensData,
    totalTokenBalance,
    totalTokenBalanceFrmt,
  };
}
