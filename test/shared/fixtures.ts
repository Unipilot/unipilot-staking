import { BigNumber, Wallet } from "ethers";
import { ethers } from "hardhat";
import { deployContract, Fixture } from "ethereum-waffle";
import { TestERC20 } from "../../typechain/TestERC20";
import { waffle } from "hardhat";
import { A51Staking } from "../../typechain/A51Staking";
import { TestERC206D } from "../../typechain/TestERC206D.d";
interface TokensFixture {
  a51: TestERC20;
  WETH: TestERC20;
  testToken: TestERC20;
  WETH6D: TestERC206D; //6 decimals token
}

async function tokensFixture(): Promise<TokensFixture> {
  const sixDecimalToken = await ethers.getContractFactory("TestERC206D");
  const tokenFactory = await ethers.getContractFactory("TestERC20");

  const a51 = (await tokenFactory.deploy(BigNumber.from(1).pow(255))) as TestERC20;
  const WETH = (await tokenFactory.deploy(BigNumber.from(1).pow(255))) as TestERC20;
  const testToken = (await tokenFactory.deploy(BigNumber.from(1).pow(255))) as TestERC20;
  const WETH6D = (await sixDecimalToken.deploy(BigNumber.from(1).pow(255))) as TestERC206D; //6 decimals token

  return { a51, WETH, testToken, WETH6D };
}

interface StakingFixture {
  staking: A51Staking;
}
async function stakingFixture(wallet: Wallet, WETH: TestERC20, a51: TestERC20): Promise<StakingFixture> {
  const stakingStaking = await ethers.getContractFactory("A51Staking");
  const staking = (await stakingStaking.deploy(wallet.address, WETH.address, a51.address)) as A51Staking;

  let arr: string[] = ["a51:", "WETH:", "Governance:", "staking:"];
  // [a51, WETH, wallet, staking].map((el, i) => console.log(arr[i], el.address));

  return { staking };
}

type TokensAndStakingFixture = StakingFixture & TokensFixture;

export const stakingConfigFixture: Fixture<TokensAndStakingFixture> =
  async function (): Promise<TokensAndStakingFixture> {
    const [wallet] = waffle.provider.getWallets();
    const { a51, WETH, testToken, WETH6D } = await tokensFixture();
    const { staking } = await stakingFixture(wallet, WETH, a51);
    return { staking, a51, WETH, testToken, WETH6D };
  };
