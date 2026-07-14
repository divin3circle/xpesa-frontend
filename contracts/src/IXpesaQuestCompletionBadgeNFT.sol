// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface IXpesaQuestCompletionBadgeNFT {
    struct QuestBadge {
        address recipient;
        bytes32 questId;
        bytes32 attemptId;
        bytes32 participantId;
        uint256 score;
        uint256 maxScore;
        bytes32 claimId;
        uint64 completedAt;
    }

    error DuplicateClaim(bytes32 claimId);
    error EmptyTokenURI();
    error InvalidScore();
    error NonexistentBadge(uint256 tokenId);
    error SoulboundApproval();
    error SoulboundTransfer();
    error ZeroAddress();
    error ZeroClaimId();
    error ZeroQuestId();

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
}
