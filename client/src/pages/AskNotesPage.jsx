import { MessageCircleQuestionMark } from 'lucide-react'
import InlineAlert from '../components/common/InlineAlert'
import PageHeader from '../components/common/PageHeader'
import StudyMaterialGate from '../components/study/StudyMaterialGate'

export default function AskNotesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Ask My Notes"
        title="Ask my notes"
        description="Ask questions and get answers grounded in the materials you've uploaded."
      />
      <StudyMaterialGate icon={MessageCircleQuestionMark} featureName="questions about your notes">
        {() => (
          <InlineAlert variant="info" title="Not connected yet">
            Asking questions about your notes isn&rsquo;t available yet. It will use this document once the AI service is connected.
          </InlineAlert>
        )}
      </StudyMaterialGate>
    </>
  )
}
