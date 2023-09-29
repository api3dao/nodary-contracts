const fs = require('fs');
const path = require('path');

const networks = ['ethereum-sepolia-testnet'];

module.exports = async ({ config }) => {
  const references = {};
  references.chainNames = {};
  for (const network of networks) {
    references.chainNames[config.networks[network].chainId] = network;
  }
  const deploymentBlockNumbers = { chainNames: references.chainNames };

  for (const contractName of ['OwnableCallForwarder', 'PrepaymentDepository']) {
    references[contractName] = {};
    deploymentBlockNumbers[contractName] = {};
    for (const network of networks) {
      const deployment = JSON.parse(fs.readFileSync(path.join('deployments', network, `${contractName}.json`), 'utf8'));
      references[contractName][config.networks[network].chainId] = deployment.address;
      if (deployment.receipt) {
        deploymentBlockNumbers[contractName][config.networks[network].chainId] = deployment.receipt.blockNumber;
      } else {
        deploymentBlockNumbers[contractName][config.networks[network].chainId] = 'MISSING';
      }
    }
  }

  fs.writeFileSync(path.join('deployments', 'references.json'), JSON.stringify(references, null, 2));
  fs.writeFileSync(
    path.join('deployments', 'deployment-block-numbers.json'),
    JSON.stringify(deploymentBlockNumbers, null, 2)
  );
};
module.exports.tags = ['document'];
