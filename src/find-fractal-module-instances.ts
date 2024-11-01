import { ModuleProxyFactoryAbi } from "./abis/ModuleProxyFactoryAbi";
import {
  Address,
  Chain,
  createPublicClient,
  getContract,
  GetContractReturnType,
  http,
  PublicClient,
} from "viem";
import { mainnet, base, optimism, polygon } from "viem/chains";

interface Config {
  chain: Chain;
  urlPrefix: string;
  fractalModule: Address;
  moduleProxyFactory: Address;
  moduleProxyFactoryDeploymentBlock: bigint;
  oldModuleProxyFactory: Address;
  oldModuleProxyFactoryDeploymentBlock: bigint;
}

const configs: Config[] = [
  {
    chain: mainnet,
    urlPrefix: "https://eth-mainnet.g.alchemy.com/v2/",
    fractalModule: "0x87326A981fc56823e26599Ff4D0A4eceAFfF3be0",
    moduleProxyFactory: "0x000000000000aDdB49795b0f9bA5BC298cDda236",
    moduleProxyFactoryDeploymentBlock: 16140611n,
    oldModuleProxyFactory: "0x31Bf73048056fe947B827C0Fe159ACcB5Ae30237",
    oldModuleProxyFactoryDeploymentBlock: 17389310n,
  },
  {
    chain: polygon,
    urlPrefix: "https://polygon-mainnet.g.alchemy.com/v2/",
    fractalModule: "0x13dB2c731DdC76c14E7e4ffEd879C8AacD7eE3b5",
    moduleProxyFactory: "0x000000000000aDdB49795b0f9bA5BC298cDda236",
    moduleProxyFactoryDeploymentBlock: 36581177n,
    oldModuleProxyFactory: "0x537D9E0d8F66C1eEe391C77f5D8a39d00444428c",
    oldModuleProxyFactoryDeploymentBlock: 43952877n,
  },
  {
    chain: base,
    urlPrefix: "https://base-mainnet.g.alchemy.com/v2/",
    fractalModule: "0x87326A981fc56823e26599Ff4D0A4eceAFfF3be0",
    moduleProxyFactory: "0x000000000000aDdB49795b0f9bA5BC298cDda236",
    moduleProxyFactoryDeploymentBlock: 7414414n,
    oldModuleProxyFactory: "0x31Bf73048056fe947B827C0Fe159ACcB5Ae30237",
    oldModuleProxyFactoryDeploymentBlock: 12996642n,
  },
  {
    chain: optimism,
    urlPrefix: "https://opt-mainnet.g.alchemy.com/v2/",
    fractalModule: "0x87326A981fc56823e26599Ff4D0A4eceAFfF3be0",
    moduleProxyFactory: "0x000000000000aDdB49795b0f9bA5BC298cDda236",
    moduleProxyFactoryDeploymentBlock: 46817372n,
    oldModuleProxyFactory: "0x31Bf73048056fe947B827C0Fe159ACcB5Ae30237",
    oldModuleProxyFactoryDeploymentBlock: 118640417n,
  },
];

const getModuleProxyCreationLogs = async (
  moduleProxyFactoryContract: GetContractReturnType<
    typeof ModuleProxyFactoryAbi,
    PublicClient
  >,
  oldModuleProxyFactoryContract: GetContractReturnType<
    typeof ModuleProxyFactoryAbi,
    PublicClient
  >,
  moduleProxyFactoryDeploymentBlock: bigint,
  oldModuleProxyFactoryDeploymentBlock: bigint,
  fractalRegistry: Address
) => {
  const moduleProxyCreationLogs =
    await moduleProxyFactoryContract.getEvents.ModuleProxyCreation(
      {
        masterCopy: fractalRegistry,
      },
      {
        fromBlock: moduleProxyFactoryDeploymentBlock,
      }
    );

  const oldModuleProxyCreationLogs =
    await oldModuleProxyFactoryContract.getEvents.ModuleProxyCreation(
      {
        masterCopy: fractalRegistry,
      },
      {
        fromBlock: oldModuleProxyFactoryDeploymentBlock,
      }
    );

  return [...moduleProxyCreationLogs, ...oldModuleProxyCreationLogs];
};

const main = async () => {
  for (const config of configs) {
    const {
      chain,
      urlPrefix,
      fractalModule,
      moduleProxyFactory,
      moduleProxyFactoryDeploymentBlock,
      oldModuleProxyFactory,
      oldModuleProxyFactoryDeploymentBlock,
    } = config;

    const client = createPublicClient({
      chain,
      transport: http(`${urlPrefix}${process.env.ALCHEMY_API_KEY}`),
    });

    console.log(chain.name);

    const moduleProxyFactoryContract = getContract({
      address: moduleProxyFactory,
      abi: ModuleProxyFactoryAbi,
      client,
    });

    const oldModuleProxyFactoryContract = getContract({
      address: oldModuleProxyFactory,
      abi: ModuleProxyFactoryAbi,
      client,
    });

    const moduleProxyCreationLogs = await getModuleProxyCreationLogs(
      moduleProxyFactoryContract,
      oldModuleProxyFactoryContract,
      moduleProxyFactoryDeploymentBlock,
      oldModuleProxyFactoryDeploymentBlock,
      fractalModule
    );

    console.log("fractal module deployments on module proxy factory");
    console.log(moduleProxyCreationLogs);

    console.log("");
  }
};

main();
