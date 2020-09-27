const Web3 = require('web3');
const { assert } = require('chai');
const TokenFarm = artifacts.require("TokenFarm");
const DaiToken = artifacts.require("DaiToken");
const DappToken = artifacts.require("DappToken");

require('chai')
  .use(require('chai-as-promised'))
  .should();

function tokensToWei(n) {
  return Web3.utils.toWei(n, 'ether');
}

// eslint-disable-next-line no-undef
contract('TokenFarm', ([owner, investor]) => {
  let daiToken, dappToken, tokenFarm;

  before(async () => {
    // Load contracts
    daiToken = await DaiToken.new();
    dappToken = await DappToken.new();
    tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address);

    // Transfer all Dapp tokens to farm (1 million)
    await dappToken.transfer(tokenFarm.address, tokensToWei('1000000'));

    // Send Tokens to investor
    await daiToken.transfer(investor, tokensToWei('100'), { from: owner });
  });

  //Test
  describe('Mock DAI deployment', async () => {
    it('has a name', async () => {
      const name = await daiToken.name();
      assert.equal(name, 'Mock DAI Token');
    });
  });

  describe('Dapp Token deployment', async () => {
    it('has a name', async () => {
      const name = await dappToken.name();
      assert.equal(name, 'DApp Token');
    });
  });

  describe('Token Farm deployment', async () => {
    it('has a name', async () => {
      const name = await tokenFarm.name();
      assert.equal(name, 'Dapp Token Farm');
    });

    it('contract has tokens', async () => {
      let balance = await dappToken.balanceOf(tokenFarm.address);
      assert.equal(balance.toString(), tokensToWei('1000000'));
    });
  });

  describe('Farming Tokens', async () => {
    it('rewards investors for staking mDai tokens', async () => {
      let result;

      // Check investor balance staking
      result = await daiToken.balanceOf(investor);
      assert.equal(result.toString(), tokensToWei('100'), "investor Mock DAI wallet balance correct before staking");

      // Stake Mock DAI Tokens
      await daiToken.approve(tokenFarm.address, tokensToWei('100'), { from: investor });
      await tokenFarm.stakeTokens(tokensToWei('100'), { from: investor });

      // Check staking result
      result = await daiToken.balanceOf(investor);
      assert.equal(result.toString(), tokensToWei('0'), "investor Mock DAI wallet balance correct before staking");

      result = await daiToken.balanceOf(tokenFarm.address);
      assert.equal(result.toString(), tokensToWei('100'), "Token Farm Mock DAI balance correct after staking");

      result = await tokenFarm.stakingBalance(investor);
      assert.equal(result.toString(), tokensToWei('100'), "investor staking balance correct after staking");

      result = await tokenFarm.isStaking(investor);
      assert.equal(result.toString(), 'true', "investor staking status correct after staking");

      // Issue Tokens
      await tokenFarm.issueTokens({ from: owner });

      // Check balance after issuance
      result = await dappToken.balanceOf(investor);
      assert.equal(result.toString(), tokensToWei('100'), "investor DApp Token wallet balance correct after issuance");

      // Make sure that only owner can issue tokens 
      await tokenFarm.issueTokens({ from: investor }).should.be.rejected;

      // Unstake tokens
      await tokenFarm.unstakeTokens({ from: investor });

      // Check result after unstaking
      result = await daiToken.balanceOf(investor);
      assert.equal(result.toString(), tokensToWei('100'), "investor Mock DAI wallet balance correct after staking");

      result = await daiToken.balanceOf(tokenFarm.address);
      assert.equal(result.toString(), tokensToWei('0'), "Token Farm Mock DAI balance correct after staking");

      result = await tokenFarm.stakingBalance(investor);
      assert.equal(result.toString(), tokensToWei('0'), "investor staking balance correct after staking");

      result = await tokenFarm.isStaking(investor);
      assert.equal(result.toString(), 'false', "investor staking status correct after staking");
    });
  });

})