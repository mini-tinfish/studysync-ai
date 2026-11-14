import { ListChecks } from 'lucide-react'
import FeatureEmptyState from '../components/common/FeatureEmptyState'
import PageHeader from '../components/common/PageHeader'

export default function QuizPage() {
  return (
    <>
      <PageHeader
        eyebrow="Practice Quiz"
        title="Practice quizzes"
        description="Check your understanding with multiple-choice questions."
      />
      <FeatureEmptyState
        icon={ListChecks}
        title="No quizzes yet"
        description="Upload a document first. Practice quizzes will appear here once generation is available."
      />
    </>
  )
}
