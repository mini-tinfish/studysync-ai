import ErrorState from '../common/ErrorState'
import DemoButton from './DemoButton'
import { canUseDemoFor, errorTitle } from './errorMessages'

export default function GenerationError({ error, onRetry, onOpenDemo }) {
  return (
    <ErrorState
      title={errorTitle(error.code)}
      message={error.message}
      onRetry={onRetry}
      secondaryAction={onOpenDemo && canUseDemoFor(error.code) && <DemoButton onClick={onOpenDemo} />}
    />
  )
}
