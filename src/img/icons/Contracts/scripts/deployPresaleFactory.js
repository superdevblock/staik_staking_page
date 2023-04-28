const { ethers, upgrades } = require("hardhat");

async function main() {
  const PresaleFactoryFee = await ethers.getContractFactory("PresaleFactoryFee");
  const proxy = await upgrades.deployProxy(PresaleFactoryFee, [], { initializer: 'initialize' } );
  await proxy.deployed();
  // const upgradeContract = await upgrades.upgradeProxy("0xc9926FACD4D4bDCCD57bdF4e4719629Fdba6f5b2", PresaleFactory);
  // await upgradeContract.deployed();

  console.log("This is PresaleFactoryFee contract address: ", proxy.address);
  // console.log("PresaleFactory is upgraded successfully! : ", upgradeContract.address);
}

main();