// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/INodaryDataFeedIdDeriver.sol";

abstract contract NodaryDataFeedIdDeriver is INodaryDataFeedIdDeriver {
    address public constant override NODARY_AIRNODE_ADDRESS =
        0xc52EeA00154B4fF1EbbF8Ba39FDe37F1AC3B9Fd4;

    bytes32 private constant NODARY_FEED_ENDPOINT_ID =
        keccak256(abi.encode("Nodary", "feed"));

    function deriveNodaryTemplateId(
        bytes32 feedName
    ) internal pure returns (bytes32 templateId) {
        templateId = keccak256(
            abi.encodePacked(
                NODARY_FEED_ENDPOINT_ID,
                abi.encode(bytes32("1s"), bytes32("name"), feedName)
            )
        );
    }

    function deriveNodaryDataFeedId(
        bytes32 feedName
    ) internal pure returns (bytes32 dataFeedId) {
        dataFeedId = keccak256(
            abi.encodePacked(
                NODARY_AIRNODE_ADDRESS,
                deriveNodaryTemplateId(feedName)
            )
        );
    }
}
