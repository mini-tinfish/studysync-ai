import { BookOpen, Layers, ListChecks } from 'lucide-react'
import { routeHref } from '../../config/navigation'
import QuickActionCard from './QuickActionCard'

const ACTIONS = [
  {
    id: 'study-guide',
    icon: BookOpen,
    title: 'Study Guide',
    description: 'Summaries of key concepts, terms, and takeaways from your materials.',
    tone: 'lavender',
  },
  {
    id: 'flashcards',
    icon: Layers,
    title: 'Flashcards',
    description: 'Flip through question-and-answer cards to lock in what you learn.',
    tone: 'rose',
  },
  {
    id: 'quiz',
    icon: ListChecks,
    title: 'Practice Quiz',
    description: 'Test yourself with multiple-choice questions and instant feedback.',
    tone: 'amber',
  },
]

export default function QuickActions({ hasMaterials }) {
  return (
    <section aria-labelledby="quick-actions-title">
      <h2 id="quick-actions-title" className="mb-4 text-lg font-bold tracking-tight text-ink-900">
        Quick actions
      </h2>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ACTIONS.map(({ id, ...action }) => (
          <li key={id}>
            <QuickActionCard
              href={routeHref(id)}
              note={hasMaterials ? undefined : 'Needs uploaded materials'}
              {...action}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
