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
      return Network.POLYNOMIAL_MAINNET;
    case 8543:
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
      const metadata = await client.core.getTokenMetadata(address);
      return {
        address,
        name: metadata.name,
        symbol: metadata.symbol,
        logo: metadata.logo,
        decimals: metadata.decimals,
      };
    }),
  );
}

async function getTokenPrices(client: Alchemy, tokenAddresses: Address[], network: Network) {
  const rates = await client.prices.getTokenPriceByAddress(
    tokenAddresses.map((address) => ({
      address,
      network,
    })),
  );
  return rates.data.map((rate) => ({
    address: getAddress(rate.address),
    usdPrice: rate.prices.find((price) => price.currency === "usd")?.value,
  }));
}

export function calculateUsdBalance(tokenBalance: string, decimals: number, usdPrice?: string) {
  // If no USD price is provided, we cannot compute a balance.
  if (usdPrice == undefined) return;

  try {
    const humanReadableBalanceStr = formatUnits(BigInt(tokenBalance), decimals);
    const humanReadableBalance = parseFloat(humanReadableBalanceStr);
    if (isNaN(humanReadableBalance)) return;

    return humanReadableBalance * Number(usdPrice);
  } catch (error) {
    return;
  }
}

export function formatUSDValue(value: number | undefined) {
  if (!value) return "n/a";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value));
}

export async function getERC20TokenData(address: Address, chainId: number) {
  const client = getAlchemyClient(chainId);
  const tokenBalances = await client.core.getTokenBalances(address);
  const tokenAddresses = tokenBalances.tokenBalances.map((token) =>
    getAddress(token.contractAddress),
  );
  const tokensMetadata = await getTokenMetadata(client, tokenAddresses);
  const tokensPrices = await getTokenPrices(client, tokenAddresses, getAlchemyNetwork(chainId));

  return tokenAddresses.map((address) => {
    const tokenMetadata = tokensMetadata.find((token) => token.address === address);
    const tokenUSDPrice = tokensPrices.find((price) => price.address === address);
    const balance = tokenBalances.tokenBalances.find(
      (token) => getAddress(token.contractAddress) === address,
    );
    if (!tokenMetadata || !tokenUSDPrice || !balance?.tokenBalance || !tokenMetadata?.decimals) {
      // @todo don't leave this as an error. should return whatever data is available
      throw new Error(`Failed to fetch token metadata, price or balance for address ${address}`);
    }
    const usdBalance = calculateUsdBalance(
      balance.tokenBalance,
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
      balance: balance.tokenBalance,
    };
  });
}
