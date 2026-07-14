// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { IXpesaQuestCompletionBadgeNFT } from "../../src/IXpesaQuestCompletionBadgeNFT.sol";
import { QuestBadgeTestBase } from "../QuestBadgeTestBase.sol";

contract XpesaQuestCompletionBadgeNFTTest is QuestBadgeTestBase {
    event QuestCompletionBadgeMinted(
        uint256 indexed tokenId,
        address indexed recipient,
        bytes32 indexed questId,
        bytes32 attemptId,
        bytes32 participantId,
        uint256 score,
        uint256 maxScore,
        bytes32 claimId,
        uint64 completedAt,
        string tokenURI
    );

    function testAuthorizedMinterCanMintBadge() public {
        vm.expectEmit(true, true, true, true);
        emit QuestCompletionBadgeMinted(
            1, recipient, questId, attemptId, participantId, 8, 10, claimId, 1_720_000_000, uri
        );

        uint256 tokenId = _mintDefault();

        assertEq(tokenId, 1);
        assertEq(nft.ownerOf(tokenId), recipient);
        assertEq(nft.tokenURI(tokenId), uri);
        assertEq(nft.tokenIdForClaim(claimId), tokenId);
        assertTrue(nft.claimExists(claimId));
        assertEq(nft.totalMinted(), 1);

        IXpesaQuestCompletionBadgeNFT.QuestBadge memory badge = nft.getBadge(tokenId);
        assertEq(badge.recipient, recipient);
        assertEq(badge.questId, questId);
        assertEq(badge.attemptId, attemptId);
        assertEq(badge.participantId, participantId);
        assertEq(badge.score, 8);
        assertEq(badge.maxScore, 10);
        assertEq(badge.claimId, claimId);
        assertEq(badge.completedAt, 1_720_000_000);
    }

    function testDuplicateClaimCannotMintTwice() public {
        _mintDefault();

        vm.prank(minter);
        vm.expectRevert(
            abi.encodeWithSelector(IXpesaQuestCompletionBadgeNFT.DuplicateClaim.selector, claimId)
        );
        nft.mintBadge(
            address(0xDAD), questId, attemptId, participantId, 1, 10, claimId, 1, uri
        );

        assertEq(nft.totalMinted(), 1);
        assertEq(nft.tokenIdForClaim(claimId), 1);
    }

    function testRandomUserCannotMint() public {
        vm.expectRevert(_missingRole(address(this), nft.MINTER_ROLE()));
        nft.mintBadge(
            recipient, questId, attemptId, participantId, 8, 10, claimId, 1_720_000_000, uri
        );
    }

    function testBadgeCannotBeTransferredOrApproved() public {
        uint256 tokenId = _mintDefault();

        vm.prank(recipient);
        vm.expectRevert(IXpesaQuestCompletionBadgeNFT.SoulboundTransfer.selector);
        nft.transferFrom(recipient, address(0xDAD), tokenId);

        vm.prank(recipient);
        vm.expectRevert(IXpesaQuestCompletionBadgeNFT.SoulboundApproval.selector);
        nft.approve(address(0xDAD), tokenId);
    }

    function testPauseBlocksMinting() public {
        vm.prank(admin);
        nft.pause();

        vm.prank(minter);
        vm.expectRevert();
        nft.mintBadge(
            recipient, questId, attemptId, participantId, 8, 10, claimId, 1_720_000_000, uri
        );
    }
}
