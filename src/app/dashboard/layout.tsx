import { Sidebar } from '@/components/ui/Sidebar'
import { BottomNav } from '@/components/ui/BottomNav'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row relative">
      <aside className="hidden md:block md:w-64 md:min-h-screen md:sticky md:top-0 shrink-0 bg-surface-container-low border-r border-surface-container-high">
        <Sidebar />
      </aside>
      <div className="flex-1 min-h-screen pb-24 md:pb-0">
        {children}
      </div>
      <BottomNav />
    </div>
  )
}
