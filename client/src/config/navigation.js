import {
  BookOpen,
  FolderOpen,
  Layers,
  LayoutDashboard,
  ListChecks,
  MessageCircleQuestionMark,
} from 'lucide-react'

export const DEFAULT_ROUTE = 'dashboard'

export const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'materials', label: 'My Materials', icon: FolderOpen },
  { id: 'study-guide', label: 'Study Guide', icon: BookOpen },
  { id: 'flashcards', label: 'Flashcards', icon: Layers },
  { id: 'quiz', label: 'Practice Quiz', icon: ListChecks },
  { id: 'ask', label: 'Ask My Notes', icon: MessageCircleQuestionMark },
]

export const routeHref = (id) => `#/${id}`
