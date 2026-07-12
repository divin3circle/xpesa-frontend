# Architecture

`XpesaSupporterReceiptNFT` is a receipt and loyalty primitive, not a payment processor.

## Boundaries

The backend is responsible for payment verification. It checks the original Avalanche payment transaction and confirms the payer, creator, token, amount, and Xpesa payment intent before minting.

The contract is responsible for:

- authorized minting;
- one receipt per `paymentId`;
- permanent receipt facts;
- non-transferable ownership;
- immutable token URI;
- emergency mint pause.

## Data Model

Each receipt stores:

- `payer`;
- `creator`;
- `paymentToken`;
- raw `amount`;
- historical `points`;
- `paymentTxHash`;
- canonical `paymentId`;
- `paidAt`.

Metadata is presentation only. The on-chain receipt fields are the authoritative integrity data.

## Privacy

No phone numbers, emails, M-Pesa identifiers, private creator account references, or internal database IDs are stored on-chain.
