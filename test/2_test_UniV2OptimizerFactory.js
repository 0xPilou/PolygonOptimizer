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
 const UniV2OptimizerFactory = artifacts.require("UniV2OptimizerFactory");


contract("UniV2OptimizerFactory Unit Tests", () => {

    let uniV2Optimizer = null;
    let uniV2OptimizerFactory = null;

    let staking = null;
    let reward = null;

    let stakingReward = null;
    let uniV2Router = null;

    let accounts = null;
    
    before(async () => {
        accounts = web3.eth.getAccounts().then(function(acc){ accounts = acc })
        uniV2OptimizerFactory = await UniV2OptimizerFactory.deployed();
        staking = await Staking.deployed();
        reward = await Reward.deployed();
        tokenA = await TokenA.deployed();
        tokenB = await TokenB.deployed();
        stakingReward = await StakingRewardMock.deployed();
        uniV2Router = await UniswapV2RouterMock.deployed();

    });
    it("should add a new strategy to the UniV2Optimizer Factory ", async () => {
        await uniV2OptimizerFactory.addStrategy(
            tokenA.address,
            tokenB.address,
            staking.address,
            reward.address,
            stakingReward.address,
            uniV2Router.address);
        const result = await uniV2OptimizerFactory.strategies(0);
        assert.equal(result.poolId, 0);   
        assert.equal(result.tokenA, tokenA.address);
        assert.equal(result.tokenB, tokenB.address);
        assert.equal(result.staking, staking.address);
        assert.equal(result.reward, reward.address);
        assert.equal(result.stakingRewardAddr, stakingReward.address);
        assert.equal(result.uniV2RouterAddr, uniV2Router.address);
    });
    it("should get the number of pool supported", async () => {
        await uniV2OptimizerFactory.addStrategy(
            tokenA.address,
            tokenB.address,
            staking.address,
            reward.address,
            stakingReward.address,
            uniV2Router.address);
        const result = (await uniV2OptimizerFactory.getStrategyCount()).toNumber();
        assert.equal(result, 2);
    });
    it("should get the number of uniV2Optimizers created (0)", async () => {
        const result = (await uniV2OptimizerFactory.getOptimizerCount()).toNumber();
        assert.equal(result, 0);
    });
    it("should create a new uniV2Optimizer with Strategy ID 2", async () => {

        const numOfOptimizer_before = (await uniV2OptimizerFactory.getOptimizerCount()).toNumber();

        await uniV2OptimizerFactory.addStrategy(
            tokenA.address,
            tokenB.address,
            staking.address,
            reward.address,
            stakingReward.address,
            uniV2Router.address);
        await uniV2OptimizerFactory.createUniV2Optimizer(2);
        const newUniV2OptimizerId = (await uniV2OptimizerFactory.getOptimizerCount()).toNumber(); 
        const newUniV2OptimizerAddr = await uniV2OptimizerFactory.uniV2Optimizers(newUniV2OptimizerId - 1);
        uniV2Optimizer = await UniV2Optimizer.at(newUniV2OptimizerAddr);

        const numOfOptimizer_after = (await uniV2OptimizerFactory.getOptimizerCount()).toNumber();


        assert.equal(numOfOptimizer_before < numOfOptimizer_after, true);
        



    });
  //  it("should get the number of optimizers created ", async () => {
  //      await optimizerFactory.addProtocol(lp.address, share.address, dollar.address, shareRewardPool.address, boardroom.address);
  //      await optimizerFactory.createOptimizer(1)
  //      const result = await optimizerFactory.getOptimizerCount(0);
  //      assert.equal(result.toNumber(), 2);
  //  });
});
   