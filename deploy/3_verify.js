const airnodeProtocolV1 = require('@api3/airnode-protocol-v1');
const testnetUsdc = require('@nodary/testnet-usdc');

const networks = ['ethereum-sepolia-testnet'];

module.exports = async ({ config, deployments, getUnnamedAccounts, network, run }) => {
  const accounts = await getUnnamedAccounts();

  if (networks.includes(network.name)) {
    const OwnableCallForwarder = await deployments.get('OwnableCallForwarder');
    await run('verify:verify', {
      address: OwnableCallForwarder.address,
      constructorArguments: [accounts[0]],
    });

    const PrepaymentDepository = await deployments.get('PrepaymentDepository');
    await run('verify:verify', {
      address: PrepaymentDepository.address,
      constructorArguments: [
        airnodeProtocolV1.references.AccessControlRegistry[config.networks[network.name].chainId],
        'PrepaymentDepository admin (Nodary)',
        OwnableCallForwarder.address,
        testnetUsdc.references.TestnetUsdc[config.networks[network.name].chainId],
      ],
    });
  } else {
    throw new Error(`${network.name} is not supported`);
  }
};
module.exports.tags = ['verify'];
