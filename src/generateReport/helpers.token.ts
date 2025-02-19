import { Alchemy, Network } from "alchemy-sdk";
import { getAddress, type Address, type PublicClient } from "viem";
import { formatUnits } from "viem";

function getAlchemyNetwork(chainId: number) {
  switch (chainId) {
    case 1:
      return Network.ETH_MAINNET;
    case 10:
      return Network.OPT_MAINNET;
    case 137:
      return Network.MATIC_MAINNET;
    case 8453:
      return Network.BASE_MAINNET;
    case 11155111:
      return Network.ETH_SEPOLIA;
    default:
      throw new Error("Unsupported chain ID");
  }
}
const alchemyClients = new Map<number, Alchemy>();
function getAlchemyClient(chainId: number) {
  if (alchemyClients.has(chainId)) {
    return alchemyClients.get(chainId)!;
  }
  const alchemy = new Alchemy({
    apiKey: process.env.ALCHEMY_API_KEY,
    network: getAlchemyNetwork(chainId),
  });

  alchemyClients.set(chainId, alchemy);
  return alchemy;
}

async function getTokenMetadata(alchemyClient: Alchemy, tokenAddresses: Address[]) {
  return Promise.all(
    tokenAddresses.map(async (address) => {
      try {
        const metadata = await alchemyClient.core.getTokenMetadata(address);
        return {
          address,
          name: metadata.name,
          symbol: metadata.symbol,
          logo: metadata.logo,
          decimals: metadata.decimals,
        };
      } catch (error) {
        return {
          address,
          name: null,
          symbol: null,
          logo: null,
          decimals: null,
        };
      }
    }),
  );
}
const tokenPriceCache = new Map<string, { usdPrice?: string; timestamp: number }>();

export async function getTokenPrices(
  alchemyClient: Alchemy,
  tokenAddresses: Address[],
  network: Network,
) {
  try {
    const result: { address: Address; usdPrice?: string }[] = [];
    const batchSize = 25;

    for (let i = 0; i < tokenAddresses.length; i += batchSize) {
      const batchAddresses = tokenAddresses.slice(i, i + batchSize);

      // Determine which addresses need fresh data (i.e., missing or expired cache)
      const addressesToFetch = batchAddresses.filter((address) => {
        const cached = tokenPriceCache.get(address);
        return !cached || Date.now() - cached.timestamp >= 60 * 60 * 1000;
      });

      if (addressesToFetch.length > 0) {
        const rates = await alchemyClient.prices.getTokenPriceByAddress(
          addressesToFetch.map((address) => ({ address, network })),
        );

        for (const rate of rates.data) {
          const usdPrice = rate.prices.find((price) => price.currency === "usd")?.value;
          tokenPriceCache.set(rate.address, {
            usdPrice,
            timestamp: Date.now(),
          });
        }
      }

      // Build results using the updated cache
      for (const address of batchAddresses) {
        const cached = tokenPriceCache.get(address);
        result.push({
          address,
          usdPrice: cached?.usdPrice,
        });
      }
    }
    return result;
  } catch (error) {
    console.error("Failed to fetch token prices:", { network });
    return [];
  }
}
export function calculateUsdBalance(
  tokenBalance: string | null,
  decimals: number | null,
  usdPrice?: string,
) {
  if (usdPrice == undefined || tokenBalance === null || decimals === null) return;

  const humanReadableBalanceStr = formatUnits(BigInt(tokenBalance), decimals);
  const humanReadableBalance = parseFloat(humanReadableBalanceStr);
  if (isNaN(humanReadableBalance)) return;

  return humanReadableBalance * Number(usdPrice);
}

export function formatUSDValue(value: number | undefined) {
  if (!value) return "--";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value));
}

// New cache for fallback provider results keyed by token symbol.
const fallbackPriceCache = new Map<string, { usdPrice: string; timestamp: number }>();

// Helper to check if a cached fallback price is fresh (e.g., within 1 hour)
function isCacheFresh(cacheEntry: { timestamp: number }): boolean {
  return Date.now() - cacheEntry.timestamp < 60 * 60 * 1000;
}

