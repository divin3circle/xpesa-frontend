// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { IXpesaSupporterReceiptNFT } from "../../src/IXpesaSupporterReceiptNFT.sol";
import { XpesaSupporterReceiptNFT } from "../../src/XpesaSupporterReceiptNFT.sol";
import { ReceiptTestBase } from "../ReceiptTestBase.sol";

contract XpesaSupporterReceiptNFTFuzzTest is ReceiptTestBase {
    function testFuzzAuthorizedMintCreatesOneReceipt(
        address fuzzPayer,
        address fuzzCreator,
        uint96 fuzzAmount,
        uint96 fuzzPoints,
        bytes32 fuzzPaymentId,
        bytes32 fuzzTxHash,
        uint64 fuzzPaidAt
    ) public {
        vm.assume(fuzzPayer != address(0));
        vm.assume(fuzzPayer != address(vm));
        vm.assume(fuzzPayer.code.length == 0);
        vm.assume(fuzzCreator != address(0));
        vm.assume(fuzzPaymentId != bytes32(0));
        vm.assume(fuzzTxHash != bytes32(0));
        uint256 amount = _nonzero(fuzzAmount);

        vm.prank(minter);
        uint256 tokenId = nft.mintReceipt(
            fuzzPayer,
            fuzzCreator,
            paymentToken,
            amount,
            fuzzPoints,
            fuzzTxHash,
            fuzzPaymentId,
            fuzzPaidAt,
            "ipfs://fuzz-receipt"
        );

        assertEq(tokenId, 1);
        assertEq(nft.totalMinted(), 1);
        assertEq(nft.ownerOf(tokenId), fuzzPayer);
        assertEq(nft.tokenIdForPayment(fuzzPaymentId), tokenId);
        assertTrue(nft.receiptExists(fuzzPaymentId));

        IXpesaSupporterReceiptNFT.Receipt memory receipt = nft.getReceipt(tokenId);
        assertEq(receipt.payer, fuzzPayer);
        assertEq(receipt.creator, fuzzCreator);
        assertEq(receipt.amount, amount);
        assertEq(receipt.points, fuzzPoints);
    }

    function testFuzzPaymentIdNeverMapsToTwoReceipts(
        address secondPayer,
        bytes32 fuzzPaymentId,
        uint96 secondAmount
    ) public {
        vm.assume(secondPayer != address(0));
        vm.assume(fuzzPaymentId != bytes32(0));
        uint256 amount = _nonzero(secondAmount);

        vm.prank(minter);
        nft.mintReceipt(payer, creator, paymentToken, 1, 1, paymentTxHash, fuzzPaymentId, 1, uri);

        vm.prank(minter);
        vm.expectRevert(
            abi.encodeWithSelector(
                IXpesaSupporterReceiptNFT.DuplicatePayment.selector, fuzzPaymentId
            )
        );
        nft.mintReceipt(
            secondPayer,
            creator,
            paymentToken,
            amount,
            2,
            keccak256(abi.encode(secondPayer, amount)),
            fuzzPaymentId,
            2,
            "ipfs://duplicate"
        );

        assertEq(nft.totalMinted(), 1);
    }

    function testFuzzOnlyAuthorizedAccountsIncreaseSupply(address caller) public {
        vm.assume(caller != minter);
        bytes32 minterRole = nft.MINTER_ROLE();

        vm.prank(caller);
        vm.expectRevert(_missingRole(caller, minterRole));
        nft.mintReceipt(payer, creator, paymentToken, 1, 1, paymentTxHash, paymentId, 1, uri);

        assertEq(nft.totalMinted(), 0);
    }

    function _nonzero(uint96 value) private pure returns (uint256) {
        return value == 0 ? 1 : uint256(value);
    }
}
