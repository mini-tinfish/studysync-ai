import PageHeader from '../components/common/PageHeader'
import QuickActions from '../components/dashboard/QuickActions'
import RecentMaterials from '../components/dashboard/RecentMaterials'
import UploadCard from '../components/dashboard/UploadCard'
import { useMaterials } from '../context/materialsContext'

export default function DashboardPage() {
  const { documents, activeDocument } = useMaterials()

  return (
    <>
      <PageHeader
        eyebrow="Dashboard"
        title="Welcome to StudySync AI"
        description="Bring your course materials together in one place and turn them into study guides, flashcards, and practice quizzes."
      />
      <div className="space-y-10">
        <UploadCard />
        <QuickActions hasMaterials={documents.length > 0} />
        <RecentMaterials materials={documents} activeId={activeDocument?.id ?? null} />
      </div>
    </>
  )
}
