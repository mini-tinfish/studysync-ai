import { Layers } from 'lucide-react'
import FeatureEmptyState from '../components/common/FeatureEmptyState'
import PageHeader from '../components/common/PageHeader'

export default function FlashcardsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Flashcards"
        title="Flashcards"
        description="Review terms and concepts one card at a time."
      />
      <FeatureEmptyState
        icon={Layers}
        title="No flashcards yet"
        description="Upload a document first. Flashcard decks will appear here once generation is available."
      />
    </>
  )
}