async function getCoinPaprikaPrice(symbol: string): Promise<string | undefined> {
  try {
    const res = await fetch("https://api.coinpaprika.com/v1/tickers");
    if (!res.ok) {
      console.error("CoinPaprika API error");
      return undefined;
    }
    const data = await res.json();
    const ticker = data.find((item: any) => item.symbol.toLowerCase() === symbol.toLowerCase());
    return ticker ? ticker.quotes?.USD?.price?.toString() : undefined;
  } catch (error) {
    console.error("Error in CoinPaprika provider:", error);
    return undefined;
  }
}

async function getCoinCapPrice(symbol: string): Promise<string | undefined> {
  try {
    const res = await fetch("https://api.coincap.io/v2/assets");
    if (!res.ok) {
      console.error("CoinCap API error");
      return undefined;
    }
    const data = await res.json();
    const asset = data.data.find((item: any) => item.symbol.toLowerCase() === symbol.toLowerCase());
    return asset ? asset.priceUsd : undefined;
  } catch (error) {
    console.error("Error in CoinCap provider:", error);
    return undefined;
  }
}

const fallbackProviders: ((symbol: string) => Promise<string | undefined>)[] = [
  getCoinPaprikaPrice,
  getCoinCapPrice,
];

async function getFallbackPrice(symbol: string): Promise<string | undefined> {
  // Check if we already have a fresh cached value for this symbol.
  const cached = fallbackPriceCache.get(symbol.toLowerCase());
  if (cached && isCacheFresh(cached)) {
    return cached.usdPrice;
  }
  // Otherwise, iterate through the fallback providers.
  for (const provider of fallbackProviders) {
    const price = await provider(symbol);
    if (price !== undefined) {
      // Cache the result for this symbol.
      fallbackPriceCache.set(symbol.toLowerCase(), { usdPrice: price, timestamp: Date.now() });
      return price;
    }
  }
  return undefined;
}
async function getERC20TokenData(address: Address, chainId: number) {
  const client = getAlchemyClient(chainId);
  try {
    const tokenBalances = await client.core.getTokenBalances(address);
    const tokenAddresses = tokenBalances.tokenBalances.map((token) =>
      getAddress(token.contractAddress),
    );
    const tokensMetadata = await getTokenMetadata(client, tokenAddresses);
    const tokensPrices = await getTokenPrices(client, tokenAddresses, getAlchemyNetwork(chainId));

    const tokensData = await Promise.all(
      tokenAddresses.map(async (addr) => {
        const metadata = tokensMetadata.find((token) => token.address === addr) || {
          address: addr,
          name: null,
          symbol: null,
          logo: null,
          decimals: null,
        };
        let priceEntry = tokensPrices.find((price) => price.address === addr);
        if ((!priceEntry || !priceEntry.usdPrice) && metadata.symbol) {
          // Try the fallback providers, using the symbol.
          const fallbackPrice = await getFallbackPrice(metadata.symbol);
          priceEntry = { address: addr, usdPrice: fallbackPrice };
          if (fallbackPrice) {
            // Cache this fallback price in the main tokenPriceCache.
            tokenPriceCache.set(addr, { usdPrice: fallbackPrice, timestamp: Date.now() });
          }
        }
        const balanceInfo = tokenBalances.tokenBalances.find(
          (token) => getAddress(token.contractAddress) === addr,
        ) || { contractAddress: addr, tokenBalance: "0" };
        const usdBalance = calculateUsdBalance(
          balanceInfo.tokenBalance,
          metadata.decimals,
          priceEntry?.usdPrice,
        );
        return {
          address: addr,
          name: metadata.name,
          symbol: metadata.symbol,
          logo: metadata.logo,
          decimals: metadata.decimals,
          usdPrice: priceEntry?.usdPrice,
          usdPriceFrmt: formatUSDValue(Number(priceEntry?.usdPrice)),
          usdBalance,
          usdBalanceFrmt: formatUSDValue(usdBalance),
          balance: balanceInfo.tokenBalance,
        };
      }),
    );
    return tokensData;
  } catch (error) {
    console.error(`Failed to fetch token data for address ${address} on chain ${chainId}`, error);
    return [];
  }
}

export async function getTokenData(daoAddress: Address, viemClient: PublicClient) {
  const tokensData = await getERC20TokenData(daoAddress, viemClient.chain!.id);
  const totalTokenBalance = tokensData.reduce((acc, token) => acc + (token?.usdBalance ?? 0), 0);
  const totalTokenBalanceFrmt = formatUSDValue(totalTokenBalance);
  return {
    tokensData,
    totalTokenBalance,
    totalTokenBalanceFrmt,
  };
}
