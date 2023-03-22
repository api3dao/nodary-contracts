// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./INodaryDataFeedIdDeriver.sol";

interface INodaryDapiNameSetter is INodaryDataFeedIdDeriver {
    function setDapiNameToNodaryBeacon(
        bytes32 dapiName
    ) external returns (bytes32 beaconId);

    function api3ServerV1() external view returns (address);
}
