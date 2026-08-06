"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { RotateCcw, Trophy, Zap } from "lucide-react"

import { QuestNftClaimPanel } from "@/components/quests/quest-nft-claim-panel"
import { Button } from "@/components/ui/button"
import { SegmentedProgress } from "@/components/ui/segmented-progress"
import type { ScoreResult } from "@/lib/quests/types"

export function QuestCompletionPanel({
  questId,
  attemptId,
  score,
  onBack,
}: {
  questId: string
  attemptId: string
  score: ScoreResult | null
  onBack: () => void
}) {
  const totalQuestions = score?.explanations.length ?? 0
  const correct = score?.correctCount ?? 0
  const pct = totalQuestions > 0 ? (correct / totalQuestions) * 100 : 0
  const segments = Math.min(Math.max(totalQuestions, 1), 30)

  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.96, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.32, ease: "easeOut" }}
      className="mx-auto w-full max-w-xl p-2 text-card-foreground"
    >
      <div className="mb-6 grid place-items-center text-center">
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 220, damping: 14 }}
          className="mb-4 grid size-16 place-items-center rounded-full bg-primary/10 text-primary"
        >
          <Zap className="size-8" />
        </motion.div>
        <p className="text-xs tracking-[0.22em] text-muted-foreground uppercase">
          Quest complete
        </p>
        <motion.p
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-2 font-heading text-4xl font-semibold tracking-tight"
        >
          +{score ? score.score : 0} XP
        </motion.p>
        <p className="mt-2 text-sm text-muted-foreground">
          {score
            ? `You got ${correct} of ${totalQuestions} correct. You're on the leaderboard — take more quests to climb.`
            : "Your result has been submitted to the creator leaderboard."}
        </p>
      </div>

      {score ? (
        <SegmentedProgress value={pct} segments={segments} className="mb-6" />
      ) : null}

      <QuestNftClaimPanel questId={questId} attemptId={attemptId} />

      <div className="mt-4 space-y-3">
        <Button asChild variant="outline" className="w-full">
          <Link href={`/quest/${questId}/leaderboard`}>
            <Trophy className="size-4" />
            View leaderboard
          </Link>
        </Button>
        <Button variant="ghost" className="w-full" onClick={onBack}>
          <RotateCcw className="size-4" />
          Back to content
        </Button>
      </div>
    </motion.section>
  )
}
