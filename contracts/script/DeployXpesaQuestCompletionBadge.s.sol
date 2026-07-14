// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { Script } from "forge-std/Script.sol";
import { XpesaQuestCompletionBadgeNFT } from "../src/XpesaQuestCompletionBadgeNFT.sol";

contract DeployXpesaQuestCompletionBadge is Script {
    function run() external returns (XpesaQuestCompletionBadgeNFT badgeNft) {
        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address admin = vm.envAddress("ADMIN_ADDRESS");
        address minter = vm.envAddress("MINTER_ADDRESS");

        vm.startBroadcast(deployerKey);
        badgeNft = new XpesaQuestCompletionBadgeNFT(admin, minter);
        vm.stopBroadcast();

        _writeDeploymentArtifact(badgeNft, admin, minter);
    }

    function _writeDeploymentArtifact(
        XpesaQuestCompletionBadgeNFT badgeNft,
        address admin,
        address minter
    ) private {
        string memory object = "deployment";
        vm.serializeString(object, "network", _networkName());
        vm.serializeUint(object, "chainId", block.chainid);
        vm.serializeString(object, "contract", "XpesaQuestCompletionBadgeNFT");
        vm.serializeAddress(object, "address", address(badgeNft));
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
        if (block.chainid == 43113) return "./deployments/fuji-quest-badge.json";
        if (block.chainid == 43114) return "./deployments/avalanche-quest-badge.json";
        return "./deployments/local-quest-badge.json";
    }

    function _networkName() private view returns (string memory) {
        if (block.chainid == 43113) return "avalanche-fuji";
        if (block.chainid == 43114) return "avalanche-c-chain";
        return "local";
    }
}
