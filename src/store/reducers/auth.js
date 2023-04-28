import { getType } from 'typesafe-actions';
import * as actions from '../actions';

export const defaultState = {
  user: {},
  web3: null,
  wallet: '',
  balance: {
    usdtBalance: '',
    astroBalance: ''
  },
  chainID: '',
  loading: false,
  busdApproveState: false,
  usdtApproveState: false,
  ethApproveState: false,
  btcbApproveState: false,
};

const states = (state = defaultState, action) => {
  const payload = action.payload;
  switch (action.type) {
    case getType(actions.setAuthState) :
      return { ...state, user: payload};
    case getType(actions.setWeb3) :
      return { ...state, web3: payload};
    case getType(actions.setWalletAddr):
      return { ...state, wallet: payload};
    case getType(actions.setChainID):
      return { ...state, chainID: payload};
    case getType(actions.setBalance):
      return { ...state, balance: payload};

    case getType(actions.setBNBApproveState):
      return { ...state, bnbApproveState: payload};
    case getType(actions.setBUSDApproveState):
      return { ...state, busdApproveState: payload};
    case getType(actions.setUSDTApproveState):
      return { ...state, usdtApproveState: payload};
    case getType(actions.setETHApproveState):
      return { ...state, ethApproveState: payload};
    case getType(actions.setBTCBApproveState):
      return { ...state, btcbApproveState: payload};

    case getType(actions.setApproveState):
      return { ...state, approveState: payload};

    case getType(actions.showLoader) :
      return { ...state, loading: true};
    case getType(actions.hideLoader) :
        return { ...state, loading: false};
      default:
      return state;
  }
};

export default states;
