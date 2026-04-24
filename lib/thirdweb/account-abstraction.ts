import { defineChain } from "thirdweb"
import { envConfig } from "../utils";

const hederaMainnet = defineChain(295);
const hederaTestnet = defineChain(296);

export const defaultChain = envConfig.ENV === "DEV" ? hederaTestnet : hederaMainnet

export const smartAccountConfig = {
  chain: envConfig.ENV === "DEV" ? hederaTestnet : hederaMainnet,
  sponsorGas: true
}
