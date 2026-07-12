# Xpesa Supporter Receipt NFT

Foundry project for `XpesaSupporterReceiptNFT`, an Avalanche ERC-721 receipt contract.

The contract does not process USDC, escrow funds, or verify arbitrary payments on-chain. Xpesa backend verifies a successful payment first, prepares final metadata, then an authorized `MINTER_ROLE` account mints exactly one non-transferable receipt NFT to the payer.

## Commands

```bash
forge build
forge test
forge fmt
forge script script/DeployXpesaSupporterReceipt.s.sol --rpc-url fuji --broadcast
```

## Design

- ERC-721 name: `Xpesa Supporter Receipt`
- ERC-721 symbol: `XPSR`
- Solidity compiler: `0.8.24`
- OpenZeppelin Contracts: `v5.4.0`
- Forge Std: `v1.9.7`
- Canonical uniqueness key: `bytes32 paymentId`
- Payment evidence field: `bytes32 paymentTxHash`
- Transfers and approvals: disabled after mint
- Token URI: set once at mint and not updateable
- Minting: restricted to `MINTER_ROLE`
- Emergency pause: blocks new minting only

See `docs/ARCHITECTURE.md`, `docs/CONTRACT_SPEC.md`, `docs/SECURITY.md`, and `docs/BACKEND_INTEGRATION.md` for the full contract and backend boundary.

## Backend Flow

1. Xpesa confirms the payment through the existing smart-account/payment system.
2. Backend verifies token, amount, creator recipient, payer, transaction success, and intent ownership.
3. User opts into minting the receipt.
4. Backend generates the branded receipt image and metadata, using Xpesa brand assets from `/Users/sylusabel/Documents/Xpesa Brand Assets`.
5. Backend uploads image and metadata to permanent storage such as IPFS.
6. Backend signer with `MINTER_ROLE` calls `mintReceipt`.

## Deployment

Copy `.env.example` to `.env` locally and fill values. Never commit `.env`.

Fuji chain ID is `43113`; Avalanche C-Chain mainnet chain ID is `43114`.

Deployment artifacts belong in `deployments/fuji.json` and `deployments/avalanche.json` after real deployments.
