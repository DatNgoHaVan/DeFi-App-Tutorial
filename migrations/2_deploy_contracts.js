const TokenFarm = artifacts.require("TokenFarm");
const DaiToken = artifacts.require("DaiToken");
const DappToken = artifacts.require("DappToken");

module.exports = async function (deployer, network, accounts) {
  //Deploy Mock DAI Token
  await deployer.deploy(DaiToken);
  const daiToken = await DaiToken.deployed();

  //Deploy DappToken
  await deployer.deploy(DappToken);
  const dappToken = await DappToken.deployed();

  //Deploy TokenFarm
  await deployer.deploy(TokenFarm, dappToken.address, daiToken.address)
  const tokenFarm = await TokenFarm.deployed();
  console.log(tokenFarm.address)

  //Transfer all tokens to TokenFarm (1 million)
  await dappToken.transfer(tokenFarm.address, '1000000000000000000000000')

  //Transfer 100 Mock Dai tokens to Investor
  await daiToken.transfer(accounts[1], '1000000000000000000000000')
};
