/**
 *  Dependencies
 */
const Web3 = require("web3");
const truffleAssert = require('truffle-assertions');
let web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:9545"));

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
 *  Contract Under Tests
 */
const UniV2Optimizer = artifacts.require("UniV2Optimizer");

contract("UniV2Optimizer Unit Tests", () => {
  
    let uniV2Optimizer = null;
    let staking = null;
    let reward = null;
    let stakingReward = null;
    let uniV2Router = null;
    let accounts = null;
    
    before(async () => {
        accounts = web3.eth.getAccounts().then(function(acc){ accounts = acc })
        uniV2Optimizer = await UniV2Optimizer.deployed();
        staking = await Staking.deployed();
        reward = await Reward.deployed();
        stakingReward = await StakingRewardMock.deployed();
        uniV2Router = await UniswapV2RouterMock.deployed();
    });

    it("should stake 10 LP token to the Staking Reward Pool", async () => {
        const amountToDeposit = 10;
        const weiAmountToDeposit = web3.utils.toWei(amountToDeposit.toString());
        await staking.approve(uniV2Optimizer.address, weiAmountToDeposit);
        await uniV2Optimizer.stake(weiAmountToDeposit);
        const poolBal = web3.utils.fromWei(await staking.balanceOf(stakingReward.address));      
        assert.equal(poolBal, amountToDeposit);   
    });
  
    it("should not be able to withdraw 20 LP token from the Staking Reward Pool", async () => {      
        const amountToWithdraw = 20;
        const weiAmountToWithdraw = web3.utils.toWei(amountToWithdraw.toString());        
        await truffleAssert.reverts(
            uniV2Optimizer.withdraw(weiAmountToWithdraw)
        );
    });
  
    it("should withdraw 10 LP token from the Staking Reward Pool", async () => {
        const amountToWithdraw = 10;
        const weiAmountToWithdraw = web3.utils.toWei(amountToWithdraw.toString());

        const userLpBal_before = web3.utils.fromWei(await staking.balanceOf(accounts[0]));
        const poolLpBal_before = web3.utils.fromWei(await staking.balanceOf(stakingReward.address));

        await uniV2Optimizer.withdraw(weiAmountToWithdraw);

        const userLpBal_after = web3.utils.fromWei(await staking.balanceOf(accounts[0]));
        const poolLpBal_after = web3.utils.fromWei(await staking.balanceOf(stakingReward.address));

        assert.equal(userLpBal_after, 10);
        assert.equal(poolLpBal_after, 0);
        
        assert.equal(userLpBal_after - userLpBal_before, amountToWithdraw);
        assert.equal(poolLpBal_before - amountToWithdraw, poolLpBal_after);
    });
  // it("should ...", async () => {

  // });

});

