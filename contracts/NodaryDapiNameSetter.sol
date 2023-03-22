// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./NodaryDataFeedIdDeriver.sol";
import "./interfaces/INodaryDapiNameSetter.sol";
import "@api3/airnode-protocol-v1/contracts/api3-server-v1/interfaces/IApi3ServerV1.sol";

contract NodaryDapiNameSetter is
    NodaryDataFeedIdDeriver,
    INodaryDapiNameSetter
{
    address public immutable override api3ServerV1;

    constructor(
        address _api3ServerV1,
        address _nodaryAirnodeAddress
    ) NodaryDataFeedIdDeriver(_nodaryAirnodeAddress) {
        require(_api3ServerV1 != address(0), "Api3ServerV1 address zero");
        api3ServerV1 = _api3ServerV1;
    }

    function setDapiNameToNodaryBeacon(
        bytes32 dapiName
    ) external override returns (bytes32 beaconId) {
        require(
            IApi3ServerV1(api3ServerV1).dapiNameToDataFeedId(dapiName) ==
                bytes32(0),
            "dAPI name already set"
        );
        beaconId = deriveNodaryDataFeedId(dapiName);
        (, uint32 timestamp) = IApi3ServerV1(api3ServerV1).dataFeeds(beaconId);
        require(
            timestamp + 1 days > block.timestamp,
            "Beacon not updated in last day"
        );
        IApi3ServerV1(api3ServerV1).setDapiName(dapiName, beaconId);
    }
}
