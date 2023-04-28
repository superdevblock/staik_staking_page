const { ethers, upgrades } = require("hardhat");
const {expect} = require('chai')
// const {uniqueString} = require('unique-string');
// const { time } = require('openzeppelin-test-helpers');
const assert = require('assert').strict;
const provider = waffle.provider;

require("@nomiclabs/hardhat-ethers");

describe("Test Token", async function () {
    let owner, accounts;
    let teamWallet;
    let register, token, presale, busd;
    before(async () => {
        [owner, ...accounts] = await ethers.getSigners();

        // const Register = await ethers.getContractFactory("Registration");
        // register = await Register.deploy();
        // await register.deployed();
        // console.log("Register address: ", register.address);


        const Register = await ethers.getContractFactory("Registration");
        register = await upgrades.deployProxy(Register, [], { initializer: 'initialize' } );
        await register.deployed();

        const TestBusd = await ethers.getContractFactory("TestBusd");
        busd = await TestBusd.deploy("TestBusd", "BUSD", 26000);
        await busd.deployed();

        const NetherDaoToken = await ethers.getContractFactory("NetherDaoToken");
        token = await NetherDaoToken.deploy("NTRDAO", "NTRDAO", 26000);
        await token.deployed();

        const NTRDAOPresale = await ethers.getContractFactory("NTRDAOPresale");
        presale = await upgrades.deployProxy(NTRDAOPresale, [token.address, busd.address], { initializer: 'initialize' } );
        await presale.deployed();

        await register.unPause();
    });
    
    // it("register features", async function () {

    //     await register.registerWithoutSponsor("owner", {value: ethers.utils.parseEther("0.075")})
    //     // console.log("sponsor Addresses Owner: ", await register.getSponsorAddresses(owner.address))

    //     // let ownerbytes =  await register.encode("ownerefefsefefsef")
    //     // console.log("encode: ", ownerbytes)
    //     // console.log("decode: ", await register.decode(ownerbytes))

    //     await register.connect(accounts[0]).registerWithSponsor("account0", "owner", {value: ethers.utils.parseEther("0.025")})
    //     // console.log("sponsor Addresses Account 0: ", await register.getSponsorAddresses(accounts[0].address))

        
    //     await register.connect(accounts[1]).registerWithSponsor("account1", "account0", {value: ethers.utils.parseEther("0.025")})
    //     // console.log("sponsor Addresses Account 1: ", await register.getSponsorAddresses(accounts[1].address))

        
    //     await register.connect(accounts[1]).changeAccount("account1", accounts[2].address)
    //     console.log("sponsor Addresses Account 2: ", await register.getSponsorAddresses(accounts[2].address))

    //     console.log("Sponsor Id of Account0: ", await register.getSponsorAddressFromId("account0"))
    //     console.log("Account0 Id: ", await register.getIdFromAddress(accounts[0].address))
    //     console.log("Account0 Address: ", await register.getAddressFromId("account0"))
    // });

    it("register features", async function () {

        await register.registerWithoutSponsor({value: ethers.utils.parseEther("0.075")})
        // console.log("sponsor Addresses Owner: ", await register.getSponsorAddresses(owner.address))

        // let ownerbytes =  await register.encode("ownerefefsefefsef")
        // console.log("encode: ", ownerbytes)
        // console.log("decode: ", await register.decode(ownerbytes))

        await register.connect(accounts[0]).registerWithSponsor(owner.address, {value: ethers.utils.parseEther("0.025")})
        // console.log("sponsor Addresses Account 0: ", await register.getSponsorAddresses(accounts[0].address))

        
        await register.connect(accounts[1]).registerWithSponsor(accounts[0].address, {value: ethers.utils.parseEther("0.025")})
        // console.log("sponsor Addresses Account 1: ", await register.getSponsorAddresses(accounts[1].address))

        console.log("Account0 Id: ", await register.getSponsorAddresses(accounts[1].address))
    });

    it("token features", async function () {
        await token.changePairContractAddress(accounts[10].address)
        console.log("Balance of Owner: ", await token.balanceOf(owner.address))
        await token.transfer(accounts[0].address, 100000000)
        await token.connect(accounts[0]).transfer(accounts[10].address, 5000000)
        
        await token.connect(accounts[0]).transfer(accounts[10].address, 4000000)

        await expect(token.connect(accounts[0]).transfer(accounts[10].address, 4000000)).to.be.revertedWith("Exceeded sold Amount.")

        await network.provider.send("evm_increaseTime", [86400 * 30])
        await network.provider.send("evm_mine")

        await token.connect(accounts[0]).transfer(accounts[10].address, 4000000)
        console.log("Sell Info of Account 0: ", await token.sellInfo(accounts[0].address))
    });

    it("presale features", async function () {
        await token.transfer(presale.address, ethers.utils.parseUnits("10000", 6))

        const blockNumBefore = await ethers.provider.getBlockNumber();
        const blockBefore = await ethers.provider.getBlock(blockNumBefore);
        const timestampBefore = blockBefore.timestamp;
        
        await   presale.setRoundInfo(0, ethers.utils.parseUnits("500", 18), timestampBefore, 86400 * 10, 60, 6, 0, 
                ethers.constants.MaxUint256, ethers.utils.parseEther("10", 18), ethers.utils.parseEther("10000", 18))

        await   presale.setRoundInfo(1, ethers.utils.parseUnits("500", 18), timestampBefore + 86400 * 10, 86400 * 10, 40, 6, 0, 
                ethers.constants.MaxUint256, ethers.utils.parseEther("10", 18), ethers.utils.parseEther("10000", 18))

        await   presale.setRoundInfo(2, ethers.utils.parseUnits("500", 18), timestampBefore + 86400 * 20, 86400 * 10, 40, 6, 0, 
                ethers.constants.MaxUint256, ethers.utils.parseEther("10", 18), ethers.utils.parseEther("10000", 18))

        console.log("Round0 Info: ", await presale.roundInfo(0))
        console.log("Round1 Info: ", await presale.roundInfo(1))

        console.log("Round Number: ", await presale.getRound())

        await busd.approve(presale.address, ethers.constants.MaxUint256)
        await presale.tokenPurchase(ethers.utils.parseUnits("500", 18))
        await presale.tokenPurchase(ethers.utils.parseUnits("1000", 18))

        console.log("Contribution info of Owner: ", await presale.getContribute(owner.address, 0))
        
        await network.provider.send("evm_increaseTime", [86400 * 10])
        await network.provider.send("evm_mine")
        
        await presale.tokenPurchase(ethers.utils.parseUnits("2000", 18))


        await network.provider.send("evm_increaseTime", [86400 * 10])
        await network.provider.send("evm_mine")
        
        await network.provider.send("evm_increaseTime", [86400 * 10])
        await network.provider.send("evm_mine")
        
        await expect(presale.tokenPurchase(ethers.utils.parseUnits("500", 18))).to.be.revertedWith("Not started any Round.")
        
        await expect(presale.claimTokens(0, 0)).to.be.revertedWith("Locked")
        
        await network.provider.send("evm_increaseTime", [86400 * 30 * 5])
        await network.provider.send("evm_mine")

        await expect(presale.claimRefund(0, 0)).to.be.revertedWith("Soft cap reached")

        console.log("token balance before: ", ethers.utils.formatUnits(await token.balanceOf(owner.address), 6))
        await presale.claimTokens(0, 0)
        console.log("token balance after: ", ethers.utils.formatUnits(await token.balanceOf(owner.address), 6))
        await presale.claimTokens(0, 1)
        console.log("token balance after: ", ethers.utils.formatUnits(await token.balanceOf(owner.address), 6))
    });
});