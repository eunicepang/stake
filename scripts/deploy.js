const hre = require("hardhat");
const { ethers } = require("ethers");

async function main() {
  const Stake = await hre.ethers.getContractFactory("Stake");
  const stake = await Stake.deploy();
  await stake.waitForDeployment()

  console.log("Stake deployed to:", await stake.getAddress());
}


main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });