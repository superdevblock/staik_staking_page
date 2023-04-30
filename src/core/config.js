let presale_abi     = require("./ABI/PresaleFactory.json");
let Staking_abi     = require("./ABI/Staking.json");

let Token_abi       = require("./ABI/Token.json");
let usdt_abi        = require("./ABI/USDT.json");
let busd_abi        = require("./ABI/BUSD.json");
let weth_abi        = require("./ABI/weth.json");
let wbtc_abi        = require("./ABI/wbtc.json");

export const TOKEN_NAME = "Staik";
export const TOKEN_CONTRACT_ADDRESS = "0xD1E1B33EC6229F6FDb9d282C580e84273aeaD970";
export const TOKEN_STAKING_ADDRESS = "0x354BC15cB7883089f2D9B3012475b343c3F0A860";
export const LANGDING_URL = "https://staik.io/"; 

export const config = {
    chainId: 97, //Fuji testnet : 43113, mainnet : 43114.  bsctestnet : 97, Rikeby: 4
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
    USDTAddress: '0x337610d27c682e347c9cd60bd4b3b107c9d34ddd',
    USDTAbi: usdt_abi,    
    BUSDAddress: '0x78867bbeef44f2326bf8ddd1941a4439382ef2a7',
    BUSDAbi: busd_abi,
    WETHAddress: '0x1e33833a035069f42d68d1f53b341643de1c018d',
    WETHAbi: weth_abi,
    WBTCAddress: '0x1f12b61a35ca147542001186dea23e34eb4d7d95',
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
