// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { Script } from "forge-std/Script.sol";
import { XpesaSupporterReceiptNFT } from "../src/XpesaSupporterReceiptNFT.sol";

contract ConfigureXpesaSupporterReceipt is Script {
    function run() external {
        uint256 adminKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        XpesaSupporterReceiptNFT receiptNft =
            XpesaSupporterReceiptNFT(vm.envAddress("RECEIPT_CONTRACT_ADDRESS"));

        address extraMinter = vm.envOr("EXTRA_MINTER_ADDRESS", address(0));
        address extraPauser = vm.envOr("EXTRA_PAUSER_ADDRESS", address(0));
        address approvedToken = vm.envOr("APPROVED_PAYMENT_TOKEN", address(0));
        bool shouldApproveToken = vm.envOr("APPROVE_PAYMENT_TOKEN", false);

        vm.startBroadcast(adminKey);
        if (extraMinter != address(0)) {
            receiptNft.grantRole(receiptNft.MINTER_ROLE(), extraMinter);
        }
        if (extraPauser != address(0)) {
            receiptNft.grantRole(receiptNft.PAUSER_ROLE(), extraPauser);
        }
        if (approvedToken != address(0)) {
            receiptNft.setPaymentTokenApproval(approvedToken, shouldApproveToken);
        }
        vm.stopBroadcast();
    }
}
