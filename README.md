# A51 Staking

This repository contains A51 staking smart contract.

## A51Staking.sol

`A51Staking.sol` allows a51 holders to stake (`stake()`) a51 tokens to receive rewards (reward token could be WETH or any other ERC-20 token). Staker can claim rewards (`claim()`). Stakers may unstake their a51 tokens by calling `unstake()`, which will trigger the reward claim as well. For emergency unstake, stakers can call `emergencyUnstake()`, beaware that emergency unstake doesn't trigger reward claim and all your pending reward tokens are lost.

## Local deployment

### Pre Requisite

After cloning the repository, make sure to install dependencies:

```
$ yarn install
```

### Compile

Compile the smart contracts with Hardhat:

```
$ yarn compile
```

Set the environment variables.
For example:

```
INFURA_API_KEY="Your infura API key"
PK1="Your private key"
ETHERSCAN_API_KEY="Your etherscan API key"
```

Execute the tasks in the following order with correct params to deploy a51 staking contract and to verify it.

```
1. deploy-a51-setup
2. deploy-a51-staking
3. setup-staking-contract
4. verify-a51-staking
```

## Test cases

To run the test cases:

```
$ yarn test
```

## Licensing

A51 staking contract is licensed under the [MIT License](https://opensource.org/licenses/MIT)
