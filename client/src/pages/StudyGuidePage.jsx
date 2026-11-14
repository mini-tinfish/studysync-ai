import { BookOpen } from 'lucide-react'
import FeatureEmptyState from '../components/common/FeatureEmptyState'
import PageHeader from '../components/common/PageHeader'

export default function StudyGuidePage() {
  return (
    <>
      <PageHeader
        eyebrow="Study Guide"
        title="Study guides"
        description="Organized summaries of the key ideas, terms, and takeaways in your materials."
      />
      <FeatureEmptyState
        icon={BookOpen}
        title="No study guides yet"
        description="Upload a document first. Study guides will appear here once generation is available."
      />
    </>
  )
}
