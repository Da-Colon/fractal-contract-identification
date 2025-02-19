import { addresses } from "@fractal-framework/fractal-contracts";
import type { PublicClient, Address } from "viem";
import { getInstancesForMasterCopy } from "./helpers.contract";
import type { NetworkConfig } from "./types.network";

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
