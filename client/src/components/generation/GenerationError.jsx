import { BACKEND_UNAVAILABLE, REQUEST_TIMEOUT } from '../../api/client'
import ErrorState from '../common/ErrorState'
import DemoButton from './DemoButton'

const ERROR_TITLES = {
  [BACKEND_UNAVAILABLE]: "Can't reach the StudySync server",
  [REQUEST_TIMEOUT]: 'This is taking too long',
  AI_NOT_CONFIGURED: "The AI service isn't set up yet",
  AI_SERVICE_ERROR: "The AI service couldn't respond",
  AI_INVALID_RESPONSE: "The AI's response couldn't be read",
  VALIDATION_ERROR: "This document can't be used",
}

// Errors where the student can't fix things themselves; Demo Mode still shows the UI.
const CAN_USE_DEMO = new Set([BACKEND_UNAVAILABLE, 'AI_NOT_CONFIGURED', 'AI_SERVICE_ERROR'])

export default function GenerationError({ error, onRetry, onOpenDemo }) {
  return (
    <ErrorState
      title={ERROR_TITLES[error.code] ?? 'Something went wrong'}
      message={error.message}
      onRetry={onRetry}
      secondaryAction={onOpenDemo && CAN_USE_DEMO.has(error.code) && <DemoButton onClick={onOpenDemo} />}
    />
  )
}
