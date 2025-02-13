import type { Abi } from "viem";
import type { DAOData } from "./types.common";
import { getContractType } from "./types.contract";

export function combineAbis(...abisToCombine: Abi[]): Abi {
  return abisToCombine.flat();
}

export function formatDAOData(daoData: DAOData[]) {
  return daoData.map((dao) => {
    const daoMain = {
      "Dao Address": dao.address,
      Governance: dao.governanceType,
      Network: dao.network,
      Balance: dao.totalTokenBalance,
    };
    if (dao.governanceType === "Azorius") {
      return {
        ...daoMain,
        ...dao.strategies.reduce(
          (acc, strategy, index) => {
            const type = getContractType(strategy.type);
            acc[`Strategy ${index}`] = type;
            return acc;
          },
          {} as Record<string, string>,
        ),
      };
    }
    return {
      ...daoMain,
      owners: dao.owners.join(", "),
    };
  });
}
