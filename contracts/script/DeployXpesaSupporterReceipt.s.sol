// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { Script } from "forge-std/Script.sol";
import { XpesaSupporterReceiptNFT } from "../src/XpesaSupporterReceiptNFT.sol";

contract DeployXpesaSupporterReceipt is Script {
    string internal constant NAME = "Xpesa Supporter Receipt";
    string internal constant SYMBOL = "XPSR";

    function run() external returns (XpesaSupporterReceiptNFT receiptNft) {
        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address admin = vm.envAddress("ADMIN_ADDRESS");
        address minter = vm.envAddress("MINTER_ADDRESS");
        address approvedToken = vm.envOr("APPROVED_PAYMENT_TOKEN", address(0));
        bool enableAllowlist = vm.envOr("PAYMENT_TOKEN_ALLOWLIST_ENABLED", true);

        vm.startBroadcast(deployerKey);
        receiptNft = new XpesaSupporterReceiptNFT(
            NAME, SYMBOL, admin, minter, approvedToken, enableAllowlist
        );
        vm.stopBroadcast();

        _writeDeploymentArtifact(receiptNft, admin, minter);
    }

    function _writeDeploymentArtifact(
        XpesaSupporterReceiptNFT receiptNft,
        address admin,
        address minter
    ) private {
        string memory object = "deployment";
        vm.serializeString(object, "network", _networkName());
        vm.serializeUint(object, "chainId", block.chainid);
        vm.serializeString(object, "contract", "XpesaSupporterReceiptNFT");
        vm.serializeAddress(object, "address", address(receiptNft));
        vm.serializeAddress(object, "deployer", vm.addr(vm.envUint("DEPLOYER_PRIVATE_KEY")));
        vm.serializeAddress(object, "admin", admin);
        vm.serializeAddress(object, "minter", minter);
        vm.serializeString(object, "transactionHash", "see broadcast artifact");
        vm.serializeUint(object, "blockNumber", block.number);
        vm.serializeUint(object, "deployedAt", block.timestamp);
        vm.serializeString(object, "compilerVersion", "0.8.24");
        string memory json = vm.serializeString(object, "openzeppelinVersion", "v5.4.0");

        vm.writeJson(json, _artifactPath());
    }

    function _artifactPath() private view returns (string memory) {
        if (block.chainid == 43113) return "./deployments/fuji.json";
        if (block.chainid == 43114) return "./deployments/avalanche.json";
        return "./deployments/local.json";
    }

    function _networkName() private view returns (string memory) {
        if (block.chainid == 43113) return "avalanche-fuji";
        if (block.chainid == 43114) return "avalanche-c-chain";
        return "local";
    }
}
