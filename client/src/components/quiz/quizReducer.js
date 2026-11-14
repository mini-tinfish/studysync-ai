/**
 * Quiz session state for one generated quiz (serializable, so it can be saved as progress).
 * - order:    question ids in play order
 * - position: index into `order`
 * - pending:  option index picked for the current question but not yet submitted
 * - answers:  { [questionId]: { selected, correct } } — submitted answers are final
 * - finished: true once the last question has been answered and the student moves on
 */
export function createQuizSession(questions) {
  return { order: questions.map((q) => q.id), position: 0, pending: null, answers: {}, finished: false }
}

/** Rehydrate saved progress only if it still matches this quiz's questions. */
export function restoreQuizSession(questions, saved) {
  if (!saved || !Array.isArray(saved.order)) return createQuizSession(questions)
  const ids = new Set(questions.map((q) => q.id))
  if (saved.order.length !== questions.length || !saved.order.every((id) => ids.has(id))) {
    return createQuizSession(questions)
  }
  const answers = Object.fromEntries(Object.entries(saved.answers ?? {}).filter(([id]) => ids.has(id)))
  return {
    ...createQuizSession(questions),
    ...saved,
    answers,
    position: Math.min(Math.max(0, saved.position ?? 0), saved.order.length - 1),
  }
}

export function quizReducer(state, action) {
  const currentId = state.order[state.position]
  const isAnswered = currentId in state.answers

  switch (action.type) {
    case 'select':
      // A submitted answer can't be changed.
      if (isAnswered || state.finished) return state
      return { ...state, pending: action.index }

    case 'submit': {
      // Ignore duplicate submissions and submissions without a choice.
      if (isAnswered || state.pending === null || state.finished) return state
      const question = action.questions.find((q) => q.id === currentId)
      if (!question) return state
      return {
        ...state,
        pending: null,
        answers: {
          ...state.answers,
          [currentId]: { selected: state.pending, correct: state.pending === question.correctIndex },
        },
      }
    }

    case 'next':
      if (!isAnswered) return state
      if (state.position >= state.order.length - 1) return { ...state, finished: true }
      return { ...state, position: state.position + 1, pending: null }

    case 'restart':
      return createQuizSession(action.questions)

    default:
      return state
  }
}

export function scoreQuiz(questions, answers) {
  const correct = questions.filter((q) => answers[q.id]?.correct).length
  const answered = questions.filter((q) => q.id in answers).length
  const total = questions.length
  return {
    correct,
    incorrect: answered - correct,
    answered,
    total,
    percent: total ? Math.round((correct / total) * 100) : 0,
    missed: questions.filter((q) => q.id in answers && !answers[q.id].correct),
  }
}
