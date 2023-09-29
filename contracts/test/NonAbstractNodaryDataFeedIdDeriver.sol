// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../NodaryDataFeedIdDeriver.sol";

contract NonAbstractNodaryDataFeedIdDeriver is NodaryDataFeedIdDeriver {
    function externalDeriveNodaryTemplateId(
        bytes32 feedName
    ) external pure returns (bytes32 templateId) {
        templateId = deriveNodaryTemplateId(feedName);
    }

    function externalDeriveNodaryDataFeedId(
        bytes32 feedName
    ) external pure returns (bytes32 dataFeedId) {
        dataFeedId = deriveNodaryDataFeedId(feedName);
    }
}
