import type { Chain, Address } from "viem";
import { base, optimism, polygon, mainnet, sepolia } from "viem/chains";
import type { ContractType } from "./types";

export type NetworkConfig = {
  chain: Chain;
  alchemyUrl: string;
  factories: {
    address: Address;
    deploymentBlock: bigint;
  }[];
  MASTER_COPY_ADDRESSES: {
    address: Address;
    expectedType: keyof ContractType;
  }[];
  isTestnet: boolean;
};

export const NETWORKS: NetworkConfig[] = [
  {
    chain: base,
    isTestnet: false,
    alchemyUrl: "https://base-mainnet.g.alchemy.com/v2",
    factories: [
      {
        address: "0x31Bf73048056fe947B827C0Fe159ACcB5Ae30237",
        deploymentBlock: 12996642n,
      },
      {
        address: "0x000000000000addb49795b0f9ba5bc298cdda236",
        deploymentBlock: 7414414n,
      },
    ],
    MASTER_COPY_ADDRESSES: [
      {
        address: "0xc3A952B79FdEE28ee6c598ed1411e99d0BBe4D94",
        expectedType: "isClaimErc20",
      },
      {
        address: "0xF45EAc866BAD509B0CD233869b61be8b0BC6dBd8",
        expectedType: "isFreezeGuardAzorius",
      },
      {
        address: "0xcd6c149b3C0FE7284005869fa15080e85887c8F1",
        expectedType: "isFreezeGuardMultisig",
      },
      {
        address: "0xB1011541a6c195540506A0272E4Bb2f53797b477",
        expectedType: "isFreezeVotingErc20",
      },
      {
        address: "0x8F992966AAFbf311A8f2D33b8531476C04af0447",
        expectedType: "isFreezeVotingErc721",
      },
      {
        address: "0xFe376AAD5bB1c3Ce27fb27Ece130F7B0ba8D9642",
        expectedType: "isFreezeVotingMultisig",
      },
      {
        address: "0xdA92DE0BF973De947d0CcEE739E89bA64697e47F",
        expectedType: "isLinearVotingErc20",
      },
      {
        address: "0x6198B4a8E53108F06B768804A16152471EDa471b",
        expectedType: "isLinearVotingErc721",
      },
      {
        address: "0xD16368a8b709cBAfd47c480607a843144Bcd27Dc",
        expectedType: "isModuleAzorius",
      },
      {
        address: "0x87326A981fc56823e26599Ff4D0A4eceAFfF3be0",
        expectedType: "isModuleFractal",
      },
      {
        address: "0x7bE7B12DA74d48E541131DB1626Ee651A2105c45",
        expectedType: "isVotesErc20",
      },
      {
        address: "0x2b67F79f927Be670d44D56338A914BB6d17548C7",
        expectedType: "isVotesErc20Wrapper",
      },
    ],
  },
  {
    chain: optimism,
    isTestnet: false,
    alchemyUrl: "https://opt-mainnet.g.alchemy.com/v2",
    factories: [
      {
        address: "0x31Bf73048056fe947B827C0Fe159ACcB5Ae30237",
        deploymentBlock: 118640417n,
      },
      {
        address: "0x000000000000addb49795b0f9ba5bc298cdda236",
        deploymentBlock: 46817372n,
      },
    ],
    MASTER_COPY_ADDRESSES: [
      {
        address: "0xc3A952B79FdEE28ee6c598ed1411e99d0BBe4D94",
        expectedType: "isClaimErc20",
      },
      {
        address: "0xF45EAc866BAD509B0CD233869b61be8b0BC6dBd8",
        expectedType: "isFreezeGuardAzorius",
      },
      {
        address: "0xcd6c149b3C0FE7284005869fa15080e85887c8F1",
        expectedType: "isFreezeGuardMultisig",
      },
      {
        address: "0xB1011541a6c195540506A0272E4Bb2f53797b477",
        expectedType: "isFreezeVotingErc20",
      },
      {
        address: "0x8F992966AAFbf311A8f2D33b8531476C04af0447",
        expectedType: "isFreezeVotingErc721",
      },
      {
        address: "0xFe376AAD5bB1c3Ce27fb27Ece130F7B0ba8D9642",
        expectedType: "isFreezeVotingMultisig",
      },
      {
        address: "0xdA92DE0BF973De947d0CcEE739E89bA64697e47F",
        expectedType: "isLinearVotingErc20",
      },
      {
        address: "0x6198B4a8E53108F06B768804A16152471EDa471b",
        expectedType: "isLinearVotingErc721",
      },
      {
        address: "0xD16368a8b709cBAfd47c480607a843144Bcd27Dc",
        expectedType: "isModuleAzorius",
      },
      {
        address: "0x87326A981fc56823e26599Ff4D0A4eceAFfF3be0",
        expectedType: "isModuleFractal",
      },
      {
        address: "0x7bE7B12DA74d48E541131DB1626Ee651A2105c45",
        expectedType: "isVotesErc20",
      },
      {
        address: "0x2b67F79f927Be670d44D56338A914BB6d17548C7",
        expectedType: "isVotesErc20Wrapper",
      },
    ],
  },
  {
    chain: polygon,
    isTestnet: false,
    alchemyUrl: "https://polygon-mainnet.g.alchemy.com/v2",
    factories: [
      {
        address: "0x537D9E0d8F66C1eEe391C77f5D8a39d00444428c",
        deploymentBlock: 43952877n,
      },
      {
        address: "0x000000000000addb49795b0f9ba5bc298cdda236",
        deploymentBlock: 36581177n,
      },
    ],
    MASTER_COPY_ADDRESSES: [
      {
        address: "0x8B84158Fc3ab787C2Ab23703dD341a8a0211cEFf",
        expectedType: "isClaimErc20",
      },
      {
        address: "0x090dFe64Bc0A2742605b3Eb8064EF8b199f4C6Ae",
        expectedType: "isFreezeGuardAzorius",
      },
      {
        address: "0xd5c1EdE7dcE48Aa8b16b8a3390b1d8596847C15a",
        expectedType: "isFreezeGuardMultisig",
      },
      {
        address: "0x5026f2A188ef4afd931722Cf79cF272423aBAEb3",
        expectedType: "isFreezeVotingErc20",
      },
      {
        address: "0xaa2361554dCcAd8568798BF5C5A4282D6a7382be",
        expectedType: "isFreezeVotingErc721",
      },
      {
        address: "0xc90bC2F41EC8155F469581A2EC25705fcBCd9beF",
        expectedType: "isFreezeVotingMultisig",
      },
      {
        address: "0x99c55527cE2D3fA6d5D0CB12CD0b8e4d04E0C0A6",
        expectedType: "isLinearVotingErc20",
      },
      {
        address: "0x05DdAbED004C00A2874F68F1e81a8034c4D546FA",
        expectedType: "isLinearVotingErc721",
      },
      {
        address: "0x0C8f5b3986bC2292c7d6B541a0B0aD0637AE3347",
        expectedType: "isModuleAzorius",
      },
      {
        address: "0x13dB2c731DdC76c14E7e4ffEd879C8AacD7eE3b5",
        expectedType: "isModuleFractal",
      },
      {
        address: "0x83C89b1D6282526aA171Ad79CCCa2261FaC5823F",
        expectedType: "isVotesErc20",
      },
      {
        address: "0x19ed1990ffA463bA376b48a1BF65CE978E9aFe26",
        expectedType: "isVotesErc20Wrapper",
      },
    ],
  },
  {
    chain: mainnet,
    isTestnet: false,
    alchemyUrl: "https://eth-mainnet.g.alchemy.com/v2",
    factories: [
      {
        address: "0x31Bf73048056fe947B827C0Fe159ACcB5Ae30237",
        deploymentBlock: 17389310n,
      },
      {
        address: "0x000000000000addb49795b0f9ba5bc298cdda236",
        deploymentBlock: 16140611n,
      },
    ],
    MASTER_COPY_ADDRESSES: [
      {
        address: "0xc3A952B79FdEE28ee6c598ed1411e99d0BBe4D94",
        expectedType: "isClaimErc20",
      },
      {
        address: "0xF45EAc866BAD509B0CD233869b61be8b0BC6dBd8",
        expectedType: "isFreezeGuardAzorius",
      },
      {
        address: "0xcd6c149b3C0FE7284005869fa15080e85887c8F1",
        expectedType: "isFreezeGuardMultisig",
      },
      {
        address: "0xB1011541a6c195540506A0272E4Bb2f53797b477",
        expectedType: "isFreezeVotingErc20",
      },
      {
        address: "0xd71e2bdC28BFa907652Cfb8BeAfdF59822B71B1B",
        expectedType: "isFreezeVotingErc721",
      },
      {
        address: "0xFe376AAD5bB1c3Ce27fb27Ece130F7B0ba8D9642",
        expectedType: "isFreezeVotingMultisig",
      },
      {
        address: "0xdA92DE0BF973De947d0CcEE739E89bA64697e47F",
        expectedType: "isLinearVotingErc20",
      },
      {
        address: "0x75411F04c58C84daBDdEADE7cF6E1c1F40d4B611",
        expectedType: "isLinearVotingErc721",
      },
      {
        address: "0xD16368a8b709cBAfd47c480607a843144Bcd27Dc",
        expectedType: "isModuleAzorius",
      },
      {
        address: "0x87326A981fc56823e26599Ff4D0A4eceAFfF3be0",
        expectedType: "isModuleFractal",
      },
      {
        address: "0x7bE7B12DA74d48E541131DB1626Ee651A2105c45",
        expectedType: "isVotesErc20",
      },
      {
        address: "0x2b67F79f927Be670d44D56338A914BB6d17548C7",
        expectedType: "isVotesErc20Wrapper",
      },
    ],
  },
  {
    chain: sepolia,
    isTestnet: true,
    alchemyUrl: "https://eth-sepolia.g.alchemy.com/v2",
    factories: [
      {
        address: "0xE93e4B198097C4CB3A6de594c90031CDaC0B88f3",
        deploymentBlock: 4916639n,
      },
      {
        address: "0x000000000000addb49795b0f9ba5bc298cdda236",
        deploymentBlock: 3059000n,
      },
    ],
    MASTER_COPY_ADDRESSES: [
      {
        address: "0x0e18C56f0B4153065bD3a3127c61515819e8E4a2",
        expectedType: "isClaimErc20",
      },
      {
        address: "0x43Be57fbe7f255363BE5b7724EbA5513300a6D75",
        expectedType: "isFreezeGuardAzorius",
      },
      {
        address: "0x4B3c155C9bB21F482E894B4321Ac4d2DCF4A6746",
        expectedType: "isFreezeGuardMultisig",
      },
      {
        address: "0x7c5f4c0c171953f43a1F81C5b79B3450bC7AA7a4",
        expectedType: "isFreezeVotingErc20",
      },
      {
        address: "0xC49B7DA5098f6DeAD7Dffe3B5a49b0aA6bE854a9",
        expectedType: "isFreezeVotingErc721",
      },
      {
        address: "0x10Aff1BEB279C6b0077eee0DB2f0Cc9Cedd4c507",
        expectedType: "isFreezeVotingMultisig",
      },
      {
        address: "0xe04BC1f515Af4276d8d3907aBe359DC03b2f141b",
        expectedType: "isLinearVotingErc20",
      },
      {
        address: "0xE3B744725631326162777721Ed37cF32A0928714",
        expectedType: "isLinearVotingErc721",
      },
      {
        address: "0x8D4F390dae8c1F0F3b42199c6c3859aD6C9b3B3D",
        expectedType: "isModuleAzorius",
      },
      {
        address: "0x1B26345a4A41d9f588E1B161b6e8f21D27547184",
        expectedType: "isModuleFractal",
      },
      {
        address: "0x51c852BdF6ed00bAca4225EE940b426a56853ec9",
        expectedType: "isVotesErc20",
      },
      {
        address: "0xc2427b5D77Bd319511672095E9a5A845AA80f979",
        expectedType: "isVotesErc20Wrapper",
      },
    ],
  },
];

export function parseNetworksArg(): string {
  const networksArg = process.argv.find((arg) => arg.startsWith("--networks="));
  return networksArg ? networksArg.split("=")[1] : "all";
}

export function filterNetworks(networks: NetworkConfig[], filter: string): NetworkConfig[] {
  switch (filter) {
    case "testnets":
      return networks.filter((n) => n.isTestnet);
    case "mainnets":
      return networks.filter((n) => !n.isTestnet);
    case "all":
    default:
      return networks;
  }
}
