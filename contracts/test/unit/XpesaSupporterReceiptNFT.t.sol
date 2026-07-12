// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { IXpesaSupporterReceiptNFT } from "../../src/IXpesaSupporterReceiptNFT.sol";
import { ReceiptTestBase } from "../ReceiptTestBase.sol";

contract XpesaSupporterReceiptNFTTest is ReceiptTestBase {
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

    function testAuthorizedMinterCanMintReceipt() public {
        vm.expectEmit(true, true, true, true);
        emit SupporterReceiptMinted(
            1,
            payer,
            creator,
            paymentId,
            paymentToken,
            10_000_000,
            100,
            paymentTxHash,
            1_720_000_000,
            uri
        );

        uint256 tokenId = _mintDefault();

        assertEq(tokenId, 1);
        assertEq(nft.ownerOf(tokenId), payer);
        assertEq(nft.tokenURI(tokenId), uri);
        assertEq(nft.tokenIdForPayment(paymentId), tokenId);
        assertTrue(nft.receiptExists(paymentId));
        assertEq(nft.totalMinted(), 1);

        IXpesaSupporterReceiptNFT.Receipt memory receipt = nft.getReceipt(tokenId);
        assertEq(receipt.payer, payer);
        assertEq(receipt.creator, creator);
        assertEq(receipt.paymentToken, paymentToken);
        assertEq(receipt.amount, 10_000_000);
        assertEq(receipt.points, 100);
        assertEq(receipt.paymentTxHash, paymentTxHash);
        assertEq(receipt.paymentId, paymentId);
        assertEq(receipt.paidAt, 1_720_000_000);
    }

    function testDuplicatePaymentIdCannotMintTwice() public {
        _mintDefault();

        vm.prank(minter);
        vm.expectRevert(
            abi.encodeWithSelector(IXpesaSupporterReceiptNFT.DuplicatePayment.selector, paymentId)
        );
        nft.mintReceipt(
            address(0xDAD), creator, paymentToken, 1, 1, paymentTxHash, paymentId, 1, uri
        );

        assertEq(nft.totalMinted(), 1);
        assertEq(nft.tokenIdForPayment(paymentId), 1);
    }

    function testReceiptCannotBeTransferredOrApproved() public {
        uint256 tokenId = _mintDefault();

        vm.prank(payer);
        vm.expectRevert(IXpesaSupporterReceiptNFT.SoulboundTransfer.selector);
        nft.transferFrom(payer, address(0xDAD), tokenId);

        vm.prank(payer);
        vm.expectRevert(IXpesaSupporterReceiptNFT.SoulboundTransfer.selector);
        nft.safeTransferFrom(payer, address(0xDAD), tokenId);

        vm.prank(payer);
        vm.expectRevert(IXpesaSupporterReceiptNFT.SoulboundTransfer.selector);
        nft.safeTransferFrom(payer, address(0xDAD), tokenId, "");

        vm.prank(payer);
        vm.expectRevert(IXpesaSupporterReceiptNFT.SoulboundApproval.selector);
        nft.approve(address(0xDAD), tokenId);

        vm.prank(payer);
        vm.expectRevert(IXpesaSupporterReceiptNFT.SoulboundApproval.selector);
        nft.setApprovalForAll(address(0xDAD), true);
    }

    function testNonexistentReceiptLookupReverts() public {
        vm.expectRevert(
            abi.encodeWithSelector(IXpesaSupporterReceiptNFT.NonexistentReceipt.selector, 1)
        );
        nft.getReceipt(1);
    }
}
