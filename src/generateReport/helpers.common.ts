import type { Abi } from "viem";
import type { DAOData } from "./types.common";
import { getContractType } from "./types.contract";

export function combineAbis(...abisToCombine: Abi[]): Abi {
  return abisToCombine.flat();
}

export const createAddressSubstring = (address: string) => {
  return `${address.substring(0, 6)}...${address.slice(-4)}`;
};

export function formatDAOData(daoData: DAOData[]) {
  return daoData.map((dao) => {
    const daoMain = {
      "Dao Address": dao.address,
      "Dao Name": dao.name,
      Governance: dao.governanceType,
      Network: dao.network,
      Balance: dao.totalTokenBalanceFrmt,
    };
    const strategies = dao.strategies.length
      ? dao.strategies.reduce(
          (acc, strategy, index) => {
            acc[`Strategy ${index}`] = strategy;
            return acc;
          },
          {} as Record<string, string>,
        )
      : {};

    return {
      ...daoMain,
      ...strategies,
    };
  });
}
