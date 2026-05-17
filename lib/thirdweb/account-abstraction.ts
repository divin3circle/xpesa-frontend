import { defineChain } from "thirdweb"
import { envConfig, isAvalanchePaymentChain } from "../env"

const hederaMainnet = defineChain(295)
const hederaTestnet = defineChain(296)
const avalancheMainnet = defineChain(43114)
const avalancheFuji = defineChain(43113)

function resolveDefaultChain() {
  if (isAvalanchePaymentChain()) {
    return envConfig.ENV === "DEV" ? avalancheFuji : avalancheMainnet
  }

  return envConfig.ENV === "DEV" ? hederaTestnet : hederaMainnet
}

export const defaultChain = resolveDefaultChain()

export const smartAccountConfig = {
  chain: defaultChain,
  sponsorGas: true,
}
