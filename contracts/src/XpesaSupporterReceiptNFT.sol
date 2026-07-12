// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { AccessControl } from "@openzeppelin/contracts/access/AccessControl.sol";
import { ERC721 } from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import { IERC721 } from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {
    ERC721URIStorage
} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { IXpesaSupporterReceiptNFT } from "./IXpesaSupporterReceiptNFT.sol";

contract XpesaSupporterReceiptNFT is
    ERC721URIStorage,
    AccessControl,
    Pausable,
    IXpesaSupporterReceiptNFT
{
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    uint256 private _nextTokenId = 1;

    mapping(uint256 tokenId => Receipt) private _receipts;
    mapping(bytes32 paymentId => uint256 tokenId) private _tokenIdForPayment;
    mapping(address paymentToken => bool approved) private _approvedPaymentTokens;

    bool public paymentTokenAllowlistEnabled;

    constructor(
        string memory name_,
        string memory symbol_,
        address admin,
        address initialMinter,
        address approvedPaymentToken,
        bool enablePaymentTokenAllowlist
    ) ERC721(name_, symbol_) {
        if (admin == address(0) || initialMinter == address(0)) {
            revert ZeroAddress();
        }
        if (enablePaymentTokenAllowlist && approvedPaymentToken == address(0)) {
            revert InvalidPaymentToken(address(0));
        }

        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(MINTER_ROLE, initialMinter);
        _grantRole(PAUSER_ROLE, admin);

        paymentTokenAllowlistEnabled = enablePaymentTokenAllowlist;
        if (approvedPaymentToken != address(0)) {
            _approvedPaymentTokens[approvedPaymentToken] = true;
            emit PaymentTokenApprovalSet(approvedPaymentToken, true);
        }
        emit PaymentTokenAllowlistSet(enablePaymentTokenAllowlist);
    }

    function mintReceipt(
        address recipient,
        address creator,
        address paymentToken,
        uint256 amount,
        uint256 points,
        bytes32 paymentTxHash,
        bytes32 paymentId,
        uint64 paidAt,
        string calldata uri
    ) external onlyRole(MINTER_ROLE) whenNotPaused returns (uint256 tokenId) {
        _validateReceiptInput(
            recipient, creator, paymentToken, amount, paymentTxHash, paymentId, uri
        );

        tokenId = _nextTokenId++;
        _tokenIdForPayment[paymentId] = tokenId;
        _receipts[tokenId] = Receipt({
            payer: recipient,
            creator: creator,
            paymentToken: paymentToken,
            amount: amount,
            points: points,
            paymentTxHash: paymentTxHash,
            paymentId: paymentId,
            paidAt: paidAt
        });

        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, uri);

        emit SupporterReceiptMinted(
            tokenId,
            recipient,
            creator,
            paymentId,
            paymentToken,
            amount,
            points,
            paymentTxHash,
            paidAt,
            uri
        );
    }

    function getReceipt(uint256 tokenId) external view returns (Receipt memory receipt) {
        if (_ownerOf(tokenId) == address(0)) revert NonexistentReceipt(tokenId);
        return _receipts[tokenId];
    }

    function tokenIdForPayment(bytes32 paymentId) external view returns (uint256) {
        return _tokenIdForPayment[paymentId];
    }

    function receiptExists(bytes32 paymentId) external view returns (bool) {
        return _tokenIdForPayment[paymentId] != 0;
    }

    function totalMinted() external view returns (uint256) {
        return _nextTokenId - 1;
    }

    function isPaymentTokenApproved(address paymentToken) external view returns (bool) {
        return _approvedPaymentTokens[paymentToken];
    }

    function setPaymentTokenAllowlistEnabled(bool enabled) external onlyRole(DEFAULT_ADMIN_ROLE) {
        paymentTokenAllowlistEnabled = enabled;
        emit PaymentTokenAllowlistSet(enabled);
    }

    function setPaymentTokenApproval(address paymentToken, bool approved)
        external
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        if (paymentToken == address(0)) revert InvalidPaymentToken(address(0));
        _approvedPaymentTokens[paymentToken] = approved;
        emit PaymentTokenApprovalSet(paymentToken, approved);
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

    function _validateReceiptInput(
        address recipient,
        address creator,
        address paymentToken,
        uint256 amount,
        bytes32 paymentTxHash,
        bytes32 paymentId,
        string calldata uri
    ) private view {
        if (recipient == address(0) || creator == address(0)) {
            revert ZeroAddress();
        }
        if (paymentToken == address(0)) revert InvalidPaymentToken(address(0));
        if (amount == 0) revert ZeroAmount();
        if (paymentId == bytes32(0)) revert ZeroPaymentId();
        if (paymentTxHash == bytes32(0)) revert ZeroPaymentTxHash();
        if (bytes(uri).length == 0) revert EmptyTokenURI();
        if (_tokenIdForPayment[paymentId] != 0) revert DuplicatePayment(paymentId);
        if (paymentTokenAllowlistEnabled && !_approvedPaymentTokens[paymentToken]) {
            revert InvalidPaymentToken(paymentToken);
        }
    }
}
