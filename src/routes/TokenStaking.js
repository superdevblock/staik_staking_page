import React, { useState, useEffect, useCallback } from 'react'; // react componet
import { useSelector } from 'react-redux';
import styled, { createGlobalStyle } from 'styled-components';
import { useMediaQuery } from 'react-responsive';
import Modal from 'react-modal';
import Reveal from 'react-awesome-reveal';
import ReactLoading from "react-loading";
import LoadingButton from '@mui/lab/LoadingButton';
import { toast } from 'react-toastify';
import * as selectors from '../store/selectors';
import { fadeIn, fadeInUp, isEmpty } from '../components/utils';
import {
  getTotalStakedAmount,
  getTotalStakedAccount,
  getStakedAmountOfAccount,
  getTokenBalanceOfAcocunt,
  StakingToken,
  showClaimToken,
  approveTokens,
  getClaimToken,
  UnstakingToken,
  getLastStakeTime
} from '../core/web3';

import { TOKEN_NAME } from '../core/config';
import Swal from 'sweetalert2';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAddressBook, faChartSimple, faUsersViewfinder } from '@fortawesome/free-solid-svg-icons'
import Linechart from '../components/linechart';

const tabItems = [
  { title: 'Staking' },
  { title: 'Unstaking' },
  { title: 'Claim' }
];

const GlobalStyles = createGlobalStyle`
  .main {
    width: 100%;
  }

  .ico-container {
    display: flex;
    align-items: center;
    justify-content: start;
    flex-direction: column;
    background-size: 100% !important;
    background-position-x: center !important;
    .ico-header {
      max-width: 900px;
      padding: 20px;
      .ico-title {
        font-size: 36px;
        font-family: "Montserrat", Sans-serif;
      }
      .ico-desc {
        font-size: 20px;
      }
    }
    @media only screen and (max-width: 1400px) {
      flex-direction: column;
    }
    @media only screen and (max-width: 768px) {
      padding: 10px;
      .ico-header {
        padding: 20px;
        .ico-title {
          font-size: 28px;
        }
        .ico-desc {
          font-size: 18px;
        }
      }
    }
  }

  .input-token-panel {
    display: flex;
    background-color: transparent;
    flex-direction: column;
    text-align: left;
    gap: 10px;
    width: 45%;
    .input-box {
      border: solid 1px white;
      border-radius: 8px;
      @media only screen and (max-width: 576px) {
        span {
          font-size: 15px !important;
        }
      }
    }
    @media only screen and (max-width: 768px) {
      width: 100%;
    }
  }

  .input-token {
    width: 80%;
    background: transparent;
    outline: none;
    padding: 10px;
    font-size: 20px;
    font-weight: bold;
    color: white;
    white-space: nowrap;
    text-overflow: ellipsis;
    display: flex;
    align-items: center;
    span {
      font-size: 18px;
      font-weight: normal;
    }
  }

  .email_input {
    max-width: 300px;
  }

  .select-coin {
    font-family: IBM Plex Sans,sans-serif;
    font-size: 1.2rem;
    box-sizing: border-box;
    min-height: calc(1.5em + 22px);
    background: transparent;
    border: none;
    padding: 10px;
    text-align: left;
    line-height: 1.5;
    color: white;
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    -webkit-flex-direction: row;
    -ms-flex-direction: row;
    flex-direction: row;
    width: 140px;
    -webkit-box-pack: justify;
    -webkit-justify-content: space-between;
    justify-content: space-between;
    -webkit-align-items: center;
    -webkit-box-align: center;
    -ms-flex-align: center;
    align-items: center;
  }

  .presale-content {
    max-width: 100%;
    padding: 10px;
    background: rgba(103, 58, 58, 0.15);
    border-radius: 20px;
    @media only screen and (max-width: 768px) {
      max-width: 100%;
    }
  }

  .presale-inner {
    border-radius: 12px;
    padding: 0px;
    position: relative;
    background: transparent;
    h3 {
      line-height: 2;
      margin-bottom: 0;
    }
    @media only screen and (max-width: 1024px) {
      padding: 60px 40px 40px;
    }
    @media only screen and (max-width: 768px) {
      padding: 0px 10px 40px;
    }
  }

  .presale-bg {
    position: fixed;
    width: 100%;
    height: 100vh;
    top: 76px;
  }

  .end-content {
    background: #2d81e2;
    padding: 16px;
    border-radius: 40px;
    width: 80%;
    margin: auto;
    margin-top: 5px;
    margin-bottom: 5px;
  }

  .buy_content {
    padding: 22px;
    border: solid 1.5px #5a5196;
    border-radius: 20px;
  }

  .progress-bg {
    @media only screen and (max-width: 576px) {
      width: 60%;
    }
  }

  .inverstors {
    width: fit-content;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 25px;
  }

  .amount_bar_text {
    display: flex;
    justify-content: space-between;
  }

  .progress {
    height: 1.5rem;
    background-color: #a9a9a9;
  }

  .progress-bar {
    background-color: #7621ff;
  }

  .MuiLoadingButton-root {
    transition: all 0.5s ease;
  }

  .MuiLoadingButton-loading {
    padding-right: 40px;
    background: linear-gradient(90deg, #aa2d78 -3.88%, #a657ae 100%);
    color: rgb(255 255 255 / 50%) !important;
    transition: all 0.5s ease;
  }
  .swal2-popup {
    border-radius: 20px;
    background: #2f2179;
    color: white;
  }
  .swal2-styled.swal2-confirm {
    padding-left: 2rem;
    padding-right: 2rem;
  }
  .backdrop-loading {
  }
  
  .btn-change {
    width: 40px;
    height: 40px;
    background-color: #8b86a4 !important;
    border-radius: 50%;
    margin-bottom: 8px !important;
    color: white !important;
    &:hover {
      background-color: #8b86a4 !important;
    }
  }

  .presale-input {
    align-items: end;
    @media only screen and (max-width: 768px) {
      flex-direction: column;
      gap: 10px;
    }
  }

  .add-token-metamask {
    width: 222px;
    margin: 0 auto;
  }

  .clock-widget {
    margin: 0 auto;
    margin-top: 30px;
  }

  .font-weight-bold {
    font-weight: bold;
  }
`;

