const { ethers } = require('hardhat');
const helpers = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');
const nodaryUtilities = require('@nodary/utilities');
const airnodeAbi = require('@api3/airnode-abi');

describe('NodaryDapiNameSetter', function () {
  function deriveRootRole(managerAddress) {
    return ethers.utils.solidityKeccak256(['address'], [managerAddress]);
  }

  function deriveRole(adminRole, roleDescription) {
    return ethers.utils.solidityKeccak256(
      ['bytes32', 'bytes32'],
      [adminRole, ethers.utils.solidityKeccak256(['string'], [roleDescription])]
    );
  }

  async function deploy() {
    const accounts = await ethers.getSigners();
    const roles = {
      deployer: accounts[0],
      manager: accounts[1],
      nodaryAirnode: accounts[2],
      randomPerson: accounts[9],
    };
    const api3ServerV1AdminRoleDescription = 'Api3ServerV1 admin';
    const dapiNameSetterRoleDescription = 'dAPI name setter';
    const accessControlRegistryFactory = await ethers.getContractFactory('AccessControlRegistry', roles.deployer);
    const accessControlRegistry = await accessControlRegistryFactory.deploy();
    const api3ServerV1Factory = await ethers.getContractFactory('Api3ServerV1', roles.deployer);
    const api3ServerV1 = await api3ServerV1Factory.deploy(
      accessControlRegistry.address,
      api3ServerV1AdminRoleDescription,
      roles.manager.address
    );
    const nodaryDapiNameSetterFactory = await ethers.getContractFactory('NodaryDapiNameSetter', roles.deployer);
    const nodaryDapiNameSetter = await nodaryDapiNameSetterFactory.deploy(
      api3ServerV1.address,
      roles.nodaryAirnode.address
    );

    const managerRootRole = deriveRootRole(roles.manager.address);
    const adminRole = deriveRole(managerRootRole, api3ServerV1AdminRoleDescription);
    const dapiNameSetterRole = deriveRole(adminRole, dapiNameSetterRoleDescription);
    await accessControlRegistry
      .connect(roles.manager)
      .initializeRoleAndGrantToSender(managerRootRole, api3ServerV1AdminRoleDescription);
    await accessControlRegistry
      .connect(roles.manager)
      .initializeRoleAndGrantToSender(adminRole, dapiNameSetterRoleDescription);
    await accessControlRegistry.connect(roles.manager).grantRole(dapiNameSetterRole, nodaryDapiNameSetter.address);

    return {
      roles,
      api3ServerV1,
      nodaryDapiNameSetter,
    };
  }
  describe('constructor', function () {
    context('Api3ServerV1 address is not zero', function () {
      context('Nodary Airnode address is not zero', function () {
        it('constructs', async function () {
          const { api3ServerV1, nodaryDapiNameSetter } = await helpers.loadFixture(deploy);
          expect(await nodaryDapiNameSetter.api3ServerV1()).to.equal(api3ServerV1.address);
        });
      });
      context('Nodary Airnode address is zero', function () {
        it('reverts', async function () {
          const { roles, api3ServerV1 } = await helpers.loadFixture(deploy);
          const nodaryDapiNameSetterFactory = await ethers.getContractFactory('NodaryDapiNameSetter', roles.deployer);
          await expect(
            nodaryDapiNameSetterFactory.deploy(api3ServerV1.address, ethers.constants.AddressZero)
          ).to.be.revertedWith('Nodary Airnode address zero');
        });
      });
    });
    context('Api3ServerV1 address is zero', function () {
      it('reverts', async function () {
        const { roles } = await helpers.loadFixture(deploy);
        const nodaryDapiNameSetterFactory = await ethers.getContractFactory('NodaryDapiNameSetter', roles.deployer);
        await expect(
          nodaryDapiNameSetterFactory.deploy(ethers.constants.AddressZero, roles.nodaryAirnode.address)
        ).to.be.revertedWith('Api3ServerV1 address zero');
      });
    });
  });

  describe('setDapiNameToNodaryBeacon', function () {
    context('The dAPI name is not set', function () {
      context('The Beacon was updated in the last day', function () {
        it('sets dAPI name to Nodary Beacon', async function () {
          const { roles, api3ServerV1, nodaryDapiNameSetter } = await helpers.loadFixture(deploy);
          const decodedDapiName = 'My dAPI';
          const endpointId = nodaryUtilities.computeEndpointId('feed');
          const parameters = airnodeAbi.encode([
            {
              name: 'name',
              type: 'string32',
              value: decodedDapiName,
            },
          ]);
          const templateId = ethers.utils.solidityKeccak256(['bytes32', 'bytes'], [endpointId, parameters]);
          const value = 123456;
          const timestamp = (await helpers.time.latest()) - 12 * 60 * 60; // 12 hours ago
          const data = ethers.utils.defaultAbiCoder.encode(['int256'], [value]);
          const signature = await roles.nodaryAirnode.signMessage(
            ethers.utils.arrayify(
              ethers.utils.solidityKeccak256(['bytes32', 'uint256', 'bytes'], [templateId, timestamp, data])
            )
          );
          await api3ServerV1
            .connect(roles.randomPerson)
            .updateBeaconWithSignedData(roles.nodaryAirnode.address, templateId, timestamp, data, signature);
          const dapiName = ethers.utils.formatBytes32String(decodedDapiName);
          await expect(
            nodaryDapiNameSetter.connect(roles.randomPerson).setDapiNameToNodaryBeacon(dapiName)
          ).to.not.be.reverted;
          expect(await api3ServerV1.dapiNameToDataFeedId(dapiName)).to.be.equal(
            ethers.utils.solidityKeccak256(['address', 'bytes32'], [roles.nodaryAirnode.address, templateId])
          );
          const dataFeed = await api3ServerV1.readDataFeedWithDapiNameHash(
            ethers.utils.keccak256(ethers.utils.formatBytes32String(decodedDapiName))
          );
          expect(dataFeed.value).to.equal(value);
          expect(dataFeed.timestamp).to.equal(timestamp);
        });
      });
      context('The Beacon was not updated in the last day', function () {
        it('reverts', async function () {
          const { roles, nodaryDapiNameSetter } = await helpers.loadFixture(deploy);
          const dapiName = ethers.utils.formatBytes32String('My dAPI');
          await expect(
            nodaryDapiNameSetter.connect(roles.randomPerson).setDapiNameToNodaryBeacon(dapiName)
          ).to.be.revertedWith('Beacon not updated in last day');
        });
      });
    });
    context('The dAPI name is set', function () {
      it('reverts', async function () {
        const { roles, api3ServerV1, nodaryDapiNameSetter } = await helpers.loadFixture(deploy);
        const dapiName = ethers.utils.formatBytes32String('My dAPI');
        await api3ServerV1
          .connect(roles.manager)
          .setDapiName(dapiName, ethers.utils.hexlify(ethers.utils.randomBytes(32)));
        await expect(
          nodaryDapiNameSetter.connect(roles.randomPerson).setDapiNameToNodaryBeacon(dapiName)
        ).to.be.revertedWith('dAPI name already set');
      });
    });
  });
});
