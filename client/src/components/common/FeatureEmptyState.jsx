import { routeHref } from '../../config/navigation'
import Button from './Button'
import EmptyState from './EmptyState'

/** Shown on study-tool pages before any materials exist. */
export default function FeatureEmptyState({ icon, title, description }) {
  return (
    <EmptyState
      icon={icon}
      title={title}
      description={description}
      action={<Button href={routeHref('materials')}>Upload materials</Button>}
    />
  )
}
