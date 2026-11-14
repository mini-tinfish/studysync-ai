import { ListChecks } from 'lucide-react'
import InlineAlert from '../components/common/InlineAlert'
import PageHeader from '../components/common/PageHeader'
import StudyMaterialGate from '../components/study/StudyMaterialGate'

export default function QuizPage() {
  return (
    <>
      <PageHeader
        eyebrow="Practice Quiz"
        title="Practice quizzes"
        description="Check your understanding with multiple-choice questions."
      />
      <StudyMaterialGate icon={ListChecks} featureName="a practice quiz">
        {() => (
          <InlineAlert variant="info" title="Not connected yet">
            Quiz generation isn&rsquo;t available yet. It will use this document once the AI service is connected.
          </InlineAlert>
        )}
      </StudyMaterialGate>
    </>
  )
}
