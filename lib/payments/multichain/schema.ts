import { z } from "zod"

export const multichainQuoteRequestSchema = z.object({
  linkId: z.string().uuid(),
  amountUsdc: z.coerce.number().finite().positive(),
  payerWalletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  sourceChainId: z.coerce.number().int().positive(),
  sourceTokenAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
})

export const multichainIntentRequestSchema =
  multichainQuoteRequestSchema.extend({
    originAmountWei: z.string().min(1),
    destinationAmountWei: z.string().min(1),
    route: z.unknown(),
  })

export const multichainStatusRequestSchema = z.object({
  intentId: z.string().uuid(),
  originTxHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
  originChainId: z.coerce.number().int().positive(),
  transactionId: z.string().optional(),
})

export const multichainSettleRequestSchema = z.object({
  intentId: z.string().uuid(),
})

export type MultichainQuoteRequest = z.infer<
  typeof multichainQuoteRequestSchema
>
