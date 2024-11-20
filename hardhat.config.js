require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();


module.exports = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: process.env.ALCHEMY_SEPOLIA_ENDPOINT,
      accounts: [process.env.PRIVATE_KEY]
    }
  }
};
