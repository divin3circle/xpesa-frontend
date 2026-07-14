"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import { FanWalletConnectModal } from "@/components/fan-wallet-connect-modal"
import { useFanWalletContext } from "@/components/fan-wallet-context"
import { QuestNftClaimAction } from "@/components/quests/quest-nft-claim-action"
import { QuestNftClaimShell } from "@/components/quests/quest-nft-claim-shell"
import { Button } from "@/components/ui/button"
import { useClaimQuestNft, useQuestNftClaim } from "@/hooks/use-quest-nft"

export function QuestNftClaimPanel({
  questId,
  attemptId,
}: {
  questId: string
  attemptId: string
}) {
  const [showConnect, setShowConnect] = useState(false)
  const { fanSmartAccountAddress } = useFanWalletContext()
  const claimQuery = useQuestNftClaim(questId, attemptId)
  const claim = useClaimQuestNft(questId, attemptId)
  const campaign = claimQuery.data?.campaign
  const existingClaim = claimQuery.data?.claim
  const minted = existingClaim?.status === "minted"
  const ready = campaign?.enabled && campaign.status === "ready"

  async function claimNft() {
    if (!fanSmartAccountAddress) {
      setShowConnect(true)
      return
    }
    try {
      await claim.mutateAsync(fanSmartAccountAddress)
      toast.success("Quest NFT claimed")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not claim NFT")
    }
  }

  if (claimQuery.isLoading) {
    return (
      <QuestNftClaimShell title="Checking NFT reward" copy="Looking for a completion badge.">
        <Loader2 className="size-4 animate-spin text-muted-foreground" />
      </QuestNftClaimShell>
    )
  }

  if (claimQuery.isError) {
    return (
      <QuestNftClaimShell title="NFT reward unavailable" copy="We could not load the claim state.">
        <Button variant="outline" size="sm" onClick={() => claimQuery.refetch()}>
          Retry
        </Button>
      </QuestNftClaimShell>
    )
  }

  if (!ready) {
    return (
      <QuestNftClaimShell
        title="No NFT reward is ready"
        copy="This quest does not have an enabled and saved completion NFT yet."
      />
    )
  }

  return (
    <>
      <FanWalletConnectModal
        isOpen={showConnect}
        onCloseAction={() => setShowConnect(false)}
      />
      <QuestNftClaimShell
        title={campaign.name}
        copy={minted ? "Your completion NFT has been minted." : "Claim your on-chain badge."}
      >
        <QuestNftClaimAction
          minted={minted}
          mintTxHash={existingClaim?.mint_tx_hash}
          connected={Boolean(fanSmartAccountAddress)}
          disabled={claim.isPending || existingClaim?.status === "minting"}
          onClaim={claimNft}
          onConnect={() => setShowConnect(true)}
        />
      </QuestNftClaimShell>
    </>
  )
}
