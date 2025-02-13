import { Alchemy, Network } from "alchemy-sdk";
import { getAddress, type Address } from "viem";
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

async function getTokenMetadata(client: Alchemy, tokenAddresses: Address[]) {
  return Promise.all(
    tokenAddresses.map(async (address) => {
      try {
        const metadata = await client.core.getTokenMetadata(address);
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

export async function getTokenPrices(client: Alchemy, tokenAddresses: Address[], network: Network) {
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
        const rates = await client.prices.getTokenPriceByAddress(
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
  if (!value) return "---";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value));
}

export async function getERC20TokenData(address: Address, chainId: number) {
  const client = getAlchemyClient(chainId);
  try {
    const tokenBalances = await client.core.getTokenBalances(address);
    const tokenAddresses = tokenBalances.tokenBalances.map((token) =>
      getAddress(token.contractAddress),
    );
    const tokensMetadata = await getTokenMetadata(client, tokenAddresses);
    const tokensPrices = await getTokenPrices(client, tokenAddresses, getAlchemyNetwork(chainId));

    return tokenAddresses.map((address) => {
      const tma = tokensMetadata.find((token) => token.address === address);
      const tokenMetadata = tma ?? {
        address,
        name: null,
        symbol: null,
        logo: null,
        decimals: null,
      };

      const tusdprice = tokensPrices.find((price) => price.address === address);
      const tokenUSDPrice = tusdprice ?? {
        address,
        usdPrice: undefined,
      };
      const tb = tokenBalances.tokenBalances.find(
        (token) => getAddress(token.contractAddress) === address,
      );
      const tokenBalance = tb ?? {
        contractAddress: address,
        tokenBalance: "0",
      };

      const usdBalance = calculateUsdBalance(
        tokenBalance.tokenBalance,
        tokenMetadata.decimals,
        tokenUSDPrice.usdPrice,
      );
      return {
        address,
        name: tokenMetadata.name,
        symbol: tokenMetadata.symbol,
        logo: tokenMetadata.logo,
        decimals: tokenMetadata.decimals,
        usdPrice: tokenUSDPrice.usdPrice,
        usdPriceFrmt: formatUSDValue(Number(tokenUSDPrice.usdPrice)),
        usdBalance,
        usdBalanceFrmt: formatUSDValue(usdBalance),
        balance: tokenBalance.tokenBalance,
      };
    });
  } catch (error) {
    console.error(`Failed to fetch token data for address ${address} on chain ${chainId}`, error);
    return [];
  }
}
