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

  const body = await request.text()

  let upstream: Response
  try {
    upstream = await fetch(
      `https://api.pimlico.io/v2/${chainId}/rpc?apikey=${PIMLICO_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      }
    )
  } catch {
    return Response.json({ error: "Paymaster upstream error" }, { status: 502 })
  }

  const text = await upstream.text()
  return new Response(text, {
    status: upstream.status,
    headers: { "Content-Type": "application/json" },
  })
}
