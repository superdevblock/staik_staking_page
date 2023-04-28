const { ethers, upgrades } = require("hardhat");

async function main() {
  const Token = await ethers.getContractFactory("FiziToken");
  const token = await Token.deploy();

  console.log("This is FIZI token contract address: ", token.address);
}

main();