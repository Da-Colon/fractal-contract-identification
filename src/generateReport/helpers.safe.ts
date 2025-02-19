import type SafeApiKit from "@safe-global/api-kit";
import { identifyContract } from "./helpers.contract";
import type { Address, PublicClient } from "viem";
import type { ContractType } from "./types.contract";

export async function getSafeData(
  daoAddress: Address,
  safeClient: SafeApiKit,
  viemClient: PublicClient,
) {
  const safeInfo = await safeClient.getSafeInfo(daoAddress);
  const safeCreationInfo = await safeClient.getSafeCreationInfo(daoAddress);
  const modules = safeInfo.modules;
  const owners = safeInfo.owners;
  const guard = safeInfo.guard;

  const decentModules: { address: Address; type: ContractType }[] = [];
  for (const module of modules) {
    const type = await identifyContract(viemClient, module);
    if (type) {
      decentModules.push({
        address: module,
        type,
      });
    }
  }
  return {
    timeOfSafeCreation: safeCreationInfo.created,
    owners,
    guard,
    modules: decentModules,
  };
}
