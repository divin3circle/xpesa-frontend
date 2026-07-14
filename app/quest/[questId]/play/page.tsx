"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

import { QuestPlayStage } from "@/components/quests/quest-play-stage"
import { questJson, postQuestJson } from "@/lib/quests/client"
import type {
  QuestAnswer,
  QuestQuestion,
  ScoreResult,
} from "@/lib/quests/types"

type PlayQuest = {
  id: string
  title: string
  description: string | null
  max_attempts: number
  questions: QuestQuestion[]
}

type PlayQuestResponse = {
  quest: Omit<PlayQuest, "questions">
  questions: QuestQuestion[]
}

export default function QuestPlayPage() {
  const params = useParams<{ questId: string }>()
  const searchParams = useSearchParams()
  const router = useRouter()
  const questId = params.questId
  const attemptId = searchParams.get("attemptId")
  const storageKey = `xpesa:quest-draft:${questId}:${attemptId}`
  const [quest, setQuest] = useState<PlayQuest | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [current, setCurrent] = useState(0)
  const [score, setScore] = useState<ScoreResult | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!attemptId) return
    questJson<PlayQuestResponse>(
      `/api/quests/${questId}/play?attemptId=${attemptId}`
    )
      .then((result) => {
        setQuest({
          ...result.quest,
          questions: Array.isArray(result.questions) ? result.questions : [],
        })
      })
      .catch((error) =>
        toast.error(error instanceof Error ? error.message : "Quest failed")
      )
  }, [attemptId, questId])

  useEffect(() => {
    const cached = window.localStorage.getItem(storageKey)
    if (!cached) return
    try {
      const parsed = JSON.parse(cached) as {
        answers?: Record<string, string>
        current?: number
      }
      setAnswers(parsed.answers ?? {})
      setCurrent(parsed.current ?? 0)
    } catch {
      window.localStorage.removeItem(storageKey)
    }
  }, [storageKey])

  useEffect(() => {
    if (!attemptId || submitted) return
    window.localStorage.setItem(
      storageKey,
      JSON.stringify({ answers, current })
    )
  }, [answers, attemptId, current, storageKey, submitted])

  useEffect(() => {
    function warn(event: BeforeUnloadEvent) {
      if (submitted) return
      event.preventDefault()
      event.returnValue = ""
    }
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [submitted])

  const questions = Array.isArray(quest?.questions) ? quest.questions : []
  const question = questions[current]
  const completed = useMemo(
    () =>
      Object.values(answers).filter((answer) => answer.trim().length > 0)
        .length,
    [answers]
  )
  const canScore = questions.length > 0 && completed >= questions.length
  const payloadAnswers: QuestAnswer[] = useMemo(
    () =>
      Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer,
      })),
    [answers]
  )

  async function getScore() {
    if (!attemptId || !quest) return
    if (!canScore) {
      toast.error("Answer every question before scoring")
      return
    }
    setBusy(true)
    try {
      const result = await postQuestJson<{ result: ScoreResult }>(
        `/api/quests/${questId}/score`,
        { attemptId, answers: payloadAnswers }
      )
      setScore(result.result)
      toast.success("Score ready")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not score quest"
      )
    } finally {
      setBusy(false)
    }
  }

  async function submitResult() {
    if (!attemptId) return
    setBusy(true)
    try {
      await postQuestJson(`/api/quests/${questId}/submit`, { attemptId })
      window.localStorage.removeItem(storageKey)
      setSubmitted(true)
      toast.success("Result submitted")
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not submit result"
      )
    } finally {
      setBusy(false)
    }
  }

  if (!attemptId) return <QuestMessage message="Missing quest attempt." />
  if (quest && questions.length === 0) {
    return <QuestMessage message="This quest does not have questions yet." />
  }
  if (!quest || !question) return <QuestMessage message="Loading quest..." />

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-foreground sm:p-8">
      <QuestPlayStage
        quest={quest}
        attemptId={attemptId}
        question={question}
        current={current}
        completed={completed}
        selectedAnswer={answers[question.id]}
        score={score}
        submitted={submitted}
        busy={busy}
        canScore={canScore}
        onAnswer={(answer) =>
          setAnswers((prev) => ({ ...prev, [question.id]: answer }))
        }
        onPrevious={() => setCurrent((value) => Math.max(value - 1, 0))}
        onNext={() =>
          setCurrent((value) => Math.min(value + 1, questions.length - 1))
        }
        onScore={getScore}
        onSubmit={submitResult}
        onBack={() => router.back()}
      />
    </main>
  )
}

function QuestMessage({ message }: { message: string }) {
  return (
    <main className="grid min-h-screen place-items-center bg-background text-sm text-foreground">
      {message}
    </main>
  )
}
