const { ethers } = require('hardhat');
const helpers = require('@nomicfoundation/hardhat-network-helpers');
const { expect } = require('chai');
const nodaryUtilities = require('@nodary/utilities');

describe('NodaryDataFeedIdDeriver', function () {
  async function deploy() {
    const NodaryDataFeedIdDeriverFactory = await ethers.getContractFactory(
      'NonAbstractNodaryDataFeedIdDeriver',
      (
        await ethers.getSigners()
      )[0]
    );
    const nodaryDataFeedIdDeriver = await NodaryDataFeedIdDeriverFactory.deploy();
    return {
      nodaryDataFeedIdDeriver,
    };
  }

  describe('deriveNodaryDataFeedId', function () {
    it('derives Nodary data feed ID', async function () {
      const { nodaryDataFeedIdDeriver } = await helpers.loadFixture(deploy);
      const decodedDapiName = 'ETH/USD';
      expect(
        await nodaryDataFeedIdDeriver.externalDeriveNodaryDataFeedId(ethers.utils.formatBytes32String(decodedDapiName))
      ).to.equal(nodaryUtilities.computeFeedId(decodedDapiName));
    });
  });
});
