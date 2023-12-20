import { expect } from "chai";
import { parseUnits } from "ethers/lib/utils";
import { stakingConfigFixture } from "../shared/fixtures";
import { MaxUint256 } from "@ethersproject/constants";
import { ethers, waffle } from "hardhat";
import { A51Staking } from "../../typechain/A51Staking";
import { TestERC20 } from "../../typechain/TestERC20";
import { TestERC206D } from "../../typechain/TestERC206D.d";
import { mineNBlocks, TX_TYPE, expectEventForAll } from "../common.setup";

const createFixtureLoader = waffle.createFixtureLoader;

export async function shouldBehaveLikeSixDecimalsToken(): Promise<void> {
  let staking: A51Staking;
  let a51: TestERC20;
  let WETH: TestERC20;
  let HUNDRED = parseUnits("100", "6");
  let TEN = parseUnits("10", "6");
  let ONE = parseUnits("1", "6");
  let SIX_DECIMALS: TestERC206D; // 6 Decimals reward token
  let ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
  let loadFixture: ReturnType<typeof createFixtureLoader>;

  const updateTokenWithUpdateRewards = async () => {
    //changing reward token to 6 deicmals token
    await SIX_DECIMALS.transfer(staking.address, HUNDRED);
    await staking.updateRewardToken(SIX_DECIMALS.address);
    //always pass value of rewards in wei notation, regardless of token decimals
    await staking.updateRewards(parseUnits("100", "18"), 100); //1 token / block
  };

  const [wallet, alice, bob, carol, newWallet] = waffle.provider.getWallets();

  before("fixtures deployer", async () => {
    loadFixture = createFixtureLoader([wallet]);
  });
  beforeEach("fixtures", async () => {
    const res = await loadFixture(stakingConfigFixture);
    staking = res.staking;
    a51 = res.a51;
    WETH = res.WETH;
    SIX_DECIMALS = res.WETH6D;

    await a51.mint(wallet.address, parseUnits("2000000", "18"));
    await WETH.mint(wallet.address, parseUnits("2000000", "18"));
    await SIX_DECIMALS.mint(wallet.address, parseUnits("2000000", "6"));

    // 1 token per block
    await WETH.transfer(staking.address, HUNDRED);
    //always pass value of rewards in wei notation, regardless of token decimals
    await staking.updateRewards(parseUnits("100", "18"), 100);

    await a51.connect(wallet).approve(staking.address, MaxUint256);
    await WETH.connect(wallet).approve(staking.address, MaxUint256);
    await SIX_DECIMALS.connect(wallet).approve(staking.address, MaxUint256);

    //minting to users
    await a51.connect(alice).mint(alice.address, parseUnits("2000000", "18"));
    await a51.connect(bob).mint(bob.address, parseUnits("2000000", "18"));
    await a51.connect(carol).mint(carol.address, parseUnits("2000000", "18"));

    //approvals from users to staking contract
    await a51.connect(alice).approve(staking.address, MaxUint256);
    await a51.connect(bob).approve(staking.address, MaxUint256);
    await a51.connect(carol).approve(staking.address, MaxUint256);
  });
  describe("#SixDecimalsRewardToken", () => {
    it("should return 0", async () => {
      const result = await staking.totalA51Staked();
      expect(result).to.equal(0);
    });

    it("should let reward token to shift to 6 decimals where pending should be correct", async () => {
      let aliceStake = await staking.connect(alice).stake(alice.address, TEN);
      //block at which user 1 staked 10 tokens
      let currentBlock = await ethers.provider.getBlockNumber();
      // console.log("rew/block:", await staking.currentRewardPerBlock());

      //mine blocks to reach periodEnd block
      let periodEnd = await staking.periodEndBlock();
      // console.log("period ends", +periodEnd);

      //here reward period ended
      let jumedBlocks = +periodEnd.sub(currentBlock);
      await mineNBlocks(jumedBlocks + 10);
      let user1Pendings = await staking.calculatePendingRewards(alice.address);
      expect(user1Pendings).to.eq(parseUnits(jumedBlocks.toString(), "18"));

      await updateTokenWithUpdateRewards();
      // await staking.stake(wallet.address, 1)
      //jumping to 40 blocks to see pendings
      let miningPeriod = 40;
      await mineNBlocks(miningPeriod);
      let user1PendingsAt6Decimals = await staking.calculatePendingRewards(alice.address);

      expect(user1PendingsAt6Decimals).to.eq(parseUnits(miningPeriod.toString(), "6"));
    });

    it("should change token to 6 decimals and stake and claim for multiple users", async () => {
      // console.log("periodEnd", +(await staking.periodEndBlock()));
      await ethers.provider.send("evm_setAutomine", [false]);

      // console.log("currentBlock", await ethers.provider.getBlockNumber());
      await staking.connect(alice).stake(alice.address, HUNDRED);
      await staking.connect(bob).stake(bob.address, HUNDRED);
      await staking.connect(carol).stake(carol.address, HUNDRED);

      await ethers.provider.send("evm_setAutomine", [true]);

      await mineNBlocks(20); //20 + 3(hardhat blocks mined) = 23

      //token change with updateRewards and funds transfer
      // 1 token / block
      await updateTokenWithUpdateRewards();
      await ethers.provider.send("evm_setAutomine", [false]);

      //having some issues with alice claim, not sure why, for the time being, ignoring this
      let alicePending = await staking.calculatePendingRewards(alice.address);
      let bobPending = await staking.calculatePendingRewards(bob.address);
      let carolPending = await staking.calculatePendingRewards(carol.address);

      let aliceActualClaim = await staking.connect(alice).claim();
      let bobActualClaim = await staking.connect(bob).claim();
      let carolActualClaim = await staking.connect(carol).claim();

      await ethers.provider.send("evm_setAutomine", [true]);

      //expecting values
      expect(alicePending).to.eq(bobPending).to.eq(carolPending);
      expectEventForAll(staking, aliceActualClaim, alice, HUNDRED, alicePending, TX_TYPE.CLAIM);
      expectEventForAll(staking, bobActualClaim, bob, HUNDRED, bobPending, TX_TYPE.CLAIM);
      expectEventForAll(staking, carolActualClaim, carol, HUNDRED, carolPending, TX_TYPE.CLAIM);
    });
  });
}
