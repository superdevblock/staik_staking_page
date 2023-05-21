let presale_abi     = require("./ABI/PresaleFactory.json");
let Staking_abi     = require("./ABI/Staking.json");

let Token_abi       = require("./ABI/Token.json");
let usdt_abi        = require("./ABI/USDT.json");
let busd_abi        = require("./ABI/BUSD.json");
let weth_abi        = require("./ABI/weth.json");
let wbtc_abi        = require("./ABI/wbtc.json");

export const TOKEN_NAME = "Staik";
export const TOKEN_CONTRACT_ADDRESS = "0x2dFee2792f4b4CC939F8274B60fEaaE756fA941E";
export const TOKEN_STAKING_ADDRESS = "0x977405CeB99fE83e615BFf163F677D14134a3a79";
export const LANGDING_URL = "https://staik.io/"; 

export const config = {
    chainId: 56, //Fuji testnet : 43113, mainnet : 43114.  bsctestnet : 97, Rikeby: 4
    // mainNetUrl: 'https://api.avax.network/ext/bc/C/rpc',
    // mainNetUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
    // mainNetUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
    // mainNetUrl: 'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
    // mainNetUrl: 'https://rinkeby.infura.io/v3/',
    mainNetUrl: 'https://bsc-dataseed.binance.org/',
    
    // PresaleFactoryAddress : "0xD9078f6F4078B37CBAA81C96956e5C6231a62106", // PresaleFactory
    // PresaleFactoryAbi : presale_abi,
    
    FiziAddress: TOKEN_CONTRACT_ADDRESS,
    FiziAbi: Token_abi,
    StakingAddress: TOKEN_STAKING_ADDRESS,
    StakingAbi: Staking_abi,
    USDTAddress: '0x55d398326f99059fF775485246999027B3197955',
    USDTAbi: usdt_abi,    
    BUSDAddress: '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56',
    BUSDAbi: busd_abi,
    WETHAddress: '0x2170Ed0880ac9A755fd29B2688956BD959F933F8',
    WETHAbi: weth_abi,
    WBTCAddress: '0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c',
    WBTCAbi: wbtc_abi,
    INFURA_ID: 'e6943dcb5b0f495eb96a1c34e0d1493e'
}

export const def_config = {
    REBASE_RATE: 0.0003944,
    DPR: 0.0191,
    APY: 1000.0337,
    SWAP_FEE: 0.053,
    AUTO_SLIPPAGE: 1,
    DAILY_CLAIM: 1,
    BUY_FEE: 0.15,
    SELL_FEE: 0.3,
    DEF_PRICE: 0.01,
    ASTRO_DIGIT: 2,
    MAX_PRESALE_AMOUNT: 8000000 // Presale max amount
}
