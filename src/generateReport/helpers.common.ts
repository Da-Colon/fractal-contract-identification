import type { Abi } from "viem";

export function combineAbis(...abisToCombine: Abi[]): Abi {
  return abisToCombine.flat();
}
