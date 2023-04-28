// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  // const Register = await ethers.getContractFactory("Registration");
  // const register = await upgrades.deployProxy(Register, [], { initializer: 'initialize' } );
  // await register.deployed();

  // await register.unPause();


  // const proxyAddress = '0xc6db172A4863d0A5360B89fa1ccaC3f8FfF0bd9C'
  // const Register = await ethers.getContractFactory("Registration");
  // const upgraded = await upgrades.upgradeProxy(proxyAddress, Register);
  // console.log("Upgraded Address", upgraded.address)





  // const Register = await ethers.getContractFactory("Registration");
  // const register = await upgrades.deployProxy(Register, [], { initializer: 'initialize' } );
  // await register.deployed();
  // console.log("register address: ", register.address)

  // const TestBusd = await ethers.getContractFactory("TestBusd");
  // const busd = await TestBusd.deploy("TestBusd", "BUSD", 100000000000);
  // await busd.deployed();
  // console.log("busd address: ", busd.address)

  // const NetherDaoToken = await ethers.getContractFactory("NetherDaoToken");
  // const token = await NetherDaoToken.deploy("NTRDAO", "NTRDAO", 26000);
  // await token.deployed();
  // console.log("token address: ", token.address)
  const weth = '0xb4fbf271143f4fbf7b91a5ded31805e42b2208d6' //goerli
  const register = '0x2511A76194A9Bc8Fe555cbF276A0B0a9810D2F3a'
  // const busd = '0x60194b3eDF9b95A6087FE1940275AE7036641dd8'
  const token = '0xB04f49eEA90deE12810E0C8D15e67B9656565aa8'
  // const presale = '0xd753294Cc2F2be848C1cfAAffceEB2F4d7899B1f'
  // const marketplace = '0x7163f3F0399c1d52c126b847ab2A2AAC27BbBcb2'
  // const NTRDAOPresale = await ethers.getContractFactory("NTRDAOPresale");
  // const presale = await upgrades.deployProxy(NTRDAOPresale, [token, busd, register], { initializer: 'initialize' } );
  // await presale.deployed();
  // console.log("presale address: ", presale.address)

  // const Marketplace = await ethers.getContractFactory("NetherMarketplace")
  // const marketplace = await upgrades.deployProxy(Marketplace, [register, weth], {initializer: 'initialize'})
  // await marketplace.deployed();
  // console.log("marketplace address: ", marketplace.address)

  // await register.unPause();

  //   const proxyAddress = '0xC456A1E6AC909f9881AF50aeE8fE9bB25a8615Db'
  // const Register = await ethers.getContractFactory("Registration");
  // const upgraded = await upgrades.upgradeProxy(proxyAddress, Register);
  // console.log("Upgraded Address", upgraded.address)

  // const proxyAddress = '0xd753294Cc2F2be848C1cfAAffceEB2F4d7899B1f'
  // const NTRDAOPresale = await ethers.getContractFactory("NTRDAOPresale");
  // const upgraded = await upgrades.upgradeProxy(proxyAddress, NTRDAOPresale);
  // console.log("Upgraded Address", upgraded.address)

  // const register = '0xC456A1E6AC909f9881AF50aeE8fE9bB25a8615Db';
  // const Marketplace = await ethers.getContractFactory("NetherMarketplace")
  // const marketplace = await upgrades.deployProxy(Marketplace, [register, weth], {initializer: 'initialize', useDeployedImplementation: false})
  // await marketplace.deployed();

  // const proxyAddress = '0x22D717a862343f0B75c47FC7848B0Aadd885cF0F'
  // const Marketplace = await ethers.getContractFactory("NetherMarketplace");
  // const upgraded = await upgrades.upgradeProxy(proxyAddress, Marketplace);
  // console.log("Upgraded Address", upgraded.address)

  const NetherMarketplace = await ethers.getContractFactory("NetherMarketplace");
  const marketplace = await NetherMarketplace.deploy(register, weth);
  await marketplace.deployed();
  console.log("marketplace address: ", marketplace.address)

  
  // const TestBusd = await ethers.getContractFactory("TestBusd");
  // const busd = await TestBusd.deploy("TestBusd", "BUSD", 100000000000);
  // await busd.deployed();
  // console.log("busd address: ", busd.address)

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
