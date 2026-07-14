// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { IERC721 } from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {
    ERC721URIStorage
} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { IXpesaQuestCompletionBadgeNFT } from "./IXpesaQuestCompletionBadgeNFT.sol";

contract XpesaQuestCompletionBadgeNFT is
    ERC721URIStorage,
    AccessControl,
    Pausable,
    IXpesaQuestCompletionBadgeNFT
{
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    uint256 private _nextTokenId = 1;

    mapping(uint256 tokenId => QuestBadge) private _badges;
    mapping(bytes32 claimId => uint256 tokenId) private _tokenIdForClaim;

    constructor(address admin, address initialMinter)
        ERC721("Xpesa Quest Completion Badge", "XPQB")
    {
        if (admin == address(0) || initialMinter == address(0)) revert ZeroAddress();

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, initialMinter);
        _grantRole(PAUSER_ROLE, admin);
    }

    function mintBadge(
        address recipient,
        bytes32 questId,
        bytes32 attemptId,
        bytes32 participantId,
        uint256 score,
        uint256 maxScore,
        bytes32 claimId,
        uint64 completedAt,
        string calldata uri
    ) external onlyRole(MINTER_ROLE) whenNotPaused returns (uint256 tokenId) {
        _validateBadgeInput(recipient, questId, score, maxScore, claimId, uri);

        tokenId = _nextTokenId++;
        _tokenIdForClaim[claimId] = tokenId;
        _badges[tokenId] = QuestBadge({
            recipient: recipient,
            questId: questId,
            attemptId: attemptId,
            participantId: participantId,
            score: score,
            maxScore: maxScore,
            claimId: claimId,
            completedAt: completedAt
        });

        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, uri);

        emit QuestCompletionBadgeMinted(
            tokenId,
            recipient,
            questId,
            attemptId,
            participantId,
            score,
            maxScore,
            claimId,
            completedAt,
            uri
        );
    }

    function getBadge(uint256 tokenId) external view returns (QuestBadge memory badge) {
        if (_ownerOf(tokenId) == address(0)) revert NonexistentBadge(tokenId);
        return _badges[tokenId];
    }

    function tokenIdForClaim(bytes32 claimId) external view returns (uint256) {
        return _tokenIdForClaim[claimId];
    }

    function claimExists(bytes32 claimId) external view returns (bool) {
        return _tokenIdForClaim[claimId] != 0;
    }

    function totalMinted() external view returns (uint256) {
        return _nextTokenId - 1;
    }

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function approve(address, uint256) public pure override(ERC721, IERC721) {
        revert SoulboundApproval();
    }

    function setApprovalForAll(address, bool) public pure override(ERC721, IERC721) {
        revert SoulboundApproval();
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _update(address to, uint256 tokenId, address auth)
        internal
        override
        returns (address)
    {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) revert SoulboundTransfer();
        return super._update(to, tokenId, auth);
    }

    function _validateBadgeInput(
        address recipient,
        bytes32 questId,
        uint256 score,
        uint256 maxScore,
        bytes32 claimId,
        string calldata uri
    ) private view {
        if (recipient == address(0)) revert ZeroAddress();
        if (questId == bytes32(0)) revert ZeroQuestId();
        if (claimId == bytes32(0)) revert ZeroClaimId();
        if (maxScore == 0 || score > maxScore) revert InvalidScore();
        if (bytes(uri).length == 0) revert EmptyTokenURI();
        if (_tokenIdForClaim[claimId] != 0) revert DuplicateClaim(claimId);
    }
}
