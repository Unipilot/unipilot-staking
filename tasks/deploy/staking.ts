import { deployContract } from "./utils";
import { formatEther } from "ethers/lib/utils";
import { task } from "hardhat/config";

//A51:
//GOVERNANCE:
//DISTRIBUTION BLOCKS: 27780
//REWARDS TO DISTRIBUTE:
//STAKE TO:
//WETH: 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2

task("deploy-a51Token-staking", "Deploy A51 Staking Contract")
  .addParam("governance", "governance address")
  .addParam("reward", "reward token address")
  .addParam("a51", "a51 token address")
  .setAction(async (cliArgs, { ethers, run, network }) => {
    await run("compile");

    const signer = (await ethers.getSigners())[0];
    console.log("Signer");

    console.log("  at", signer.address);
    console.log("  ETH", formatEther(await signer.getBalance()));

    const args = {
      governance: cliArgs.governance,
      rewardToken: cliArgs.reward,
      a51Token: cliArgs.a51,
    };

    console.log("Network");
    console.log("   ", network.name);
    console.log("Task Args");
    console.log(args);

    const a51Staking = await deployContract("A51Staking", await ethers.getContractFactory("A51Staking"), signer, [
      args.governance,
      args.rewardToken,
      args.a51Token,
    ]);

    await a51Staking.deployTransaction.wait(5);
    delay(60000);

    console.log("Verifying Smart Contract ...");

    await run("verify:verify", {
      address: a51Staking.address,
      constructorArguments: [args.governance, args.rewardToken, args.a51Token],
    });
  });

// task("deploy-a51-setup", "Deploy A51 Staking Setup Contract")
//   .addParam("a51", "a51 token address")
//   .setAction(async (cliArgs, { ethers, run, network }) => {
//     await run("compile");

//     const signer = (await ethers.getSigners())[0];
//     console.log("Signer");

//     console.log("  at", signer.address);
//     console.log("  ETH", formatEther(await signer.getBalance()));

//     const args = {
//       a51Token: cliArgs.a51,
//     };

//     console.log("Network");
//     console.log("   ", network.name);
//     console.log("Task Args");
//     console.log(args);

//     const a51StakingSetup = await deployContract(
//       "A51StakingSetup",
//       await ethers.getContractFactory("A51StakingSetup"),
//       signer,
//       [args.a51Token]
//     );

//     await a51StakingSetup.deployTransaction.wait(5);
//     delay(60000);

//     console.log("Verifying Smart Contract ...");

//     await run("verify:verify", {
//       address: a51StakingSetup.address,
//       constructorArguments: [args.a51Token],
//     });
//   });

// task("deploy-a51-staking", "Deploy A51 Staking Contract")
//   .addParam("setupcontract", "governance address")
//   .addParam("reward", "reward token address")
//   .addParam("a51", "a51 token address")
//   .setAction(async (cliArgs, { ethers, run, network }) => {
//     await run("compile");

//     const signer = (await ethers.getSigners())[0];
//     console.log("Signer");

//     console.log("  at", signer.address);
//     console.log("  ETH", formatEther(await signer.getBalance()));

//     const args = {
//       governance: cliArgs.setupcontract,
//       rewardToken: cliArgs.reward,
//       a51Token: cliArgs.a51,
//     };

//     console.log("Network");
//     console.log("   ", network.name);
//     console.log("Task Args");
//     console.log(args);

//     const a51Staking = await deployContract(
//       "A51Staking",
//       await ethers.getContractFactory("A51Staking"),
//       signer,
//       [args.governance, args.rewardToken, args.a51Token]
//     );

//     await a51Staking.deployTransaction.wait(5);
//     delay(60000);

//     console.log("Verifying Smart Contract ...");

//     await run("verify:verify", {
//       address: a51Staking.address,
//       constructorArguments: [args.governance, args.rewardToken, args.a51Token],
//     });
//   });

// task("setup-staking-contract", "Setup a51 staking contract")
//   .addParam("governance", "governance address")
//   .addParam("distributionblocks", "no of blocks to distribute reward")
//   .addParam("reward", "reward amount")
//   .setAction(async (cliArgs, { ethers, run, network }) => {
//     let setupContract = "0x133d2C0eC4d16Cf18E4405312a57947f148e58bA";
//     let stakingContract = "0x672b34eA2314C8fc4F6a6087F3b7DE0EC77f6c28";
//     let stakeTo = "0x97fF40b5678D2234B1E5C894b5F39b8BA8535431";
//     let stakeAmount = "10000000000000000000"; // 10 a51

//     const signer = (await ethers.getSigners())[0];
//     console.log("Signer");

//     console.log("  at", signer.address);
//     console.log("  ETH", formatEther(await signer.getBalance()));

//     console.log("Task Args");
//     console.log(cliArgs);

//     let stakingSetup = await ethers.getContractAt(
//       "A51StakingSetup",
//       setupContract,
//       signer
//     );

//     // let tx1 = await stakingSetup.setStakingAddress(stakingContract);
//     // let receipt1 = await tx1.wait();
//     // console.log("Set staking contract ", receipt1.logs);

//     let tx2 = await stakingSetup.doSetup(
//       stakeTo,
//       cliArgs.governance,
//       stakeAmount,
//       cliArgs.reward,
//       cliArgs.distributionblocks
//     );
//     let receipt2 = await tx2.wait();
//     console.log("Setup tx ", receipt2);
//   });

// task("verify-a51-staking", "Deploy A51 Staking Contract").setAction(
//   async (cliArgs, { ethers, run, network }) => {
//     console.log("Verifying Smart Contract ...");

//     await run("verify:verify", {
//       address: "0xC9256E6e85ad7aC18Cd9bd665327fc2062703628",
//       constructorArguments: [
//         "0x5E865b76CdC0fD429938eb4a36097aDDBe0970a8",
//         "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
//         "0x37C997B35C619C21323F3518B9357914E8B99525",
//       ],
//     });
//   }
// );

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
