import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

describe("mapKotaniOfframpStatus", () => {
  it("maps provider statuses to withdrawal outcomes", async () => {
    const { mapKotaniOfframpStatus } = await import("@/lib/payments/kotani-offramp")
    expect(mapKotaniOfframpStatus("SUCCESS")).toBe("paid")
    expect(mapKotaniOfframpStatus("COMPLETED")).toBe("paid")
    expect(mapKotaniOfframpStatus("REFUNDED")).toBe("refunded")
    expect(mapKotaniOfframpStatus("FAILED")).toBe("failed")
    expect(mapKotaniOfframpStatus("REFUND_FAILED")).toBe("failed")
    expect(mapKotaniOfframpStatus("PENDING")).toBe("provider_processing")
    expect(mapKotaniOfframpStatus(null)).toBe("provider_processing")
  })
})

describe("requestKotaniOfframp", () => {
  beforeEach(() => {
    vi.stubEnv("KOTANI_ENV", "sandbox")
    vi.stubEnv(
      "KOTANI_SANDBOX_BASE_URL",
      "https://sandbox-api.kotanipay.io/api/v3"
    )
    vi.stubEnv("KOTANI_OFFRAMP_ENDPOINT", "/offramp")
    vi.stubEnv("KOTANI_KEY", "test-key")
    vi.resetModules()
  })
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.restoreAllMocks()
  })

  it("posts the correct offramp payload and returns the deposit address", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        data: { depositAddress: "0xDep0000000000000000000000000000000000", referenceId: "ref-1" },
      }),
    } as unknown as Response)

    const { requestKotaniOfframp } = await import("@/lib/payments/kotani-offramp")
    const res = await requestKotaniOfframp({
      referenceId: "ref-1",
      amountUsdc: 10,
      fiatCurrency: "KES",
      mpesaNumber: "0712345678",
      accountName: "Amina",
      network: "mpesa",
    })

    expect(res.depositAddress).toBe("0xDep0000000000000000000000000000000000")
    expect(res.providerReference).toBe("ref-1")

    const [url, init] = fetchMock.mock.calls[0]
    expect(String(url)).toContain("/offramp")
    const body = JSON.parse((init as RequestInit).body as string)
    expect(body).toMatchObject({
      chain: "AVALANCHE",
      token: "USDC",
      currency: "KES",
      cryptoAmount: 10,
      referenceId: "ref-1",
    })
    expect(body.mobileMoneyReceiver).toMatchObject({
      phoneNumber: "0712345678",
      accountName: "Amina",
      networkProvider: "MPESA",
    })
  })

  it("throws when Kotani returns no deposit address", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({ data: {} }),
    } as unknown as Response)
    const { requestKotaniOfframp } = await import("@/lib/payments/kotani-offramp")
    await expect(
      requestKotaniOfframp({
        referenceId: "r",
        amountUsdc: 1,
        fiatCurrency: "KES",
        mpesaNumber: "0712345678",
        accountName: "A",
        network: "mpesa",
      })
    ).rejects.toThrow(/deposit address/i)
  })
})
