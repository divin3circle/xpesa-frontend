"use client"

import { motion, useReducedMotion } from "framer-motion"
import { Trophy } from "lucide-react"

import type { LeaderboardEntry } from "@/lib/quests/types"

type Props = {
  title?: string
  entries: LeaderboardEntry[]
}

function shortWallet(value: string) {
  if (!value) return "Not connected"
  return value.length > 14 ? `${value.slice(0, 6)}...${value.slice(-4)}` : value
}

function accuracy(entry: LeaderboardEntry) {
  if (!entry.max_score) return "0%"
  return `${Math.round((entry.score / entry.max_score) * 100)}%`
}

function submittedAt(value: string) {
  if (!value) return "Not submitted"
  return new Date(value).toLocaleString()
}

export function QuestLeaderboardTable({
  title = "Leaderboard",
  entries,
}: Props) {
  const reduceMotion = useReducedMotion()

  if (!entries.length) {
    return (
      <div className="rounded-2xl border bg-background p-8 text-center text-sm text-muted-foreground">
        No submitted results yet.
      </div>
    )
  }

  return (
    <div className="w-full overflow-hidden rounded-2xl border bg-background">
      <div className="hidden overflow-x-auto md:block">
        <div className="min-w-[900px]">
          <div className="grid grid-cols-[90px_260px_120px_120px_180px_1fr] gap-2 border-b bg-muted/15 px-8 py-3 text-xs font-medium tracking-wide text-muted-foreground/80 uppercase">
            <div>Rank</div>
            <div>{title}</div>
            <div>Score</div>
            <div>Accuracy</div>
            <div>Submitted</div>
            <div>Wallet</div>
          </div>
          <motion.div initial="hidden" animate="visible">
            {entries.map((entry, index) => (
              <motion.div
                key={`${entry.rank}-${entry.wallet_address}`}
                initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.035 }}
                className={`grid grid-cols-[90px_260px_120px_120px_180px_1fr] gap-2 border-b px-8 py-4 text-sm last:border-b-0 ${entry.rank === 1 ? "bg-foreground/5" : "hover:bg-muted/20"}`}
              >
                <div className="flex items-center gap-2 font-semibold">
                  {entry.rank === 1 && <Trophy className="size-4" />}#
                  {entry.rank}
                </div>
                <div className="font-medium">{entry.display_name}</div>
                <div>
                  {entry.score}/{entry.max_score}
                </div>
                <div>{accuracy(entry)}</div>
                <div className="text-muted-foreground">
                  {submittedAt(entry.submitted_at)}
                </div>
                <div className="font-mono text-xs text-muted-foreground">
                  {shortWallet(entry.wallet_address)}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="divide-y md:hidden">
        {entries.map((entry) => (
          <div
            key={`${entry.rank}-${entry.wallet_address}`}
            className="space-y-3 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 font-semibold">
                {entry.rank === 1 && <Trophy className="size-4" />}#{entry.rank}{" "}
                {entry.display_name}
              </div>
              <span className="rounded-2xl border bg-foreground/5 px-2 py-1 text-xs">
                {entry.score}/{entry.max_score}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <span>Accuracy: {accuracy(entry)}</span>
              <span className="text-right font-mono">
                {shortWallet(entry.wallet_address)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
