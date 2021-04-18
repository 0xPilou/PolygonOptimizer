const Staking = artifacts.require("Staking");
const Reward = artifacts.require("Reward");
const TokenA = artifacts.require("TokenA");
const TokenB = artifacts.require("TokenB");
const TokenC = artifacts.require("TokenC");

const StakingRewardMock = artifacts.require("StakingRewardMock");
const UniswapV2RouterMock = artifacts.require("UniswapV2RouterMock");



module.exports = (deployer, network, [owner]) => deployer
  .then(() => deployStaking(deployer))
  .then(() => deployReward(deployer))
  .then(() => deployTokenA(deployer))
  .then(() => deployTokenB(deployer))
  .then(() => deployTokenC(deployer))
  .then(() => deployStakingReward(deployer))
  .then(() => deployUniV2Router(deployer))
  .then(() => transferRewardToStakingReward(owner))
  .then(() => transferStakingToUniV2Router(owner))
  .then(() => transferTokenAToUniV2Router(owner))
  .then(() => transferTokenBToUniV2Router(owner));

function deployStaking(deployer) {
  return deployer.deploy(Staking, "UniV2-LP SDT-xSDT", "SDT-xSDT");
}
function deployReward(deployer) {
  return deployer.deploy(Reward, "MUST Token", "MUST");
}
function deployTokenA(deployer) {
  return deployer.deploy(TokenA, "Stake DAO Token", "SDT");
}
function deployTokenB(deployer) {
    return deployer.deploy(TokenB, "Stake DAO Governance Token", "xSDT");
}
function deployTokenC(deployer) {
    return deployer.deploy(TokenC, "Lost Token C", "tokenC");
}  

async function deployStakingReward(deployer) {
  const staking = (await Staking.deployed());
  const reward = (await Reward.deployed());
  return deployer.deploy(StakingRewardMock, staking.address, reward.address);
}

async function deployUniV2Router(deployer) {
    const staking = (await Staking.deployed());
    return deployer.deploy(UniswapV2RouterMock, staking.address);
  }


async function transferRewardToStakingReward(owner) {
    const reward = (await Reward.deployed());
    const stakingRewardMock = (await StakingRewardMock.deployed());
    var amountToTransfer = web3.utils.fromWei(await reward.balanceOf(owner));
    return reward.transfer(stakingRewardMock.address, web3.utils.toWei(amountToTransfer.toString()));
}

async function transferStakingToUniV2Router(owner) {
    const staking = (await Staking.deployed());
    const uniswapV2RouterMock = (await UniswapV2RouterMock.deployed());
    var ownerBalance = web3.utils.fromWei(await staking.balanceOf(owner));
    var amountToTransfer = ownerBalance * 0.9999;
    return staking.transfer(uniswapV2RouterMock.address, web3.utils.toWei(amountToTransfer.toString()));
}

async function transferTokenAToUniV2Router(owner) {
    const tokenA = (await TokenA.deployed());
    const uniswapV2RouterMock = (await UniswapV2RouterMock.deployed());
    var amountToTransfer = web3.utils.fromWei(await tokenA.balanceOf(owner));
    return tokenA.transfer(uniswapV2RouterMock.address, web3.utils.toWei(amountToTransfer.toString()));
}

async function transferTokenBToUniV2Router(owner) {
    const tokenB = (await TokenB.deployed());
    const uniswapV2RouterMock = (await UniswapV2RouterMock.deployed());
    var amountToTransfer = web3.utils.fromWei(await tokenB.balanceOf(owner));
    return tokenB.transfer(uniswapV2RouterMock.address, web3.utils.toWei(amountToTransfer.toString()));
}

