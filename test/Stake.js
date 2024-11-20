const {
    time,
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
  const { expect } = require("chai");
  const { ethers } = require("hardhat");


describe("Stake", function () {

    async function deploy() {
        const [owner, otherAccount] = await ethers.getSigners();
        const totalAmountStaked = 0;
        const SECONDS_PER_YEAR = 31536000;
        const rewardRate = 100;
        const SECONDS_STAKED = 3600;
        const AMOUNT_STAKED = 100;
        const rewardEquation = AMOUNT_STAKED * rewardRate * SECONDS_STAKED / SECONDS_PER_YEAR;

        const Stake = await ethers.getContractFactory("Stake");
        const stake = await Stake.deploy();
        
        return { owner, otherAccount, stake, totalAmountStaked, rewardEquation }; 
    }

    describe("Deployment", function () {
        it("Should set the right owner", async function () {
            const { stake, owner } = await loadFixture(deploy);
        
            expect(await stake.owner()).to.equal(owner.address);
        });

        it("Should set the right totalAmountStaked", async function () {
            const { stake, totalAmountStaked } = await loadFixture(deploy);
        
            expect(await stake.totalAmountStaked()).to.equal(totalAmountStaked);
        });
    });

    describe("Stake", function () {
        it("Should allow user to stake their ETH", async function () {
            const { stake, otherAccount } = await loadFixture(deploy);

            await stake.connect(otherAccount).stake({ value: 50 });
            expect(await stake.getAmountStaked(otherAccount)).to.equal(50);
        });

        it("Should have the correct total amount staked", async function () {
            const { stake, otherAccount } = await loadFixture(deploy);

            await stake.connect(otherAccount).stake({ value: 50 });
            expect(await stake.totalAmountStaked()).to.equal(50);
        });

    });

    describe("Unstake", function () {
        it("Should allow user to unstake", async function () {
            const { stake, otherAccount } = await loadFixture(deploy);

            await stake.connect(otherAccount).stake({ value: 50 });
            await stake.connect(otherAccount).unstake(30);
            expect(await stake.getAmountStaked(otherAccount)).to.equal(20);
        });

        it("Should have the correct total amount staked after user unstakes", async function () {
            const { stake, otherAccount } = await loadFixture(deploy);

            await stake.connect(otherAccount).stake({ value: 50 });
            await stake.connect(otherAccount).unstake(30);
            expect(await stake.totalAmountStaked()).to.equal(20);
        });
    
    });

    describe("calculateRewards ", function () {

        it("Should correctly calculate rewards", async function() {
            const { stake, otherAccount, rewardEquation } = await loadFixture(deploy);

            await stake.connect(otherAccount).stake({ value: 100 });
            await ethers.provider.send("evm_increaseTime", [3600]);
            await ethers.provider.send("evm_mine");
            await stake.calculateRewards(otherAccount.address);
            const roundedRewardValue = Math.floor(Number(await stake.getRewardsForUser(otherAccount.address)));
            expect(roundedRewardValue).to.equal(Math.floor(rewardEquation));
        });
       
    });

    describe("claimRewards", function () {
        it("Should revert with error if there are no rewards", async function () {
            const { stake, otherAccount } = await loadFixture(deploy);
            await expect(stake.connect(otherAccount).claimRewards()).to.be.revertedWith("No rewards to claim!");
        });

        it("Should transfer the correct amount of reward tokens to the user", async function () {
            const { stake, otherAccount, rewardEquation } = await loadFixture(deploy);

            await stake.connect(otherAccount).stake({ value: 100 });
            await ethers.provider.send("evm_increaseTime", [3600]);
            await ethers.provider.send("evm_mine");
            await stake.calculateRewards(otherAccount.address);
            await stake.connect(otherAccount).claimRewards();
            const roundedRewardValue = Math.floor(Number(await stake.balanceOf(otherAccount.address)));

            await expect(roundedRewardValue).to.equal(Math.floor(rewardEquation));
        });
    });

});