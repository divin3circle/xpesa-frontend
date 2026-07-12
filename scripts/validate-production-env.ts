import { getMissingProductionEnvKeys } from "../lib/env-validation"

const missing = getMissingProductionEnvKeys()

if (missing.length > 0) {
  console.error(`Missing production env vars:\n${missing.join("\n")}`)
  process.exit(1)
}

console.log("Production env check passed")
