// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

interface IXpesaSupporterReceiptNFT {
    struct Receipt {
        address payer;
        address creator;
        address paymentToken;
        uint256 amount;
        uint256 points;
        bytes32 paymentTxHash;
        bytes32 paymentId;
        uint64 paidAt;
    }

    error DuplicatePayment(bytes32 paymentId);
    error EmptyTokenURI();
    error InvalidPaymentToken(address paymentToken);
    error NonexistentReceipt(uint256 tokenId);
    error SoulboundApproval();
    error SoulboundTransfer();
    error ZeroAddress();
    error ZeroAmount();
    error ZeroPaymentId();
    error ZeroPaymentTxHash();

    event SupporterReceiptMinted(
        uint256 indexed tokenId,
        address indexed payer,
        address indexed creator,
        bytes32 paymentId,
        address paymentToken,
        uint256 amount,
        uint256 points,
        bytes32 paymentTxHash,
        uint64 paidAt,
        string tokenURI
    );

    event PaymentTokenAllowlistSet(bool enabled);
    event PaymentTokenApprovalSet(address indexed paymentToken, bool approved);
}
