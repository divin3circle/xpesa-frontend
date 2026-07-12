# Security

## Unauthorized Minting

Mitigation: only `MINTER_ROLE` can call `mintReceipt`.

## Fake Payment Claims

Mitigation: the frontend never mints directly. Backend verification checks the payment before an authorized minter submits the mint transaction.

## Replayed Payment

Mitigation: `paymentId` is the canonical replay-protection key and can map to only one token ID.

## Compromised Minter

Mitigation: `PAUSER_ROLE` can stop new minting, and `DEFAULT_ADMIN_ROLE` can revoke the minter. Production admin should be a multisig or similarly protected account.

## Metadata Substitution

Mitigation: token URI is set at mint and there is no public update function. Generate and upload final metadata before minting.

## Privacy

Do not put email, phone number, M-Pesa number, or internal database IDs into receipt fields or metadata unless the user explicitly accepts public disclosure.
