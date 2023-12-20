// SPDX-License-Identifier: MIT
pragma solidity 0.8.15;

interface IA51Staking {
    function stake(address _to, uint256 _amount) external;

    function setGovernance(address _newGovernance) external;

    function updateRewards(uint256 _reward, uint256 _rewardDurationInBlocks) external;
}

interface IA51Token {
    function approve(address spender, uint256 amount) external returns (bool);
}

contract A51StakingSetup {
    IA51Staking public a51Staking;
    IA51Token public a51Token;

    constructor(IA51Token _a51Token) {
        a51Token = _a51Token;
    }

    function setStakingAddress(IA51Staking _a51Staking) external {
        a51Staking = _a51Staking;
    }

    function doSetup(
        address _stakeAddr,
        address _governance,
        uint256 _amount,
        uint256 _rewardToDistribute,
        uint256 _rewardDuration
    ) external {
        // approve a51
        // a51Token.approve(address(a51Staking), type(uint256).max);

        // update rewards
        a51Staking.updateRewards(_rewardToDistribute, _rewardDuration);

        // stake a51
        a51Staking.stake(_stakeAddr, _amount);

        // set governance
        a51Staking.setGovernance(_governance);
    }
}
