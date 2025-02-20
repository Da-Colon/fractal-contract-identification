import type SafeApiKit from "@safe-global/api-kit";
import { identifyContract } from "./helpers.contract";
import { getAddress, type Address, type Hex, type PublicClient } from "viem";
import type { ContractType } from "./types.contract";

export async function getSafeData(
  daoAddress: Address,
  safeClient: SafeApiKit,
  viemClient: PublicClient,
) {
  const safeInfo = await safeClient
    .getSafeInfo(daoAddress)
    .catch(() => safeClient.getSafeInfo(daoAddress));
  const safeCreationInfo = await safeClient
    .getSafeCreationInfo(daoAddress)
    .catch(() => safeClient.getSafeCreationInfo(daoAddress));

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
  const [azoriusModule] = decentModules.filter((module) => module.type.isModuleAzorius);
  if (!azoriusModule) {
    return {
      timeOfSafeCreation: safeCreationInfo.created,
      deploymentTransactionHash: safeCreationInfo.transactionHash as Hex,
      owners,
      guard,
      modules: decentModules,
      multisigTransactions: [],
      uniqueMultisigUsers: [],
      multisigVotesCount: 0,
    };
  }

  const multisigTransactions = await safeClient
    .getMultisigTransactions(daoAddress)
    .catch(() => safeClient.getMultisigTransactions(daoAddress));
  const pendingTransactions = await safeClient
    .getPendingTransactions(daoAddress)
    .catch(() => safeClient.getPendingTransactions(daoAddress));
  // combine and filter out any duplicate transactions
  const allTransactions = [...multisigTransactions.results, ...pendingTransactions.results].filter(
    (tx, index, self) => self.findIndex((t) => t.transactionHash === tx.transactionHash) === index,
  );
  const allProposals = allTransactions.map((tx, index) => {
    return {
      proposalId: BigInt(index + 1),
    };
  });

  const allUniqueUsers = new Set<Address>();
  let votesCount = 0;
  for (const proposal of allTransactions) {
    if (proposal?.proposer) {
      allUniqueUsers.add(proposal.proposer);
    }
    if (proposal?.confirmations) {
      for (const confirmation of proposal.confirmations) {
        allUniqueUsers.add(getAddress(confirmation.owner));
        votesCount += 1;
      }
    }
  }

  return {
    timeOfSafeCreation: safeCreationInfo.created,
    deploymentTransactionHash: safeCreationInfo.transactionHash as Hex,
    owners,
    guard,
    modules: decentModules,
    multisigTransactions: allProposals,
    uniqueMultisigUsers: Array.from(allUniqueUsers),
    multisigVotesCount: votesCount,
  };
}
