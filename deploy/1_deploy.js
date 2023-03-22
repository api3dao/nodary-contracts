const hre = require('hardhat');
const airnodeProtocolV1 = require('@api3/airnode-protocol-v1');
const nodaryUtilities = require('@nodary/utilities');

module.exports = async () => {
  const chainId = hre.network.config.chainId;
  const nodaryDapiNameSetter = await hre.deployments.deploy('NodaryDapiNameSetter', {
    args: [airnodeProtocolV1.references.Api3ServerV1[chainId.toString()], nodaryUtilities.nodaryAirnodeAddress],
    from: (await hre.getUnnamedAccounts())[0],
    log: true,
    deterministicDeployment: process.env.DETERMINISTIC ? hre.ethers.constants.HashZero : undefined,
  });
  console.log(`Deployed NodaryDapiNameSetter at ${nodaryDapiNameSetter.address}`);
};
