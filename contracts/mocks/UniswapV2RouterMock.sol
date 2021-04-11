// "SPDX-License-Identifier: UNLICENSED"
pragma solidity >=0.7.0 <0.8.0;

import 'openzeppelin-solidity/contracts/token/ERC20/SafeERC20.sol';
import 'openzeppelin-solidity/contracts/math/SafeMath.sol';


contract UniswapV2RouterMock {

    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    address staking;
    address reward;
    address tokenA;
    address tokenB;

    constructor(address _staking, address _reward) {
        staking = _staking;
        reward = _reward;
    }

    function addLiquidity(
        address _tokenA,
        address _tokenB,
        uint amountADesired,
        uint amountBDesired,
        uint amountAMin,
        uint amountBMin,
        address to,
        uint deadline
    ) external returns (uint amountA, uint amountB, uint liquidity) {
        liquidity = 0;
        amountA = amountADesired;
        amountB = amountBDesired;
        IERC20(_tokenA).safeTransferFrom(msg.sender, address(this), amountADesired);
        IERC20(_tokenB).safeTransferFrom(msg.sender, address(this), amountBDesired);
        IERC20(staking).safeTransfer(msg.sender, IERC20(staking).balanceOf(address(this)).div(1000));
        return (amountA, amountB, liquidity);
    }
    
    function swapExactTokensForTokens(
        uint amountIn, 
        uint amountOutMin, 
        address[] calldata path, 
        address to, 
        uint deadline
    ) external returns (uint[] memory amounts) {
        IERC20(path[0]).safeTransferFrom(msg.sender, address(this), amountIn);
        IERC20(path[1]).safeTransfer(msg.sender, amountIn);

    
        return amounts;
    }

}