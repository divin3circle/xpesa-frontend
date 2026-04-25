import { TokenOverviewSession } from "@/components/viewer/token-overview-session"

export default function ViewTokenOverviewPage({
  params,
}: {
  params: { tokenId: string }
}) {
  const { tokenId } = params

  return <TokenOverviewSession tokenId={tokenId} />
}
