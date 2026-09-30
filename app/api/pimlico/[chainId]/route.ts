// Server-side proxy to Pimlico's bundler + paymaster RPC.
//
// Keeps PIMLICO_API_KEY out of the client bundle: the browser (thirdweb account
// abstraction) talks to this route, and we forward the JSON-RPC body to Pimlico
// with the key attached here. Handles both bundler methods (eth_*) and the
// paymaster method (pm_sponsorUserOperation), which Pimlico serves at one URL.
//
// NOTE: this endpoint sponsors gas, so hiding the key does not by itself prevent
// abuse/drain — set a Pimlico SPONSORSHIP POLICY (restrict to the USDC contract
// + a spend cap) as the real guard.

const PIMLICO_API_KEY = process.env.PIMLICO_API_KEY

// Avalanche C-Chain mainnet + Fuji only.
const ALLOWED_CHAIN_IDS = new Set(["43114", "43113"])

export async function POST(
  request: Request,
  { params }: { params: Promise<{ chainId: string }> }
) {
  const { chainId } = await params

  if (!ALLOWED_CHAIN_IDS.has(chainId)) {
    return Response.json({ error: "Unsupported chain" }, { status: 400 })
  }
  if (!PIMLICO_API_KEY) {
    return Response.json(
      { error: "Paymaster is not configured" },
      { status: 503 }
    )
  }

  const rawBody = await request.text()
  const pimlicoUrl = `https://api.pimlico.io/v2/${chainId}/rpc?apikey=${PIMLICO_API_KEY}`

  // thirdweb fetches userOp gas fees via `thirdweb_getUserOperationGasPrice`, a
  // method only thirdweb's own bundler implements. Pimlico doesn't — so without
  // this translation the fees come back empty and the bundler rejects the userOp
  // with "maxPriorityFeePerGas must be at least ...". Translate that one call to
  // Pimlico's `pimlico_getUserOperationGasPrice` (slow/standard/fast tiers) and
  // return the shape thirdweb expects: { maxFeePerGas, maxPriorityFeePerGas }.
  let parsed: { id?: unknown; jsonrpc?: unknown; method?: string } | null = null
  try {
    parsed = JSON.parse(rawBody)
  } catch {
    parsed = null
  }

  const isGasPrice =
    parsed && parsed.method === "thirdweb_getUserOperationGasPrice"

  let upstream: Response
  try {
    upstream = await fetch(pimlicoUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: isGasPrice
        ? JSON.stringify({
            id: parsed!.id ?? 1,
            jsonrpc: parsed!.jsonrpc ?? "2.0",
            method: "pimlico_getUserOperationGasPrice",
            params: [],
          })
        : rawBody,
    })
  } catch {
    return Response.json({ error: "Paymaster upstream error" }, { status: 502 })
  }

  const text = await upstream.text()

  if (isGasPrice && upstream.ok) {
    try {
      const json = JSON.parse(text)
      // Use "fast" for headroom against price moves between quote and submit.
      const tier =
        json?.result?.fast ?? json?.result?.standard ?? json?.result?.slow
      if (tier?.maxFeePerGas && tier?.maxPriorityFeePerGas) {
        return Response.json({
          id: parsed!.id ?? 1,
          jsonrpc: parsed!.jsonrpc ?? "2.0",
          result: {
            maxFeePerGas: tier.maxFeePerGas,
            maxPriorityFeePerGas: tier.maxPriorityFeePerGas,
          },
        })
      }
    } catch {
      // fall through to raw passthrough below
    }
  }

  return new Response(text, {
    status: upstream.status,
    headers: { "Content-Type": "application/json" },
  })
}