const Loading = styled('div')`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 15px;
`;

const TokenStaking = (props) => {
  const [totalStakedAmount, setTotalStakedAmount] = useState(0);
  const [totalStakedAccount, setTotalStakedAccount] = useState(0);
  const [stakedAmount, setStakedAmount] = useState(0);
  const [balanceAmount, setBalanceAmount] = useState(0);
  const [claimToken, setClaimToken] = useState(0);
  const [lastStakeTime, setLastStakeTime] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  const approveState                            = useSelector(selectors.userApproveState);
  const wallet                                  = useSelector(selectors.userWallet);              // user wallet
  const web3                                    = useSelector(selectors.web3State);               // 
  const [loading, setLoading]                   = useState(false);
  const [pending, setPending]                   = useState(false); 
  const [tokenAmountA, setTokenAmountA]         = useState('');
  const [started, setStarted]                   = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [xData, setXData]                       = useState([]);
  const [yData, setYData]                       = useState([]);  
  /* ******************************************* INIT ******************************************* */
  const getInitAmount = useCallback(async () => {
    if (!web3) { return; }

    setLoading(true); // loading

    let result            = null;
    /* ******************************************* GET TOTAL STAKED TOKEN AMOUNT ******************************************* */ 
    result = await getTotalStakedAmount();
    if (result.success) {
      setTotalStakedAmount(Number(result.totalToken));
    } else {
      return;
    }
    /* ******************************************* GET TOTAL STAKED TOKEN ACCOUNT ******************************************* */ 
    result = await getTotalStakedAccount(); 
    if (result.success) {
      setTotalStakedAccount(Number(result.totalAccount));
    } else {
      return;
    }
    /* ******************************************* GET STAKED TOKEN AMOUNT ******************************************* */ 
    result = await getStakedAmountOfAccount();
    if (result.success) {
      if (result.stakedAmount === 0)
        setStarted(false);
      else
        setStarted(true);

      setStakedAmount(Number(result.stakedAmount));
    } else {
      return;
    }
    /* ******************************************* GET STAKED TOKEN AMOUNT ******************************************* */ 
    result = await getTokenBalanceOfAcocunt();
    if (result.success) {
      setBalanceAmount(Number(result.tokenBalance));
    } else {
      return;
    }    
    /* ******************************************* GET CLIAM TOKEN ******************************************* */ 
    result = await showClaimToken();
    if (result.success) {
      setClaimToken(Number(result.showClaimToken));
    } else {
      return;
    }   
    /* ******************************************* GET REWARD TOKEN ******************************************* */ 
    result = await getLastStakeTime();
    if (result.success) {

      if (result.lastStakeTime === 0 ) {
        setXData([]);
        setYData([]);  
      } else {
        /// 
        const diffInseconds = currentTime - lastStakeTime;
        let diffInDays = diffInseconds / (60 * 60 * 24);
        diffInDays = parseInt(diffInDays);
        
        let labels = [];
        let rewarddata = [];
        
        let startDate = new Date();
        for (let i = diffInDays; i >= 0; i--) {
          const currentDayOfMonth = startDate.getDate();
          startDate.setDate(currentDayOfMonth - 1);
          labels[i] = startDate.toDateString();
          
          rewarddata[i] = stakedAmount + stakedAmount * 0.0015 * i;
        }
        
        console.log(labels);
        console.log(rewarddata);
        
        setXData(labels);
        setYData(rewarddata);
        
        setLastStakeTime(Number(result.lastStakeTime));
        setCurrentTime(Number(result.currentTime));
      }
    } else {
      return;
    }   
    // get day count   
    setLoading(false);
  }, [web3, wallet]);

  const handleTabClick = (index) => {
    setActiveTab(index);
  };

  const handleChange = async (event) => {
    const value = Number(event.target.value);

    setTokenAmountA(event.target.value);

    if (value === 0)
      return;
  }

  const validate = () => {

    if (isEmpty(tokenAmountA) || Number(tokenAmountA) === 0) {
      toast.error("Please enter a valid amount for purchase.");
      return false;
    }

    if (Number(balanceAmount) < Number(tokenAmountA)) {
      toast.error("You have insufficient amount to buy Staik.");
      return false;
    }

    return true;
  }

  const handleMax = async () => {
    setTokenAmountA(balanceAmount);
  }

  const handleStaking = async () => {
    if (!validate()) return;
    setPending(true);
    try {
      const tokenAmount = tokenAmountA;
      const result = await StakingToken(tokenAmount);
      if (result.success) {
        getInitAmount();
        Swal.fire({
          icon: 'success',
          title: ' Success',
          text: 'You have successfully '+ TOKEN_NAME +' Staking.'
        });

        setTokenAmountA(0);
      } else {
        toast.error("Transaction has been failed. " + result.error);
      }
    } catch (error) {
      toast.error("Transaction has been failed. " + error);
    } finally {
      setPending(false);
    }
  }

  const handleUnStaking = async () => {
    if (stakedAmount === 0)
      return;

    setPending(true);
    try {
      const result = await UnstakingToken();
      if (result.success) {
        getInitAmount();
        Swal.fire({
          icon: 'success',
          title: ' Success',
          text: 'You have successfully '+ TOKEN_NAME +' Unstaking.'
        });
      } else {
        toast.error("Transaction has been failed. " + result.error);
      }
    } catch (error) {
      toast.error("Transaction has been failed. " + error);
    } finally {
      setPending(false);
    }
  }

  const handleApprove = async () => {
    if (!validate()) return;
    setPending(true);
    try {
      const result = await approveTokens( tokenAmountA );
      if (result.success) {
        getInitAmount();
        toast.success("Your transaction has been successful.");
      } else {
        toast.error("Your Transaction has been failed. " + result.error);
      }
    } catch (error) {
      toast.error("Your Transaction has been failed. " + error);
    } finally {
      setPending(false);
    }
  }

  const handleClaim = async () => {
    if (claimToken === 0)
       return;

    setPending(true);
    try {
      const result = await getClaimToken();
      if (result.success) {
        getInitAmount();
        toast.success("Your transaction has been successful.");
      } else {
        toast.error("Your Transaction has been failed. " + result.error);
      }
    } catch (error) {
      toast.error("Your Transaction has been failed. " + error);
    } finally {
      setPending(false);
    }
  }

  const convertNumber = (number) => {
    const num = parseInt(number);
    const formattedNum = num.toLocaleString('en-US');

    return formattedNum;
  }

  useEffect(() => {
    getInitAmount();
  }, [getInitAmount]);
  
  return (
    <div className='page-container text-center ico-container'>
      {loading ? (
        <div className='backdrop-loading'>
          <Loading className='loading'>
            <ReactLoading type={'spinningBubbles'} color="#fff" />
          </Loading>
        </div>
      ) : (
        <>
        <GlobalStyles />
          <div className='ico-header' style={{width: "100%"}}>
            <Reveal className='onStep' keyframes={fadeInUp} delay={0} duration={600} triggerOnce>
              <p className='ico-title'>Welcome to the { TOKEN_NAME } Staking</p>
            </Reveal>
          </div>
          <Reveal className='main mt-3 onStep' keyframes={fadeIn} delay={800} duration={800} triggerOnce>
            <section className=''>
              <div className='presale-inner'>
                <div className="row justify-center">                 
                  <div className='col-md-12'>
                    <div className='row mt-3'>
                      <div className='col-md-4'>
                        <div className='presale-content'>
                          <div className='buy_content'>
                            <div className='fs-20 text-left py-4 text-gray-500'>
                              <FontAwesomeIcon icon={faAddressBook} /> &nbsp; Total { TOKEN_NAME } Staked</div>  
                            <div className='presale-input flex'>
                              <label className='pl-5 text-5xl'> { convertNumber(totalStakedAmount) } </label>
                            </div>
                          </div>
                        </div>
                      </div> 
                      <div className='col-md-4'>
                        <div className='presale-content'>
                          <div className='buy_content'>
                            <div className='fs-20 text-left py-4 text-gray-500'>
                              <FontAwesomeIcon icon={faChartSimple} /> &nbsp;Daily APY RATE
                            </div>  
                            <div className='presale-input flex'>
                              <label className='pl-5 text-5xl'>1.5%</label>
                            </div>
                          </div>
                        </div>
                      </div> 
                      <div className='col-md-4'>
                        <div className='presale-content'>
                          <div className='buy_content'>
                          <div className='fs-20 text-left py-4 text-gray-500'>
                              <FontAwesomeIcon icon={faUsersViewfinder} /> &nbsp;Stakers
                            </div>  
                            <div className='presale-input flex'>
                              <label className='pl-5 text-5xl'>{ convertNumber(totalStakedAccount) }</label>
                            </div>
                          </div>
                        </div>
                      </div>                                       
                    </div>
                  </div>
                </div>
              </div>
            </section>
            <section className=''>
              <div className='presale-inner'>
                <div className="row justify-center">                 
                  <div className='col-md-12'>
                    <div className='row mt-3'>
                      <div className='col-md-4'>
                        <div className='presale-content'>
                          <div className='buy_content '>
                            <div className="tabs">
                              <ul className="tab-nav flex">
                                {tabItems.map((item, index) => (
                                  <li key={index} className={activeTab === index ? 'active' : ''} onClick={() => handleTabClick(index)}>
                                    {item.title}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className={activeTab === 0 ? " " : "hidden"}>
                              <div className="presale-input flex">
                                <div className="input-token-panel" style={{ width: "100%"}}>
                                  <div className='flex justify-between'>
                                    <label className="fs-20">Staked Days : </label>
                                    <span className='fs-20'>360</span>
                                  </div>
                                  <div className='flex justify-between'>
                                    <label className="fs-20">Staked Amount : </label>
                                    <span className='fs-20'>{ stakedAmount }</span>
                                  </div>
                                  <div className='flex justify-between'>
                                    <label className="fs-20">Your Balance : </label>
                                    <span className='fs-20'>{ balanceAmount }</span>
                                  </div>
                                  <div className='flex justify-between'>
                                    <div className="input-token-panel" style={{ width: "100%"}}>
                                      <div className="d-flex justify-content-between input-box">
                                        <input type="number" className="input-token" name="input_from" placeholder='0.0' value={tokenAmountA} onChange={handleChange}></input>
                                        <button className='btn-max swap-color' onClick={handleMax}>MAX</button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className='col-md-12 mt-3'>
                                  {(approveState) ?
                                  <LoadingButton
                                    onClick={handleStaking}
                                    endIcon={<></>}
                                    loading={pending}
                                    loadingPosition="end"
                                    variant="contained"
                                    className="btn-buy btn-main btn6 m-auto fs-20 sm:p-1"
                                    disabled={!started}
                                  >
                                  Stake { TOKEN_NAME }
                                  </LoadingButton>:
                                  <LoadingButton
                                    onClick={handleApprove}
                                    endIcon={<></>}
                                    loading={pending}
                                    loadingPosition="end"
                                    variant="contained"
                                    className="btn-buy btn-main btn6 m-auto fs-20"
                                    disabled={!started}
                                  >
                                    Approve
                                  </LoadingButton>}
                              </div>
                            </div>
                            <div className={activeTab === 1 ? "" : "hidden"}>
                              <div className="presale-input flex">
                                <div className="input-token-panel" style={{ width: "100%"}}>
                                  <div className='flex justify-between'>
                                    <label className="fs-20">Staked Amount : </label>
                                    <span className='fs-20'>{ stakedAmount }</span>
                                  </div>
                                  <div className='flex justify-between'>
                                    <label className="fs-20">Your Balance : </label>
                                    <span className='fs-20'>{ balanceAmount }</span>
                                  </div>
                                </div>
                              </div>
                              <div className='col-md-12 mt-3'>
                                  <LoadingButton
                                    onClick={handleUnStaking}
                                    endIcon={<></>}
                                    loading={pending}
                                    loadingPosition="end"
                                    variant="contained"
                                    className="btn-buy btn-main btn6 m-auto fs-20"
                                    disabled={!started}
                                    >
                                    Unstake
                                  </LoadingButton>
                              </div>
                              <label className='mt-2'>If Token is unstaked a 30% Tax is implemented on the whole amount</label>
                            </div>
                            <div className={activeTab === 2 ? "" : "hidden"}>
                              <div className="presale-input flex">
                                <div className="input-token-panel" style={{ width: "100%"}}>
                                  <div className='flex justify-between'>
                                    <label className="fs-20">Claimable : </label>
                                    <span className='fs-20'>{ claimToken }</span>
                                  </div>
                                </div>
                              </div>
                              <div className='col-md-12 mt-3'>
                                <LoadingButton
                                  onClick={handleClaim}
                                  endIcon={<></>}
                                  loading={pending}
                                  loadingPosition="end"
                                  variant="contained"
                                  className="btn-buy btn-main btn6 m-auto fs-20"
                                  disabled={!started}
                                  >
                                  Claim
                                </LoadingButton>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div> 
                      <div className='col-md-8'>
                        <div className='presale-content'>
                          <div className='buy_content'>
                            <p className='fs-20'>Rewards</p>  
                            <div className='presale-input flex'>
                              <Linechart xData={ xData } yData={ yData }  />
                            </div>
                          </div>
                        </div>
                      </div> 
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </Reveal>
        </>
      )}
    </div >
  );
};

export default TokenStaking;    