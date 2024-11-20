// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Stake is ERC20 {

    uint256 public totalAmountStaked;
    address public owner;

    struct Staker {
        address staker;
        uint256 amountStaked;
        uint256 lastStakedTime;
    }

    mapping(address => Staker) public stakers;
    mapping(address => uint256) public rewards;

    constructor () ERC20 ("Reward", "RWD") {
        owner = msg.sender;
        totalAmountStaked = 0;
    }

    function stake () payable public {
        if(stakers[msg.sender].amountStaked > 0) {
            calculateRewards(msg.sender);
            stakers[msg.sender].amountStaked += msg.value;
            stakers[msg.sender].lastStakedTime = block.timestamp;
        } else {
            stakers[msg.sender] = Staker(msg.sender, msg.value, block.timestamp);
        }
        totalAmountStaked += msg.value;
    }

    function unstake (uint256 amount) public {
        require(stakers[msg.sender].amountStaked >= amount, "Not enough staked!");
        calculateRewards(msg.sender);
        stakers[msg.sender].amountStaked -= amount;
        stakers[msg.sender].lastStakedTime = block.timestamp;
        payable(msg.sender).transfer(amount);
        totalAmountStaked -= amount;
    }

    function calculateRewards (address _user) public {
        uint256 SECONDS_PER_YEAR = 31536000;
        uint256 amountStaked = stakers[_user].amountStaked;
        uint256 startTime = stakers[_user].lastStakedTime;
        uint256 rewardRate = 100;
        uint256 reward = amountStaked * rewardRate * (block.timestamp-startTime) / SECONDS_PER_YEAR;
        rewards[_user] += reward;
    }

    function claimRewards () public {
        require(rewards[msg.sender] > 0, "No rewards to claim!");
        _mint(msg.sender, rewards[msg.sender]);
        rewards[msg.sender] = 0;
    }

    function getAmountStaked (address _user) public view returns (uint256){
        return stakers[_user].amountStaked;
    }

    function getRewardsForUser (address _user) public view returns (uint256) {
        return rewards[_user];
    }

}