require('hardhat-deploy')
require("@nomicfoundation/hardhat-toolbox")
require('@nomiclabs/hardhat-etherscan')
require('hardhat-gas-reporter')
require('solidity-coverage')
require('dotenv').config()

/** @type import('hardhat/config').HardhatUserConfig */

const RINKEBY_RPS_URL = RINKEBY_RPS_URL
const PRIVATE_KEY = PRIVATE_KEY
const ETHERSCAN_API_KEY = ETHERSCAN_API_KEY
const COINMARKETCAP_API_KEY = COINMARKETCAP_API_KEY

module.exports = {
  // solidity: "0.8.9",
  solidity: {
    compilers: [{ version: '0.8.9' }, { version: '0.6.6' }]
  },
  defaultNetwork: "hardhat",
  networks: {
    rinkeby: {
      url: RINKEBY_RPS_URL,
      accounts: [PRIVATE_KEY],
      chainId: 4,
      blockConfirmations: 6,
    },
    localhost: {
      url: 'http://127.0.0.1:8545/',
      //accounts: [],
      chainId: 31337
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    user: {
      default: 1,
    }
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY
  },
  gasReporter: {
    enabled: true,
    outputFile: 'gas-reporter.txt',
    noColors: true,
    currency: 'USD',
    //coinmarketcap: COINMARKETCAP_API_KEY,
    token: 'MATIC',
  },
};

