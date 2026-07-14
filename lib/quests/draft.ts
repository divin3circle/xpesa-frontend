import type { CreatorQuestDetail, QuestDraftQuestion } from "@/hooks/use-quests"

export type DraftQuestion = QuestDraftQuestion

export const blankQuestion = (): DraftQuestion => ({
  type: "multiple_choice",
  prompt: "",
  options: ["", "", "", ""],
  correctAnswer: "",
  explanation: "",
  points: 1,
})

export const blankOpenQuestion = (): DraftQuestion => ({
  type: "open_ended",
  prompt: "",
  options: [],
  correctAnswer: "__open_ended__",
  explanation: "",
  points: 1,
})

export function initialQuestions(
  questions?: CreatorQuestDetail["quest_questions"]
): DraftQuestion[] {
  if (!questions?.length) return [blankQuestion()]
  return questions.map((question) => ({
    type: question.type,
    prompt: question.prompt,
    options: question.options,
    correctAnswer: question.correct_answer,
    explanation: question.explanation ?? "",
    points: question.points ?? 1,
  }))
}

export function isBlankQuestion(question: DraftQuestion) {
  if (question.type === "open_ended") {
    return !question.prompt.trim() && !question.explanation.trim()
  }

  return (
    !question.prompt.trim() &&
    !question.correctAnswer.trim() &&
    question.options.every((option) => !option.trim())
  )
}

export function isCompleteQuestion(question: DraftQuestion) {
  if (question.type === "open_ended") {
    return question.prompt.trim().length > 0
  }

  return (
    question.prompt.trim().length > 0 &&
    question.correctAnswer.trim().length > 0 &&
    question.options.filter((option) => option.trim().length > 0).length >= 2
  )
}

export function prepareQuestionsForSave(status: string, questions: DraftQuestion[]) {
  const completeQuestions = questions.filter(isCompleteQuestion)
  const hasPartialQuestion = questions.some(
    (question) => !isBlankQuestion(question) && !isCompleteQuestion(question)
  )

  if (hasPartialQuestion) {
    return {
      error: "Finish each started question before saving, or remove it.",
      questions: completeQuestions,
    }
  }

  if (status === "active" && completeQuestions.length === 0) {
    return {
      error: "Add at least one complete question before publishing.",
      questions: completeQuestions,
    }
  }

  return { error: null, questions: completeQuestions }
}
