// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";
import { Test } from "forge-std/Test.sol";
import { XpesaQuestCompletionBadgeNFT } from "../src/XpesaQuestCompletionBadgeNFT.sol";

abstract contract QuestBadgeTestBase is Test {
    XpesaQuestCompletionBadgeNFT internal nft;

    address internal admin = address(0xA11CE);
    address internal minter = address(0xB0B);
    address internal recipient = address(0xCAFE);

    bytes32 internal questId = keccak256("quest-1");
    bytes32 internal attemptId = keccak256("attempt-1");
    bytes32 internal participantId = keccak256("participant-1");
    bytes32 internal claimId = keccak256("quest-1:recipient");
    string internal uri = "ipfs://quest-badge-1";

    function setUp() public virtual {
        nft = new XpesaQuestCompletionBadgeNFT(admin, minter);
    }

    function _mintDefault() internal returns (uint256) {
        vm.prank(minter);
        return nft.mintBadge(
            recipient, questId, attemptId, participantId, 8, 10, claimId, 1_720_000_000, uri
        );
    }

    function _missingRole(address account, bytes32 role) internal pure returns (bytes memory) {
        return abi.encodeWithSelector(
            IAccessControl.AccessControlUnauthorizedAccount.selector, account, role
        );
    }
}
