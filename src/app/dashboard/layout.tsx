export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-md mx-auto md:max-w-4xl lg:max-w-7xl min-h-screen">
      {children}
    </div>
  )
}
