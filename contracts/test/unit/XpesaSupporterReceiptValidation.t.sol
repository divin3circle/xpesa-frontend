// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { IXpesaSupporterReceiptNFT } from "../../src/IXpesaSupporterReceiptNFT.sol";
import { ReceiptTestBase } from "../ReceiptTestBase.sol";

contract XpesaSupporterReceiptValidationTest is ReceiptTestBase {
    function testValidationRejectsBadInputs() public {
        _expectMintRevert(
            address(0),
            creator,
            paymentToken,
            1,
            paymentTxHash,
            paymentId,
            uri,
            IXpesaSupporterReceiptNFT.ZeroAddress.selector
        );
        _expectMintRevert(
            payer,
            address(0),
            paymentToken,
            1,
            paymentTxHash,
            paymentId,
            uri,
            IXpesaSupporterReceiptNFT.ZeroAddress.selector
        );
        _expectMintRevertBytes(
            payer,
            creator,
            address(0),
            1,
            paymentTxHash,
            paymentId,
            uri,
            abi.encodeWithSelector(
                IXpesaSupporterReceiptNFT.InvalidPaymentToken.selector, address(0)
            )
        );
        _expectMintRevert(
            payer,
            creator,
            paymentToken,
            0,
            paymentTxHash,
            paymentId,
            uri,
            IXpesaSupporterReceiptNFT.ZeroAmount.selector
        );
        _expectMintRevert(
            payer,
            creator,
            paymentToken,
            1,
            bytes32(0),
            paymentId,
            uri,
            IXpesaSupporterReceiptNFT.ZeroPaymentTxHash.selector
        );
        _expectMintRevert(
            payer,
            creator,
            paymentToken,
            1,
            paymentTxHash,
            bytes32(0),
            uri,
            IXpesaSupporterReceiptNFT.ZeroPaymentId.selector
        );
        _expectMintRevert(
            payer,
            creator,
            paymentToken,
            1,
            paymentTxHash,
            paymentId,
            "",
            IXpesaSupporterReceiptNFT.EmptyTokenURI.selector
        );
    }

    function testPaymentTokenAllowlistCanBeConfigured() public {
        address otherToken = address(0x9999);

        vm.prank(minter);
        vm.expectRevert(
            abi.encodeWithSelector(
                IXpesaSupporterReceiptNFT.InvalidPaymentToken.selector, otherToken
            )
        );
        nft.mintReceipt(payer, creator, otherToken, 1, 1, paymentTxHash, paymentId, 1, uri);

        vm.prank(admin);
        nft.setPaymentTokenApproval(otherToken, true);

        vm.prank(minter);
        nft.mintReceipt(payer, creator, otherToken, 1, 1, paymentTxHash, paymentId, 1, uri);
        assertEq(nft.totalMinted(), 1);
    }

    function _expectMintRevert(
        address recipient,
        address receiptCreator,
        address token,
        uint256 amount,
        bytes32 txHash,
        bytes32 id,
        string memory tokenUri,
        bytes4 selector
    ) internal {
        vm.prank(minter);
        vm.expectRevert(selector);
        nft.mintReceipt(recipient, receiptCreator, token, amount, 1, txHash, id, 1, tokenUri);
    }

    function _expectMintRevertBytes(
        address recipient,
        address receiptCreator,
        address token,
        uint256 amount,
        bytes32 txHash,
        bytes32 id,
        string memory tokenUri,
        bytes memory expectedError
    ) internal {
        vm.prank(minter);
        vm.expectRevert(expectedError);
        nft.mintReceipt(recipient, receiptCreator, token, amount, 1, txHash, id, 1, tokenUri);
    }
}
