// "SPDX-License-Identifier: UNLICENSED"
pragma solidity >=0.7.0 <0.8.0;

import 'openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol';
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';


contract StakingRewardMock {

    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    address staking;
    address reward;

    constructor(address _staking, address _reward) {
        staking = _staking;
        reward = _reward;
    }

    function stake(uint256 _amount) external {
        address _sender = msg.sender;
        IERC20(staking).transferFrom(_sender, address(this), _amount);
    }

    function withdraw(uint256 _amount) external {
        IERC20(staking).transfer(msg.sender, _amount);
    }

    function getReward() external {
        uint256 amount = IERC20(reward).balanceOf(address(this)).div(1000);
        IERC20(reward).transfer(msg.sender, amount);
    }

    function exit() external {
        uint256 stakingAmount = IERC20(staking).balanceOf(address(this));
        IERC20(staking).transfer(msg.sender, stakingAmount);
        uint256 rewardAmount = IERC20(reward).balanceOf(address(this)).div(1000);
        IERC20(reward).transfer(msg.sender, rewardAmount);
    }
}