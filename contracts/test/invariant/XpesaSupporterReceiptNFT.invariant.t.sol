// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { Test } from "forge-std/Test.sol";
import { IXpesaSupporterReceiptNFT } from "../../src/IXpesaSupporterReceiptNFT.sol";
import { XpesaSupporterReceiptNFT } from "../../src/XpesaSupporterReceiptNFT.sol";

contract ReceiptInvariantHandler is Test {
    XpesaSupporterReceiptNFT public nft;
    address public minter;
    address public paymentToken;
    uint256 public successfulMints;

    mapping(uint256 tokenId => address payer) public expectedOwner;
    mapping(bytes32 paymentId => bool consumed) public consumedPaymentId;

    constructor(XpesaSupporterReceiptNFT receiptNft, address receiptMinter, address token) {
        nft = receiptNft;
        minter = receiptMinter;
        paymentToken = token;
    }

    function mint(address payer, address creator, uint96 amount, bytes32 seed) public {
        payer = _validAddress(payer, address(0xCAFE));
        creator = _validAddress(creator, address(0xC0FFEE));
        uint256 validAmount = amount == 0 ? 1 : uint256(amount);
        bytes32 paymentId = keccak256(abi.encode("payment", seed, successfulMints));
        bytes32 txHash = keccak256(abi.encode("tx", seed, payer, creator));

        vm.prank(minter);
        uint256 tokenId = nft.mintReceipt(
            payer,
            creator,
            paymentToken,
            validAmount,
            validAmount / 1e6,
            txHash,
            paymentId,
            1,
            "ipfs://invariant"
        );

        successfulMints++;
        expectedOwner[tokenId] = payer;
        consumedPaymentId[paymentId] = true;
    }

    function transfer(uint256 tokenId, address to) public {
        address owner = expectedOwner[tokenId];
        if (owner == address(0)) return;
        to = _validAddress(to, address(0xDAD));

        vm.prank(owner);
        vm.expectRevert(IXpesaSupporterReceiptNFT.SoulboundTransfer.selector);
        nft.transferFrom(owner, to, tokenId);
    }

    function _validAddress(address candidate, address fallbackAddress)
        private
        pure
        returns (address)
    {
        return candidate == address(0) ? fallbackAddress : candidate;
    }
}

contract XpesaSupporterReceiptNFTInvariantTest is Test {
    XpesaSupporterReceiptNFT internal nft;
    ReceiptInvariantHandler internal handler;

    address internal admin = address(0xA11CE);
    address internal minter = address(0xB0B);
    address internal paymentToken = address(0x1234);

    function setUp() public {
        nft = new XpesaSupporterReceiptNFT(
            "Xpesa Supporter Receipt", "XPSR", admin, minter, paymentToken, true
        );
        handler = new ReceiptInvariantHandler(nft, minter, paymentToken);
        targetContract(address(handler));
    }

    function invariantTotalMintedEqualsConsumedPaymentIds() public view {
        assertEq(nft.totalMinted(), handler.successfulMints());
    }

    function invariantMintedOwnershipDoesNotChange() public view {
        uint256 total = nft.totalMinted();
        for (uint256 tokenId = 1; tokenId <= total; tokenId++) {
            assertEq(nft.ownerOf(tokenId), handler.expectedOwner(tokenId));
        }
    }
}
