// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";
import { Test } from "forge-std/Test.sol";
import { XpesaSupporterReceiptNFT } from "../src/XpesaSupporterReceiptNFT.sol";

abstract contract ReceiptTestBase is Test {
    XpesaSupporterReceiptNFT internal nft;

    address internal admin = address(0xA11CE);
    address internal minter = address(0xB0B);
    address internal payer = address(0xCAFE);
    address internal creator = address(0xC0FFEE);
    address internal paymentToken = address(0x1234);

    bytes32 internal paymentId = keccak256("xpesa-payment-1");
    bytes32 internal paymentTxHash = keccak256("avalanche-payment-tx");
    string internal uri = "ipfs://receipt-1";

    function setUp() public virtual {
        nft = new XpesaSupporterReceiptNFT(
            "Xpesa Supporter Receipt", "XPSR", admin, minter, paymentToken, true
        );
    }

    function _mintDefault() internal returns (uint256) {
        vm.prank(minter);
        return nft.mintReceipt(
            payer,
            creator,
            paymentToken,
            10_000_000,
            100,
            paymentTxHash,
            paymentId,
            1_720_000_000,
            uri
        );
    }

    function _missingRole(address account, bytes32 role) internal pure returns (bytes memory) {
        return abi.encodeWithSelector(
            IAccessControl.AccessControlUnauthorizedAccount.selector, account, role
        );
    }
}
