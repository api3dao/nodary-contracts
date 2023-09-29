const airnodeProtocolV1 = require('@api3/airnode-protocol-v1');
const testnetUsdc = require('@nodary/testnet-usdc');
const managerMultisigAddresses = require('../deployments/manager-multisig.json');

const networks = ['ethereum-sepolia-testnet'];

module.exports = async ({ config, deployments, ethers, getUnnamedAccounts, network }) => {
  const { deploy, log } = deployments;
  const accounts = await getUnnamedAccounts();

  if (networks.includes(network.name)) {
    const { address: ownableCallForwarderAddress, abi: ownableCallForwarderAbi } = await deploy(
      'OwnableCallForwarder',
      {
        from: accounts[0],
        args: [accounts[0]],
        log: true,
      }
    );
    log(`Deployed OwnableCallForwarder at ${ownableCallForwarderAddress}`);

    const ownableCallForwarder = new ethers.Contract(
      ownableCallForwarderAddress,
      ownableCallForwarderAbi,
      (await ethers.getSigners())[0]
    );
    if ((await ownableCallForwarder.owner()) === accounts[0]) {
      const receipt = await ownableCallForwarder.transferOwnership(managerMultisigAddresses[network.name]);
      await new Promise((resolve) =>
        ethers.provider.once(receipt.hash, () => {
          resolve();
        })
      );
      log(`Transferred OwnableCallForwarder ownership to ${managerMultisigAddresses[network.name]}`);
    }

    const prepaymentDepository = await deploy('PrepaymentDepository', {
      from: accounts[0],
      args: [
        airnodeProtocolV1.references.AccessControlRegistry[config.networks[network.name].chainId],
        'PrepaymentDepository admin (Nodary)',
        ownableCallForwarder.address,
        testnetUsdc.references.TestnetUsdc[config.networks[network.name].chainId],
      ],
      log: true,
    });
    log(`Deployed PrepaymentDepository (Nodary) at ${prepaymentDepository.address}`);
  } else {
    throw new Error(`${network.name} is not supported`);
  }
};
module.exports.tags = ['deploy'];
