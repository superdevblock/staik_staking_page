import { 
    createAction as action, 
    createAsyncAction as asyncAction 
} from 'typesafe-actions';

export const getNftBreakdown = asyncAction(
    'nft/GET_NFT_BREAKDOWN',
    'nft/GET_NFT_BREAKDOWN_SUCCESS',
    'nft/GET_NFT_BREAKDOWN_FAIL'
)();

export const setWeb3                = action('auth/SET_WEB3')();
export const setAuthState           = action('auth/SET_AUTH_STATE')();
export const setWalletAddr          = action('auth/SET_WALLET_ADDR')();
export const setChainID             = action('auth/SET_CHAIN_ID')();
export const setBalance             = action('auth/SET_BALANCE')();

export const setBNBApproveState     = action('auth/SET_BNB_APPROVE_STATE')();
export const setBUSDApproveState    = action('auth/SET_BUSD_APPROVE_STATE')();
export const setUSDTApproveState    = action('auth/SET_USDT_APPROVE_STATE')();
export const setETHApproveState     = action('auth/SET_ETH_APPROVE_STATE')();
export const setBTCBApproveState    = action('auth/SET_BTCB_APPROVE_STATE')();

export const setApproveState        = action('auth/SET_APPROVE_STATE')();

export const showLoader             = action('auth/SHOW_LOADER')();
export const hideLoader             = action('auth/HIDE_LOADER')();