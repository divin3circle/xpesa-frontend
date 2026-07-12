# Deployment

## Local

```bash
cd contracts
cp .env.example .env
forge build
forge test
```

## Fuji

Fill:

```text
FUJI_RPC_URL=
DEPLOYER_PRIVATE_KEY=
ADMIN_ADDRESS=
MINTER_ADDRESS=
APPROVED_PAYMENT_TOKEN=
PAYMENT_TOKEN_ALLOWLIST_ENABLED=true
```

Deploy:

```bash
forge script script/DeployXpesaSupporterReceipt.s.sol --rpc-url fuji --broadcast
```

After deployment:

1. verify source on the Avalanche explorer;
2. update `deployments/fuji.json`;
3. grant or revoke roles if needed;
4. mint one test receipt;
5. verify duplicate `paymentId` rejection;
6. verify transfer rejection.

## Mainnet

Deploy to Avalanche C-Chain mainnet only after Fuji, metadata, backend verification, and role custody are reviewed.
