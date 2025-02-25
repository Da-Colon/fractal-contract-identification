import { identifyContract } from "./helpers.contract";
import { getAddress, zeroAddress, type Address, type PublicClient } from "viem";
import type { ContractType } from "./types.contract";
import GnosisSafeL2Abi from "../abis/GnosisSafeL2Abi";
import { SENTINEL_ADDRESS } from "./variables.common";

function getFactoryDeploymentBlockNumber(chainId: number) {
  switch (chainId) {
    case 1:
      return 12504126n;
    case 11155111:
      return 2086864n;
    case 10:
      return 3936933n;
    case 137:
      return 14370881n;
    case 8453:
      return 2156359n;
    default:
      throw new Error(`Unsupported chain ID: ${chainId}`);
  }
}
export async function getSafeData(daoAddress: Address, viemClient: PublicClient) {
  const [nonce, threshold, modules, owners, version] = await viemClient.multicall({
    contracts: [
      {
        abi: GnosisSafeL2Abi,
        address: daoAddress,
        functionName: "nonce",
      },
      {
        abi: GnosisSafeL2Abi,
        address: daoAddress,
        functionName: "getThreshold",
      },
      {
        abi: GnosisSafeL2Abi,
        address: daoAddress,
        functionName: "getModulesPaginated",
        args: [SENTINEL_ADDRESS, 10n],
      },
      {
        abi: GnosisSafeL2Abi,
        address: daoAddress,
        functionName: "getOwners",
      },
      {
        abi: GnosisSafeL2Abi,
        address: daoAddress,
        functionName: "VERSION",
      },
    ],
    allowFailure: false,
  });

  const GUARD_STORAGE_SLOT = "0x3a";
  const guardStorageValue = await viemClient.getStorageAt({
    address: daoAddress,
    slot: GUARD_STORAGE_SLOT,
  });

  const safeInfo = {
    address: daoAddress,
    nonce: Number(nonce ?? 0),
    threshold: Number(threshold ?? 0),
    owners: [...owners] as Address[],
    modules: [...modules[0], modules[1]] as Address[],
    fallbackHandler: zeroAddress,
    guard: guardStorageValue ? getAddress(`0x${guardStorageValue.slice(-40)}`) : zeroAddress,
    version,
    singleton: zeroAddress,
  };

  const deploymentBlockNumber = getFactoryDeploymentBlockNumber(viemClient.chain!.id) || 0n;
  const safeInfoModules = safeInfo.modules;
  const safeInfoOwners = [...safeInfo.owners] as Address[];
  const guard = safeInfo.guard;

  const decentModules: { address: Address; type: ContractType }[] = [];
  for (const module of safeInfoModules) {
    const type = await identifyContract(viemClient, module);
    if (type) {
      decentModules.push({
        address: module,
        type,
      });
    }
  }

  const [azoriusModule] = decentModules.filter((m) => m.type.isModuleAzorius);
  if (!!azoriusModule) {
    return {
      deploymentBlockNumber: deploymentBlockNumber,
      owners: safeInfoOwners,
      guard,
      modules: decentModules,
      multisigTransactions: [],
      uniqueMultisigUsers: [],
      multisigVotesCount: 0,
    };
  }

  // const multisigTransactions = await safeClient
  //   .getMultisigTransactions(daoAddress)
  //   .catch(() => safeClient.getMultisigTransactions(daoAddress));
  // const pendingTransactions = await safeClient
  //   .getPendingTransactions(daoAddress)
  //   .catch(() => safeClient.getPendingTransactions(daoAddress));
  // const allTransactions = [...multisigTransactions.results, ...pendingTransactions.results].filter(
  //   (tx, index, self) => self.findIndex((t) => t.transactionHash === tx.transactionHash) === index,
  // );
  // const allProposals = allTransactions.map((_, index) => ({
  //   proposalId: BigInt(index + 1),
  // }));

  // const allUniqueUsers = new Set<Address>();
  // let votesCount = 0;
  // for (const proposal of allTransactions) {
  //   if (proposal?.proposer) {
  //     allUniqueUsers.add(proposal.proposer);
  //   }
  //   if (proposal?.confirmations) {
  //     for (const confirmation of proposal.confirmations) {
  //       allUniqueUsers.add(getAddress(confirmation.owner));
  //       votesCount++;
  //     }
  //   }
  // }

  return {
    deploymentBlockNumber,
    owners: safeInfoOwners,
    guard,
    modules: decentModules,
    // multisigTransactions: allProposals,
    multisigTransactions: [] as any,
    // multisigVotes: allTransactions,
    // uniqueMultisigUsers: Array.from(allUniqueUsers),
    uniqueMultisigUsers: [] as Address[],
    // multisigVotesCount: votesCount,
    multisigVotesCount: [] as any,
  };
}

// const deployment = safeDeployments.getProxyFactoryDeployment({
//   network: viemClient.chain!.id.toString(),
//   version: safeInfo.version,
// });
// const proxyFactoryAddress = getAddress(deployment?.defaultAddress!);
// const chunkSize = 2000n;
// let fromBlock = getFactoryDeploymentBlockNumber(viemClient.chain!.id) || 0n;
// const latestBlock = await viemClient.getBlockNumber();
// let creationLog: any = null;

// while (fromBlock <= latestBlock) {
//   let toBlock = fromBlock + chunkSize;
//   if (toBlock > latestBlock) {
//     toBlock = latestBlock;
//   }
//   const creationLogs = await viemClient.getContractEvents({
//     abi: GnosisSafeProxyFactoryAbi,
//     address: proxyFactoryAddress,
//     eventName: "ProxyCreation",
//     args: [daoAddress],
//     fromBlock,
//   });
//   if (creationLogs.length > 0) {
//     creationLog = creationLogs[0];
//     break;
//   }
//   fromBlock = toBlock + 1n;
// }

// let deploymentBlockNumber: bigint = 0n;
// if (creationLog) {
//   deploymentBlockNumber = creationLog.blockNumber;
// }
