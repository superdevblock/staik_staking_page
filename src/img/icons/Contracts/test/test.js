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
    let register, token, presale, busd, marketplace, wbnb;
    before(async () => {
        [owner, ...accounts] = await ethers.getSigners();

        // const Register = await ethers.getContractFactory("Registration");
        // register = await Register.deploy();
        // await register.deployed();
        // console.log("Register address: ", register.address);

        const Register = await ethers.getContractFactory("Registration");
        register = await upgrades.deployProxy(Register, [], { initializer: 'initialize' } );
        await register.deployed();
        console.log("register address: ", register.address)

        const TestBusd = await ethers.getContractFactory("TestBusd");
        busd = await TestBusd.deploy("TestBusd", "BUSD", 100000000000);
        await busd.deployed();
        console.log("busd address: ", busd.address)

        const WBNB = await ethers.getContractFactory("WBNB");
        wbnb = await WBNB.deploy();
        await wbnb.deployed();
        console.log("wbnb address: ", wbnb.address)

        const NetherDaoToken = await ethers.getContractFactory("NetherDaoToken");
        token = await NetherDaoToken.deploy("NTRDAO", "NTRDAO", 26000);
        await token.deployed();
        console.log("token address: ", token.address)

        const NTRDAOPresale = await ethers.getContractFactory("NTRDAOPresale");
        presale = await upgrades.deployProxy(NTRDAOPresale, [token.address, busd.address, register.address], { initializer: 'initialize' } );
        await presale.deployed();
        console.log("presale address: ", presale.address)

        const Marketplace = await ethers.getContractFactory("NetherMarketplace")
        // marketplace = await upgrades.deployProxy(Marketplace, [register.address, wbnb.address], {initializer: 'initialize'})
        marketplace = await Marketplace.deploy(register.address, wbnb.address)
        await marketplace.deployed();
        console.log("marketplace address: ", marketplace.address)

        await register.unPause();
    });
    
    it("register features", async function () {

        await register.registerWithoutReferrer({value: ethers.utils.parseEther("0.075")})
        // console.log("sponsor Addresses Owner: ", await register.getSponsorAddresses(owner.address))

        // let ownerbytes =  await register.encode("ownerefefsefefsef")
        // console.log("encode: ", ownerbytes)
        // console.log("decode: ", await register.decode(ownerbytes))

        await register.connect(accounts[0]).registerWithReferrer(owner.address, {value: ethers.utils.parseEther("0.025")})
        // // console.log("sponsor Addresses Account 0: ", await register.getSponsorAddresses(accounts[0].address))

        
        await register.connect(accounts[1]).registerWithReferrer(accounts[0].address, {value: ethers.utils.parseEther("0.025")})
        // // console.log("sponsor Addresses Account 1: ", await register.getSponsorAddresses(accounts[1].address))

        await register.connect(accounts[2]).registerWithReferrer(accounts[1].address, {value: ethers.utils.parseEther("0.025")})
        // // console.log("sponsor Addresses Account 1: ", await register.getSponsorAddresses(accounts[1].address))

        await register.connect(accounts[3]).registerWithReferrer(accounts[2].address, {value: ethers.utils.parseEther("0.025")})
        // // console.log("sponsor Addresses Account 1: ", await register.getSponsorAddresses(accounts[1].address))

        await register.connect(accounts[4]).registerWithReferrer(accounts[3].address, {value: ethers.utils.parseEther("0.025")})
        // // console.log("sponsor Addresses Account 1: ", await register.getSponsorAddresses(accounts[1].address))

        await register.connect(accounts[5]).registerWithReferrer(accounts[4].address, {value: ethers.utils.parseEther("0.025")})
        // // console.log("sponsor Addresses Account 1: ", await register.getSponsorAddresses(accounts[1].address))

        await register.connect(accounts[6]).registerWithReferrer(accounts[5].address, {value: ethers.utils.parseEther("0.025")})
        // // console.log("sponsor Addresses Account 1: ", await register.getSponsorAddresses(accounts[1].address))

        console.log("Account6 sponsors: ", await register.getReferrerAddresses(accounts[6].address))
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
        
        await   presale.setRoundInfo(0, 500, timestampBefore, 86400 * 10, 60, 6, 0, 100000000)

        await   presale.setRoundInfo(1, 500, timestampBefore + 86400 * 10, 86400 * 10, 40, 6, 0, 100000000)

        await   presale.setRoundInfo(2, 500, timestampBefore + 86400 * 20, 86400 * 10, 40, 6, 0, 100000000)

        console.log("Round0 Info: ", await presale.roundInfo(0))
        console.log("Round1 Info: ", await presale.roundInfo(1))

        console.log("Round Number: ", await presale.getRound())

        await busd.approve(presale.address, ethers.constants.MaxUint256)
        await presale.tokenPurchase(ethers.utils.parseUnits("500", 18))
        await presale.tokenPurchase(ethers.utils.parseUnits("1000", 18))

        await busd.transfer(accounts[4].address, ethers.utils.parseUnits("100000", 18))
        await busd.connect(accounts[4]).approve(presale.address, ethers.constants.MaxUint256)

        console.log("busd balance before: ", ethers.utils.formatUnits(await busd.balanceOf(presale.address), 18))
        await presale.connect(accounts[4]).tokenPurchase(ethers.utils.parseUnits("1000", 18))
        console.log("busd balance after: ", ethers.utils.formatUnits(await busd.balanceOf(presale.address), 18))

        console.log("Contribution info of Owner: ", await presale.getContribute(owner.address, 0))
        
        await network.provider.send("evm_increaseTime", [86400 * 10])
        await network.provider.send("evm_mine")
        
        await presale.tokenPurchase(ethers.utils.parseUnits("2000", 18))


        await network.provider.send("evm_increaseTime", [86400 * 10])
        await network.provider.send("evm_mine")
        
        await network.provider.send("evm_increaseTime", [86400 * 10])
        await network.provider.send("evm_mine")
        
        await expect(presale.tokenPurchase(ethers.utils.parseUnits("500", 18))).to.be.revertedWith("Not started any Round.")
        
        // await expect(presale.claimTokens(0, 0)).to.be.revertedWith("Locked")
        
        await network.provider.send("evm_increaseTime", [86400 * 30 * 5])
        await network.provider.send("evm_mine")

        console.log("token balance before: ", ethers.utils.formatUnits(await token.balanceOf(owner.address), 6))
        await presale.claimTokens(0, 0)
        console.log("token balance after: ", ethers.utils.formatUnits(await token.balanceOf(owner.address), 6))
        await presale.claimTokens(0, 1)
        console.log("token balance after: ", ethers.utils.formatUnits(await token.balanceOf(owner.address), 6))
    });

    it("Marketplace features", async () => {
        const nativeNftAddress = await marketplace.callStatic.createCollection("NetherNFT", "NNT", "http", 2^256-1, {value: ethers.utils.parseEther("0.0001")})
        await marketplace.createCollection("NetherNFT", "NNT", "http", 2^256-1, {value: ethers.utils.parseEther("0.0001")})
        console.log("native nft address: ", nativeNftAddress)
        
        const nft = await ethers.getContractAt("NFTCollection", nativeNftAddress)
        await nft.setApprovalForAll(marketplace.address, true)

        await marketplace.createItems(nft.address, "http", 10, ethers.utils.parseEther("0.01"), {value: ethers.utils.parseEther("0.002")})
        await marketplace.editItemForSale(nft.address, 1, ethers.utils.parseEther("1"))
        await marketplace.connect(accounts[0]).buyForListedItem(nft.address, 1, {value: ethers.utils.parseEther("1")})
        
        await marketplace.cancelItemForSale(nft.address, 2)
        await marketplace.createAuction(nft.address, 2, ethers.utils.parseEther("1"), 86400)

        await marketplace.connect(accounts[2]).bidOnAuction(nft.address, 2, {value: ethers.utils.parseEther("1.1")})
        console.log("Account 2 ETH balance: ", ethers.utils.formatEther(await provider.getBalance(accounts[2].address)))
        await marketplace.connect(accounts[3]).bidOnAuction(nft.address, 2, {value: ethers.utils.parseEther("1.2")})
        console.log("Account 2 ETH balance: ", ethers.utils.formatEther(await provider.getBalance(accounts[2].address)))
        
        await network.provider.send("evm_increaseTime", [86400])
        await network.provider.send("evm_mine")
        
        // console.log("Account 3 ETH balance: ", ethers.utils.formatEther(await provider.getBalance(accounts[3].address)))
        // await marketplace.cancelAuction(nft.address, 2)
        // console.log("Account 3 ETH balance: ", ethers.utils.formatEther(await provider.getBalance(accounts[3].address)))

        // console.log("Auction State: ", await marketplace.getAuctionInfo(nft.address, 2))
        
        console.log("Account 3 ETH balance: ", ethers.utils.formatEther(await provider.getBalance(accounts[3].address)))
        await marketplace.connect(accounts[3]).endAuction(nft.address, 2)
        console.log("Account 3 ETH balance: ", ethers.utils.formatEther(await provider.getBalance(accounts[3].address)))

        // console.log("Auction State: ", await marketplace.getAuctionInfo(nft.address, 2))

        await marketplace.connect(accounts[3]).bidOnNonAuctionItem(nft.address, 3, ethers.utils.parseEther("1"))
        await marketplace.connect(accounts[3]).bidOnNonAuctionItem(nft.address, 3, ethers.utils.parseEther("1.1"))
        await marketplace.connect(accounts[4]).bidOnNonAuctionItem(nft.address, 3, ethers.utils.parseEther("1.2"))

        await wbnb.deposit({value: ethers.utils.parseEther("10")})
        await wbnb.approve(marketplace.address, 2^256 - 1)
        
        await wbnb.connect(accounts[3]).deposit({value: ethers.utils.parseEther("10")})
        await wbnb.connect(accounts[3]).approve(marketplace.address, ethers.utils.parseEther("100000000"))
        
        // await marketplace.connect(accounts[1]).buyForListedItem(nft.address, 3, {value: ethers.utils.parseEther("0.01")})
        await nft.connect(accounts[1]).setApprovalForAll(marketplace.address, true)

        // await marketplace.connect(accounts[1]).acceptBid(nft.address, 3, 0)
        console.log("Owner ETH balance: ", ethers.utils.formatEther(await wbnb.balanceOf(owner.address)))
        await marketplace.acceptBid(nft.address, 3, 0)
        console.log("Owner ETH balance: ", ethers.utils.formatEther(await wbnb.balanceOf(owner.address)))
    })
});