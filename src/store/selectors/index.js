// auth
export const userState              = (state) => state.auth.user;
export const web3State              = (state) => state.auth.web3;
export const userBalance            = (state) => state.auth.balance;

export const userBNBApproveState    = (state) => state.auth.bnbApproveState;
export const userBUSDApproveState   = (state) => state.auth.busdApproveState;
export const userUSDTApproveState   = (state) => state.auth.usdtApproveState;
export const userETHApproveState    = (state) => state.auth.ethApproveState;
export const userBTCBApproveState   = (state) => state.auth.btcbApproveState;

export const userApproveState        = (state) => state.auth.approveState;

export const userWallet             = (state) => state.auth.wallet;
export const authChainID            = (state) => state.auth.chainID;
export const loadingState           = (state) => state.auth.loading;