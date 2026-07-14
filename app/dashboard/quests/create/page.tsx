"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"

import { QuestQuestionsStep } from "@/components/quests/quest-questions-step"
import { QuestSetupStep } from "@/components/quests/quest-setup-step"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useQuestDetail } from "@/hooks/use-quests"
import { Card } from "@/components/ui/card"
import Image from "next/image"

export default function QuestCreatePage() {
  const searchParams = useSearchParams()
  const questId = searchParams.get("questId")
  const step = searchParams.get("step") === "questions" ? "questions" : "setup"
  const { data, isLoading, error } = useQuestDetail(questId)

  if (!questId) {
    return (
      <main className="space-y-4 p-6 lg:p-8">
        <h1 className="font-heading text-3xl font-semibold">Quest builder</h1>
        <p className="text-sm text-muted-foreground">
          Start from the quests page by choosing approved content.
        </p>
        <Button asChild variant="outline">
          <Link href="/dashboard/quests">Back to quests</Link>
        </Button>
      </main>
    )
  }

  return (
    <main className="space-y-6 p-2 lg:p-8">
      {step !== "questions" && (
        <Card className="relative min-h-105 overflow-hidden rounded-2xl border-border/70">
          <div className="absolute inset-0">
            <Image
              src="/quest.png"
              alt={"Quest banner"}
              fill
              className="object-cover"
              priority
            />
          </div>
          <div className="absolute inset-0 bg-linear-to-t from-background via-background/5 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6">
            <div className="rounded-3xl border border-border/60 bg-background/45 p-4 backdrop-blur-xl sm:p-5">
              <div className="space-y-2">
                <h2 className="line-clamp-2 text-2xl font-semibold tracking-tight">
                  Quest Builder
                </h2>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  Add a short challenge users can complete after unlocking this
                  content.
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {isLoading && <Skeleton className="h-80 rounded-2xl" />}
      {error && (
        <p className="text-sm text-destructive">Could not load quest.</p>
      )}
      {data && step === "setup" && <QuestSetupStep quest={data.quest} />}
      {data && step === "questions" && (
        <QuestQuestionsStep questId={questId} initial={data} />
      )}
    </main>
  )
}
