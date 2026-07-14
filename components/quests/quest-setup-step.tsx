"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

import { QuestBuilderSettings } from "@/components/quests/quest-builder-settings"
import { QuestContentSummary } from "@/components/quests/quest-content-summary"
import {
  QuestNftRewardCard,
  type QuestNftDraft,
} from "@/components/quests/quest-nft-reward-card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  useQuestNftCampaign,
  useSaveQuestNftCampaign,
  type QuestNftCampaign,
} from "@/hooks/use-quest-nft"
import { useUpdateQuest, type CreatorQuestDetail } from "@/hooks/use-quests"

export function QuestSetupStep({ quest }: { quest: CreatorQuestDetail }) {
  const campaign = useQuestNftCampaign(quest.id)
  if (campaign.isLoading) {
    return (
      <div className="rounded-2xl border bg-background p-4 text-sm">
        Loading setup...
      </div>
    )
  }
  return (
    <QuestSetupStepForm
      quest={quest}
      existing={campaign.data?.campaign ?? null}
    />
  )
}

function QuestSetupStepForm({
  quest,
  existing,
}: {
  quest: CreatorQuestDetail
  existing: QuestNftCampaign | null
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const update = useUpdateQuest(quest.id)
  const saveCampaign = useSaveQuestNftCampaign(quest.id)
  const [title, setTitle] = useState(quest.title)
  const [description, setDescription] = useState(quest.description ?? "")
  const [rewardMode, setRewardMode] = useState(quest.reward_mode)
  const [maxAttempts, setMaxAttempts] = useState(
    String(quest.max_attempts ?? 1)
  )
  const [leaderboardVisible, setLeaderboardVisible] = useState(
    quest.leaderboard_visible ?? true
  )
  const [nftDraft, setNftDraft] = useState<QuestNftDraft>({
    enabled: existing?.enabled ?? false,
    name: existing?.name ?? `${quest.title} Completion Badge`,
    description:
      existing?.description ??
      "Awarded for completing this XPesa creator quest.",
    imageUrl: existing?.image_url ?? "",
    imageR2Key: existing?.image_r2_key ?? "",
  })

  async function saveAndNext() {
    try {
      if (nftDraft.enabled && !nftDraft.imageUrl) {
        toast.error("Upload NFT artwork before enabling the completion badge")
        return
      }
      await update.mutateAsync({
        title,
        description,
        rewardMode,
        maxAttempts: Number(maxAttempts),
        leaderboardVisible,
        status: quest.status === "active" ? "active" : "draft",
      })
      await saveCampaign.mutateAsync({
        enabled: nftDraft.enabled,
        name: nftDraft.name,
        description: nftDraft.description,
        imageUrl: nftDraft.imageUrl || null,
        imageR2Key: nftDraft.imageR2Key || null,
      })
      const params = new URLSearchParams(searchParams.toString())
      params.set("step", "questions")
      router.push(`/dashboard/quests/create?${params.toString()}`)
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save setup"
      )
    }
  }

  return (
    <div className="space-y-5">
      <QuestContentSummary link={quest.link} />
      <QuestBuilderSettings
        title={title}
        description={description}
        rewardMode={rewardMode}
        maxAttempts={maxAttempts}
        leaderboardVisible={leaderboardVisible}
        onTitleChange={setTitle}
        onDescriptionChange={setDescription}
        onRewardModeChange={setRewardMode}
        onMaxAttemptsChange={setMaxAttempts}
        onLeaderboardVisibleChange={setLeaderboardVisible}
      />
      <QuestNftRewardCard
        questId={quest.id}
        value={nftDraft}
        onChange={setNftDraft}
      />
      <div className="flex items-center justify-between rounded-2xl border bg-background p-4">
        <div>
          <p className="font-medium">Leaderboard visibility</p>
          <p className="text-sm text-muted-foreground">
            Show scores after users submit.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {leaderboardVisible ? "Visible" : "Hidden"}
          </span>
          <Switch
            checked={leaderboardVisible}
            onCheckedChange={setLeaderboardVisible}
          />
        </div>
      </div>
      <div className="flex justify-end">
        <Button
          onClick={saveAndNext}
          disabled={update.isPending || saveCampaign.isPending}
        >
          {update.isPending || saveCampaign.isPending
            ? "Saving..."
            : "Next: Add questions"}
        </Button>
      </div>
    </div>
  )
}
