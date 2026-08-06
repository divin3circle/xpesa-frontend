"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
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
  const [reviewing, setReviewing] = useState(false)
  const [score, setScore] = useState<ScoreResult | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [busy, setBusy] = useState(false)

  const answersRef = useRef(answers)
  const furthestRef = useRef(0)
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const questions = Array.isArray(quest?.questions) ? quest.questions : []
  const question = questions[current]
  const isScored = Boolean(score)
  const isLast = current >= questions.length - 1

  useEffect(() => {
    answersRef.current = answers
  }, [answers])

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

  // --- Progress beacon: autosave partial answers + furthest question reached ---
  const sendProgress = useCallback(
    (useBeacon: boolean) => {
      if (!attemptId) return
      const url = `/api/quests/${questId}/attempts/${attemptId}/progress`
      const body = JSON.stringify({
        answers: Object.entries(answersRef.current).map(
          ([questionId, answer]) => ({ questionId, answer })
        ),
        lastQuestionIndex: furthestRef.current,
      })
      if (useBeacon && typeof navigator !== "undefined" && navigator.sendBeacon) {
        navigator.sendBeacon(url, new Blob([body], { type: "application/json" }))
        return
      }
      void fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        keepalive: true,
        body,
      }).catch(() => {})
    },
    [attemptId, questId]
  )

  // Fire on question advance (once we have a quest loaded and are still answering).
  useEffect(() => {
    if (!attemptId || isScored || submitted || !quest) return
    furthestRef.current = Math.max(furthestRef.current, current)
    sendProgress(false)
  }, [current, attemptId, isScored, submitted, quest, sendProgress])

  // Fire on tab hide / navigation so an abandon still records where they stopped.
  useEffect(() => {
    const onHide = () => {
      if (isScored || submitted) return
      sendProgress(true)
    }
    const onVisibility = () => {
      if (document.visibilityState === "hidden") onHide()
    }
    window.addEventListener("pagehide", onHide)
    document.addEventListener("visibilitychange", onVisibility)
    return () => {
      window.removeEventListener("pagehide", onHide)
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [isScored, submitted, sendProgress])

  useEffect(() => () => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current)
  }, [])

  const goNext = useCallback(
    () => setCurrent((value) => Math.min(value + 1, questions.length - 1)),
    [questions.length]
  )
  const goPrevious = useCallback(
    () => setCurrent((value) => Math.max(value - 1, 0)),
    []
  )

  const handleAnswer = useCallback(
    (value: string) => {
      if (!question) return
      setAnswers((prev) => ({ ...prev, [question.id]: value }))
      // Typeform-style auto-advance for choice questions (not the last one).
      if (
        question.type !== "open_ended" &&
        question.type !== "file" &&
        !isLast
      ) {
        if (advanceTimer.current) clearTimeout(advanceTimer.current)
        advanceTimer.current = setTimeout(goNext, 280)
      }
    },
    [question, isLast, goNext]
  )

  // Keyboard: number/letter to pick a choice, Enter/→ to advance, ← to go back.
  useEffect(() => {
    if (!question || reviewing || isScored || submitted) return
    const handler = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement | null)?.tagName
      const inField = tag === "TEXTAREA" || tag === "INPUT"

      if (question.type !== "open_ended") {
        const key = event.key.toLowerCase()
        if (/^[1-9]$/.test(key)) {
          const idx = Number(key) - 1
          if (idx < question.options.length) {
            event.preventDefault()
            handleAnswer(question.options[idx])
          }
          return
        }
        if (/^[a-z]$/.test(key)) {
          const idx = key.charCodeAt(0) - 97
          if (idx < question.options.length) {
            event.preventDefault()
            handleAnswer(question.options[idx])
          }
          return
        }
      }

      if (event.key === "Enter" && !inField) {
        event.preventDefault()
        if (isLast) setReviewing(true)
        else goNext()
      }
      if (event.key === "ArrowRight" && !inField && !isLast) goNext()
      if (event.key === "ArrowLeft" && !inField) goPrevious()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [question, reviewing, isScored, submitted, isLast, handleAnswer, goNext, goPrevious])

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
    <main className="min-h-screen bg-background text-foreground">
      <QuestPlayStage
        quest={quest}
        attemptId={attemptId}
        question={question}
        current={current}
        answeredCount={completed}
        selectedAnswer={answers[question.id]}
        score={score}
        submitted={submitted}
        reviewing={reviewing}
        busy={busy}
        canScore={canScore}
        onAnswer={handleAnswer}
        onPrevious={goPrevious}
        onNext={goNext}
        onReview={() => setReviewing(true)}
        onExitReview={() => setReviewing(false)}
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
