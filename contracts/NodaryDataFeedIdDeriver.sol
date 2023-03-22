// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "./interfaces/INodaryDataFeedIdDeriver.sol";

contract NodaryDataFeedIdDeriver is INodaryDataFeedIdDeriver {
    address public immutable override nodaryAirnodeAddress;

    constructor(address _nodaryAirnodeAddress) {
        require(
            _nodaryAirnodeAddress != address(0),
            "Nodary Airnode address zero"
        );
        nodaryAirnodeAddress = _nodaryAirnodeAddress;
    }

    bytes32 private constant NODARY_FEED_ENDPOINT_ID =
        keccak256(abi.encode("Nodary", "feed"));

    function deriveNodaryDataFeedId(
        bytes32 feedName
    ) internal view returns (bytes32 dataFeedId) {
        dataFeedId = keccak256(
            abi.encodePacked(
                nodaryAirnodeAddress,
                keccak256(
                    abi.encodePacked(
                        NODARY_FEED_ENDPOINT_ID,
                        abi.encode(bytes32("1s"), bytes32("name"), feedName)
                    )
                )
            )
        );
    }
}
