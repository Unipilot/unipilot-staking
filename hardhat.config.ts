import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-etherscan";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
// import "solidity-coverage";

import "./tasks/deploy/staking";

import { resolve } from "path";

import { config as dotenvConfig } from "dotenv";
import { HardhatUserConfig } from "hardhat/config";
import { HardhatNetworkAccountUserConfig, NetworkUserConfig } from "hardhat/types";

dotenvConfig({ path: resolve(__dirname, "./.env") });

const chainIds = {
  ganache: 1337,
  goerli: 5,
  hardhat: 31337,
  kovan: 42,
  mainnet: 1,
  rinkeby: 4,
  ropsten: 3,
  mumbai: 80001,
};

// Ensure that we have all the environment variables we need.
// const mnemonic: string | undefined | HardhatNetworkAccountUserConfig =
//   process.env.MNEMONIC;
// if (!mnemonic) {
//   throw new Error("Please set your MNEMONIC in a .env file");
// }

const infuraApiKey: string | undefined = process.env.INFURA_API_KEY;
if (!infuraApiKey) {
  throw new Error("Please set your INFURA_API_KEY in a .env file");
}

let alchemyapiKey = process.env.FORK;

const etherscanApiKey = process.env.ETHERSCAN_API_KEY;
const polyscanApiKey = process.env.POLYGONSCAN_API_KEY;

function createTestnetConfig(network: keyof typeof chainIds): NetworkUserConfig {
  const url: string =
    network == "mumbai"
      ? "https://polygon-testnet.public.blastapi.io"
      : "https://" + network + ".infura.io/v3/" + infuraApiKey;
  return {
    accounts: [`${process.env.PK1}`],
    chainId: chainIds[network],
    url,
    gas: 2100000,
    gasPrice: 58000000000,
  };
}
const coinMarketCapKey = process.env.COIN_MARKETCAP;

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  gasReporter: {
    currency: "USD",
    coinmarketcap: coinMarketCapKey,
    gasPrice: 58,
    enabled: process.env.REPORT_GAS ? true : false,
    excludeContracts: [],
    src: "./contracts",
  },
  networks: {
    // hardhat: {
    //   accounts: {
    //     mnemonic,
    //   },
    //   chainId: chainIds.hardhat,
    // },

    goerli: createTestnetConfig("goerli"),
    kovan: createTestnetConfig("kovan"),
    rinkeby: createTestnetConfig("rinkeby"),
    ropsten: createTestnetConfig("ropsten"),
    mainnet: createTestnetConfig("mainnet"),
    mumbai: createTestnetConfig("mumbai"),
  },
  mocha: {
    timeout: 50000,
  },
  paths: {
    artifacts: "./artifacts",
    cache: "./cache",
    sources: "./contracts",
    tests: "./test",
  },
  solidity: {
    compilers: [
      {
        version: "0.8.15",
        settings: {
          metadata: {
            // Not including the metadata hash
            // https://github.com/paulrberg/solidity-template/issues/31
            bytecodeHash: "none",
          },
          // You should disable the optimizer when debugging
          // https://hardhat.org/hardhat-network/#solidity-optimizer-support
          optimizer: {
            enabled: true,
            runs: 10,
          },
        },
      },
    ],
  },
  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
  },
  etherscan: {
    apiKey: polyscanApiKey,
  },
};

export default config;
