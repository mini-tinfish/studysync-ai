import { MessageCircleQuestionMark } from 'lucide-react'
import FeatureEmptyState from '../components/common/FeatureEmptyState'
import PageHeader from '../components/common/PageHeader'

export default function AskNotesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Ask My Notes"
        title="Ask my notes"
        description="Ask questions and get answers grounded in the materials you've uploaded."
      />
      <FeatureEmptyState
        icon={MessageCircleQuestionMark}
        title="Nothing to ask about yet"
        description="Upload a document first. Asking questions about your notes isn't available yet."
      />
    </>
  )
}
