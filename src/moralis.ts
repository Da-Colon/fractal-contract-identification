import Moralis from "moralis";
import type { Address } from "viem";
import { camelCaseKeys } from "./utils";

export type MoralisTokenBalance = {
  tokenAddress: string;
  symbol: string;
  name: string;
  logo?: string;
  thumbnail?: string;
  decimals: number;
  balance: string;
  possibleSpam?: string | boolean; // Empty string means false lol, but still that's a string
  verifiedContract: boolean;
  balanceFormatted: string; // Balance formatted to decimals
  usdPrice?: number;
  usdValue?: number;
  nativeToken: boolean;
  portfolioPercentage: number;
};

export const initMoralis = async () => {
  if (!Moralis.Core.isStarted) {
    await Moralis.start({
      apiKey: process.env.MORALIS_API_KEY,
    });
  }
};

export const getTokenBalances = async (scope: { address: Address; chainId: string }) => {
  try {
    const walletTokenBalancePriceResponse =
      await Moralis.EvmApi.wallets.getWalletTokenBalancesPrice(scope);

    return walletTokenBalancePriceResponse.result
      .filter((tokenBalance) => tokenBalance.balance.value.toBigInt() > 0n)
      .map((tokenBalance) => {
        const tokenData = {
          ...camelCaseKeys(tokenBalance.toJSON()),
        } as unknown as MoralisTokenBalance;

        if (
          scope.chainId === "1" &&
          tokenData.tokenAddress === "0x8e870d67f660d95d5be530380d0ec0bd388289e1"
        ) {
          // USDP and just hardcode it to $1 because Moralis is saying (as of Sept 11 2024) that the price is $0
          tokenData.usdPrice = 1;
          tokenData.usdValue = Number(tokenData.balanceFormatted) * tokenData.usdPrice;
        }

        return tokenData;
      });
  } catch (error) {
    console.error(error);
  }
};
