import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

const transferWithAuthorization = vi.fn()

vi.mock("ethers", () => ({
  ethers: {
    JsonRpcProvider: vi.fn(),
    Wallet: vi.fn(),
    Contract: vi.fn(function () {
      return { transferWithAuthorization }
    }),
  },
}))
vi.mock("@/lib/thirdweb/chains", () => ({
  USDC_CONTRACT_ADDRESS: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
}))

describe("relayTransferWithAuthorization", () => {
  beforeEach(() => {
    vi.stubEnv("PLATFORM_WALLET_PRIVATE_KEY", "0x" + "1".repeat(64))
    vi.resetModules()
    transferWithAuthorization.mockReset()
  })
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it("broadcasts the signed authorization and returns the tx hash", async () => {
    transferWithAuthorization.mockResolvedValue({
      hash: "0xtxhash",
      wait: async () => ({}),
    })
    const { relayTransferWithAuthorization } = await import("@/lib/payments/relayer")
    const authorization = {
      from: "0xFrom",
      to: "0xEsc",
      value: "10000000",
      validAfter: 0,
      validBefore: 9999999999,
      nonce: "0x" + "ab".repeat(32),
    }
    const res = await relayTransferWithAuthorization({ authorization, signature: "0xsig" })
    expect(res.txHash).toBe("0xtxhash")
    expect(transferWithAuthorization).toHaveBeenCalledWith(
      "0xFrom",
      "0xEsc",
      "10000000",
      0,
      9999999999,
      "0x" + "ab".repeat(32),
      "0xsig"
    )
  })
})
