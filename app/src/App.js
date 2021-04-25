import React, { useState, useEffect } from 'react';
import detectEthereumProvider from '@metamask/detect-provider';
import { ethers, Contract } from 'ethers';
import OptimizerFactory from './contracts/UniV2OptimizerFactory.json';
import Optimizer from './contracts/UniV2Optimizer.json';
import './App.css';



function App() {
  const [optimizerFactory, setOptimizerFactory] = useState(undefined);
  const [strategyCount, setStrategyCount] = useState(undefined);
  const [optimizerCount, setOptimizerCount] = useState(undefined);
  const [optimizers = [], setOptimizers] = useState(undefined);

  var [strategies = [], setStrategies] = useState(undefined);
  var [userOptimizers = [], setUserOptimizers] = useState(undefined);
  var [signerAddr, setSignerAddr] = useState(undefined);
  var [staked = [], setStaked] = useState(undefined);
  var [stakingBalance = [], setLpBalance] = useState(undefined);

  
  const ERC20ABI = [
    // Read-Only Functions
    "function balanceOf(address account) external view returns (uint256)",
    "function symbol() view returns (string)",

    // Authenticated Functions
    "function approve(address spender, uint256 amount) external returns (bool)"
  ]

  useEffect(() => {
    const init = async () => {
      // Connect to Metamask
      var provider = await detectEthereumProvider();
      await provider.request({ method: 'eth_requestAccounts' });
      const networkId = await provider.request({ method: 'net_version' })
      provider = new ethers.providers.Web3Provider(provider);

      // Get User account info
      const signer = provider.getSigner();
      const signerAddr = await signer.getAddress();
      console.log(signerAddr);

      // Instanciate an object representing the deployed Optimizer Factory 
      const optimizerFactory = new Contract(
        OptimizerFactory.networks[networkId].address,
        OptimizerFactory.abi,
        signer
      );

      // (Trying to) Read Optimizer Factory public variable : Protocols
      const strategyCount = await optimizerFactory.getStrategyCount();
      // get all strategies supported
      var i;
      for (i = 0; i < strategyCount; i++) {
        const strategy = await optimizerFactory.strategies(i);
        strategies.push(strategy);
        // console.log(strategies[i].protocolId.toString());
      }
      

      // (Trying to) Read Optimizer Factory public variable : Optimizers
      const optimizerCount = await optimizerFactory.getOptimizerCount();
      userOptimizers = await optimizerFactory.getOwnerOptimizers(signerAddr);

      if (userOptimizers.length > 0) {
      var i = 0
      var buffer;
      let optimizers = [];

        for (i = 0; i < userOptimizers.length; i++) {
          const optimizer = new Contract(
            userOptimizers[i].toString(),
            Optimizer.abi,
            signer
          );
          buffer = await optimizer.staked();
          staked.push(buffer.toString());
          console.log('LP Stake for Optimizer' ,i , ': ', staked[i]);
          

          var LpAddr = await optimizer.staking();
          LpAddr = LpAddr.toString();
          const LpContract = new Contract(
            LpAddr,
            ERC20ABI,
            signer
          );

         
          buffer = await LpContract.balanceOf(signerAddr);
          stakingBalance.push(buffer.toString())
          
          //await LpContract.approve(optimizer.address, -1);



          const optz = {
            optimizerContract: optimizer,
            LpContract: LpContract,
            address: userOptimizers[i].toString(),
            staked: staked[i],
            stakingBalance: stakingBalance[i],
          }
          optimizers.push(optz);
          console.log(optz)
          setOptimizers(optimizers);
        }
      }

      // const pendingRewards = await optimizer.getPendingRewards();
      // console.log(pendingRewards.toString());
      // const canClaimDollar = await optimizer.canClaimDollar();
      // console.log(canClaimDollar.toString());
      // const canWithdrawShare = await optimizer.canWithdrawShare();
      // console.log(canWithdrawShare.toString());


      // Set function (for React)
      setSignerAddr(signerAddr);
      setOptimizerFactory(optimizerFactory);
      setStrategyCount(strategyCount);
      setOptimizerCount(optimizerCount);
      setStrategies(strategies);
      setUserOptimizers(userOptimizers);
      //setOptimizer(optimizer);
      setStaked(staked);
      console.log(optimizers.length)
      console.log(optimizers)
     
    };
    init();
  }, []);

  const StrategySupported = ({strategies}) => (
    <>
      {strategies.map((strategy, index) => (
        <li key={index}>Protocol ID : {strategy.poolId.toString()}
          <ul>
            <li>Token A         : {strategy.tokenA.toString()}</li>
            <li>Token B         : {strategy.tokenB.toString()}</li>
            <li>Staking (LP)    : {strategy.staking.toString()}</li>
            <li>Reward          : {strategy.reward.toString()}</li>
            <li>Pool            : {strategy.stakingRewardAddr.toString()}</li>
            <li>UniV2 Router    : {strategy.uniV2RouterAddr.toString()}</li>
          </ul>
        </li>
      ))}
    </>
  );


  const OptimizersList = ({optimizers}) => (
    <>
      <br/>
      {optimizers.map((optimizer, index) => (
        <h5><li key={index}> Optimizer {index} 
          <br/><br/>
          <ul>
            <li>Contract Address : {optimizer.address}</li>
            <br/><br/>
            <li>LP Tokens :
              <br/><br/>
              <p> In Wallet : {optimizer.stakingBalance}</p>
              <h5> Deposit LP Token :</h5>
              <div className='row'>        
              <form className="form-inline" onSubmit={e => depositLP(e, optimizer.optimizerContract)}>
                <input 
                  type="number" 
                  className="form-control" 
                  placeholder="Amount to Deposit"
                />
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  Deposit  
                </button>
              </form>
              &nbsp;&nbsp;&nbsp;
              <form className="form-inline" onSubmit={e => approveLP(e, optimizer)}>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                >
                  Approve
                </button>
              </form>
            </div>  
              <br/>
              <p> Staked : {optimizer.staked}</p>
              <h5> Withdraw LP Token :</h5>
              <div className='row'>        
              <form className="form-inline" onSubmit={e => withdrawLP(e, optimizer.optimizerContract)}>
              <input 
                type="number" 
                className="form-control" 
                placeholder="Amount to Withdraw"
              />                  
              <button 
                type="submit" 
                className="btn btn-primary"
              >
                Withdraw
              </button>
            </form>
            </div>  
            </li>
            <br/><br/>          
            <br/>                 
          </ul>
        </li></h5>
      ))}

    </>
  );

  const approveLP = async (e, optimizer) => {
    e.preventDefault();
    const optimizerAddr = optimizer.address;
    const tx = await optimizer.LpContract.approve(optimizerAddr, 100);
    await tx.wait();
  };

  const depositLP = async (e, optimizer) => {
    e.preventDefault();
    const data = e.target.elements[0].value;
    const tx = await optimizer.stake(data);
    await tx.wait();
    const staked = await optimizer.staked();
  };

  const withdrawLP = async (e, optimizer) => {
    e.preventDefault();
    const data = e.target.elements[0].value;
    const tx = await optimizer.withdraw(data);
    await tx.wait();
  };

  const createOptimizer = async e => {
    e.preventDefault();
    const data = e.target.elements[0].value;
    const tx = await optimizerFactory.createUniV2Optimizer(data);
    await tx.wait();
    const optimizerCount = await optimizerFactory.getOptimizerCount();
    setOptimizerCount(optimizerCount);
  };

  const addNewStrategy = async e => {
    e.preventDefault();
    const tokenA = e.target.elements[0].value;
    const tokenB = e.target.elements[1].value;
    const staking = e.target.elements[2].value;
    const reward = e.target.elements[3].value;
    const stakingRewardAddr = e.target.elements[4].value;
    const uniV2RouterAddr = e.target.elements[5].value;

    const tx = await optimizerFactory.addStrategy(
      tokenA, 
      tokenB, 
      staking,
      reward, 
      stakingRewardAddr,
      uniV2RouterAddr
    );
    await tx.wait();
    const strategyCount = await optimizerFactory.getStrategyCount();
    setStrategyCount(strategyCount);
  };



  //{strategies.map((strategy) => <li key={strategy.protocolId.toString()}>{strategy}</li>)}


  if(
    typeof optimizerFactory === 'undefined'
    || typeof strategyCount === 'undefined'
    || typeof optimizerCount === 'undefined'
    //|| typeof provider === 'undefined'
    || typeof signerAddr === 'undefined'
    //|| typeof optimizer === 'undefined'
    

  ) {
    return 'Loading...';
  }
  //console.log(strategies[0].protocolId.toString());

  return (

    <div className='container'>
      <header className='header'>
        <h2> You : </h2>
            <p>{signerAddr}</p>            
      </header>
      <br/>
      <div className='row' style={{justifyContent: "center"}}>
        <h1>Protocols :</h1>
      </div><br/><br/>
      <div className='row'>        
        <div className='col-sm-6'>                                              
          <h3>Strategies Supported :</h3>
          <StrategySupported strategies={strategies} />
          <br/>
          <br/>
        </div>
        <div className='col-sm-6'>                                              
          <h3>Add Strategy :</h3>
          <form className="form-inline" onSubmit={e => addNewStrategy(e)}>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Token A Address"
            />
            <input 
              type="text" 
              className="form-control" 
              placeholder="Token B Address"
            />
            <input 
              type="text" 
              className="form-control" 
              placeholder="Staking Token Address"
            />
            <input 
              type="text" 
              className="form-control" 
              placeholder="Reward Token Address"
            />               
            <input 
              type="text" 
              className="form-control" 
              placeholder="Staking Pool Address"
            />
            <input 
              type="text" 
              className="form-control" 
              placeholder="UniV2 Router Address"
            />                                                             
            <button 
              type="submit" 
              className="btn btn-primary"
            >
              Submit
            </button>
          </form>
          
        </div>
      </div><br/><br/>
      
      <div className='row' style={{justifyContent: "center"}}>
        <h1>Optimizers :</h1>
      </div><br/><br/>

      <div className='row'> 
        <div className='col-sm-6'>
          <h3>Your Optimizers :</h3>
          <OptimizersList optimizers={optimizers} />
        </div>     
        <div className='col-sm-6'>
          <div className='row' style={{justifyContent: "flex-end"}}> 
            <h3>Create Optimizer</h3><br/><br/>
            <form className="form-inline" onSubmit={e => createOptimizer(e)}>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Pool ID"
            />                  
            <button 
              type="submit" 
              className="btn btn-primary"
            >
              Submit
            </button>
          </form><br/><br/><br/>
            <h3>Created by the Factory : {optimizerCount.toString()}</h3><br/>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
