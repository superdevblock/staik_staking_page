const { ethers, upgrades } = require("hardhat");

// TO DO: Place the address of your proxy here!
const proxyAddress = "0x5A85f01CAf4A4bE90A882c3370021f07b8Abcc81";

async function main() {
  const presale = await ethers.getContractFactory("PresaleFactory");
  const upgraded = await upgrades.upgradeProxy(proxyAddress, presale);
  console.log("PresaleFactory contract is upgraded!", upgraded.address);
}

main() 
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });