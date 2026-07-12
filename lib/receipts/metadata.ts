import type { ReceiptMetadataInput } from "./types"
import { envConfig } from "@/lib/env"

export function buildReceiptMetadata(input: ReceiptMetadataInput) {
  const shortId = input.paymentId.slice(2, 10).toUpperCase()

  return {
    name: `Xpesa Supporter Receipt #${shortId}`,
    description: "An on-chain proof of support issued by Xpesa Creators.",
    image: input.imageUri,
    external_url: `${envConfig.APP_URL}/pay/${input.linkId}`,
    attributes: [
      { trait_type: "Creator", value: input.creatorName },
      { trait_type: "Amount", value: `${input.amountUsdc.toFixed(2)} USDC` },
      { trait_type: "Points", value: input.points },
      { trait_type: "Network", value: input.networkName },
      { trait_type: "Receipt Type", value: "Supporter Receipt" },
    ],
  }
}
