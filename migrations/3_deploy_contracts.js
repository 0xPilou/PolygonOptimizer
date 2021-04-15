
/**
 *  Mock Contracts
 */
const Staking = artifacts.require("Staking");
const Reward = artifacts.require("Reward");
const TokenA = artifacts.require("TokenA");
const TokenB = artifacts.require("TokenB");
const StakingRewardMock = artifacts.require("StakingRewardMock");
const UniswapV2RouterMock = artifacts.require("UniswapV2RouterMock");

/**
 *  Contracts Under Tests
 */
const UniV2Optimizer = artifacts.require("UniV2Optimizer");
const UniV2OptimizerFactory = artifacts.require("UniV2OptimizerFactory");



module.exports = (deployer, network, [owner]) => deployer
  .then(() => deployUniV2OptimizerFactory(deployer))
  .then(() => deployUniV2Optimizer(deployer))
  .then(() => displaySummary(owner));


async function deployUniV2OptimizerFactory(deployer) {
    return deployer.deploy(UniV2OptimizerFactory);
}

async function deployUniV2Optimizer(deployer) {
    const tokenA = (await TokenA.deployed());
    const tokenB = (await TokenB.deployed());
    const staking = (await Staking.deployed());
    const reward = (await Reward.deployed());
    const stakingRewardMock = (await StakingRewardMock.deployed());
    const uniswapV2RouterMock = (await UniswapV2RouterMock.deployed());
    return deployer.deploy(
        UniV2Optimizer,
        tokenA.address,
        tokenB.address,
        staking.address,
        reward.address,
        stakingRewardMock.address,
        uniswapV2RouterMock.address
      );
  }

async function displaySummary(owner) {
  const staking = (await Staking.deployed());
  const reward = (await Reward.deployed());
  const tokenA = (await TokenA.deployed());
  const tokenB = (await TokenB.deployed());
  const stakingRewardMock = (await StakingRewardMock.deployed());
  const uniswapV2RouterMock = (await UniswapV2RouterMock.deployed());
  const uniV2Optimizer = (await UniV2Optimizer.deployed());
  const uniV2OptimizerFactory = (await UniV2OptimizerFactory.deployed());


  console.log(
    `===================================================

    Deployed Contracts Addresses :

        > Token Staking :           ${staking.address}
        > Token Reward :            ${reward.address}
        > Token A :                 ${tokenA.address}
        > Token B :                 ${tokenB.address}
        > Staking Reward Pool :     ${stakingRewardMock.address}
        > UniV2 Router :            ${uniswapV2RouterMock.address}
        > UniV2Optimizer :          ${uniV2Optimizer.address}
        > UniV2OptimizerFactory :   ${uniV2OptimizerFactory.address}

    ===================================================

    Balances:

        > Owner :
            Token Staking :     ${web3.utils.fromWei(await staking.balanceOf(owner))}
            Token Reward :      ${web3.utils.fromWei(await reward.balanceOf(owner))}
            Token A :           ${web3.utils.fromWei(await tokenA.balanceOf(owner))}
            Token B :           ${web3.utils.fromWei(await tokenB.balanceOf(owner))}

        > Staking Reward Pool :
            Token Staking :     ${web3.utils.fromWei(await staking.balanceOf(stakingRewardMock.address))}
            Token Reward :      ${web3.utils.fromWei(await reward.balanceOf(stakingRewardMock.address))}
            Token A :           ${web3.utils.fromWei(await tokenA.balanceOf(stakingRewardMock.address))}
            Token B :           ${web3.utils.fromWei(await tokenB.balanceOf(stakingRewardMock.address))}

        > UniV2 Router :    
            Token Staking :     ${web3.utils.fromWei(await staking.balanceOf(uniswapV2RouterMock.address))}
            Token Reward :      ${web3.utils.fromWei(await reward.balanceOf(uniswapV2RouterMock.address))}
            Token A :           ${web3.utils.fromWei(await tokenA.balanceOf(uniswapV2RouterMock.address))}
            Token B :           ${web3.utils.fromWei(await tokenB.balanceOf(uniswapV2RouterMock.address))}

        > UniV2Optimizer :  
            Token Staking :     ${web3.utils.fromWei(await staking.balanceOf(uniV2Optimizer.address))}
            Token Reward :      ${web3.utils.fromWei(await reward.balanceOf(uniV2Optimizer.address))}
            Token A :           ${web3.utils.fromWei(await tokenA.balanceOf(uniV2Optimizer.address))}
            Token B :           ${web3.utils.fromWei(await tokenB.balanceOf(uniV2Optimizer.address))}                               

        > UniV2OptimizerFactory :  
            Token Staking :     ${web3.utils.fromWei(await staking.balanceOf(uniV2OptimizerFactory.address))}
            Token Reward :      ${web3.utils.fromWei(await reward.balanceOf(uniV2OptimizerFactory.address))}
            Token A :           ${web3.utils.fromWei(await tokenA.balanceOf(uniV2OptimizerFactory.address))}
            Token B :           ${web3.utils.fromWei(await tokenB.balanceOf(uniV2OptimizerFactory.address))}           
    ===================================================`);
}