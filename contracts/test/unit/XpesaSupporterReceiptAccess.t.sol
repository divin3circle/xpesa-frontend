// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { Pausable } from "@openzeppelin/contracts/utils/Pausable.sol";
import { ReceiptTestBase } from "../ReceiptTestBase.sol";

contract XpesaSupporterReceiptAccessTest is ReceiptTestBase {
    function testDeploymentConfiguresIdentityAndRoles() public view {
        assertEq(nft.name(), "Xpesa Supporter Receipt");
        assertEq(nft.symbol(), "XPSR");
        assertTrue(nft.hasRole(nft.DEFAULT_ADMIN_ROLE(), admin));
        assertTrue(nft.hasRole(nft.MINTER_ROLE(), minter));
        assertTrue(nft.hasRole(nft.PAUSER_ROLE(), admin));
        assertTrue(nft.paymentTokenAllowlistEnabled());
        assertTrue(nft.isPaymentTokenApproved(paymentToken));
    }

    function testRandomUserCannotMint() public {
        vm.expectRevert(_missingRole(address(this), nft.MINTER_ROLE()));
        nft.mintReceipt(payer, creator, paymentToken, 1, 1, paymentTxHash, paymentId, 1, uri);
    }

    function testRevokedMinterCannotMint() public {
        bytes32 minterRole = nft.MINTER_ROLE();

        vm.prank(admin);
        nft.revokeRole(minterRole, minter);

        vm.prank(minter);
        vm.expectRevert(_missingRole(minter, minterRole));
        nft.mintReceipt(payer, creator, paymentToken, 1, 1, paymentTxHash, paymentId, 1, uri);
    }

    function testPauseBlocksMintAndUnpauseRestoresMinting() public {
        vm.prank(admin);
        nft.pause();

        vm.prank(minter);
        vm.expectRevert(Pausable.EnforcedPause.selector);
        nft.mintReceipt(payer, creator, paymentToken, 1, 1, paymentTxHash, paymentId, 1, uri);

        vm.prank(admin);
        nft.unpause();

        _mintDefault();
        assertEq(nft.totalMinted(), 1);
    }

    function testUnauthorizedUserCannotPause() public {
        vm.expectRevert(_missingRole(address(this), nft.PAUSER_ROLE()));
        nft.pause();
    }
}
