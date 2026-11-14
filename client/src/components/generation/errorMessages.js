import { BACKEND_UNAVAILABLE, REQUEST_TIMEOUT } from '../../api/client'

const ERROR_TITLES = {
  [BACKEND_UNAVAILABLE]: "Can't reach the StudySync server",
  [REQUEST_TIMEOUT]: 'This is taking too long',
  AI_NOT_CONFIGURED: "The AI service isn't set up yet",
  AI_SERVICE_ERROR: "The AI service couldn't respond",
  AI_INVALID_RESPONSE: "The AI's response couldn't be read",
  VALIDATION_ERROR: "This document can't be used",
}

export const errorTitle = (code) => ERROR_TITLES[code] ?? 'Something went wrong'

// Errors the student can't fix themselves; Demo Mode still shows the UI.
const CAN_USE_DEMO = new Set([BACKEND_UNAVAILABLE, 'AI_NOT_CONFIGURED', 'AI_SERVICE_ERROR'])
export const canUseDemoFor = (code) => CAN_USE_DEMO.has(code)
