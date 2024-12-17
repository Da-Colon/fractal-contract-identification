import type { Address } from "viem";
import { DEFAULT_CONTRACT_TYPE } from "./constants";
import type { ContractType } from "./types";

export type TestStats = {
  totalTests: number;
  exactMatches: number;
  noMatches: number;
  multipleMatches: number;
};

export type StatsMap = {
  [K in keyof ContractType]: TestStats;
};

export type NetworkStats = {
  networkName: string;
  stats: StatsMap;
};

export function initializeStats(): StatsMap {
  return Object.keys(DEFAULT_CONTRACT_TYPE).reduce((acc, key) => {
    acc[key as keyof ContractType] = {
      totalTests: 0,
      exactMatches: 0,
      noMatches: 0,
      multipleMatches: 0,
    };
    return acc;
  }, {} as StatsMap);
}

export function logTestResults(
  address: Address,
  expectedType: keyof ContractType,
  result: ContractType
) {
  const trueCount = Object.values(result).filter((v) => v).length;
  const matchedTypes = Object.entries(result)
    .filter(([_, value]) => value)
    .map(([key]) => key);
  const matchedExpected = result[expectedType];

  console.log(
    `${address}: expected=${expectedType}, matches=${trueCount} (${
      matchedTypes.join(", ") || "none"
    }) ${matchedExpected ? "✅" : "❌"}${!matchedExpected || trueCount !== 1 ? " ⚠️" : ""}`
  );
}

export function updateStats(
  stats: StatsMap,
  expectedType: keyof ContractType,
  result: ContractType
) {
  const trueCount = Object.values(result).filter((v) => v).length;
  const matchedExpected = result[expectedType];

  stats[expectedType].totalTests++;

  if (trueCount === 0) {
    stats[expectedType].noMatches++;
  } else if (trueCount === 1 && matchedExpected) {
    stats[expectedType].exactMatches++;
  } else {
    stats[expectedType].multipleMatches++;
  }
}
