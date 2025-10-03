import { DashboardSidebar } from "@/components/layout/DashboardSidebar"
import { MobileBottomNav } from "@/components/layout/MobileBottomNav"

interface DashboardLayoutProps {
  children: React.ReactNode
  params: {
    locale?: string
  }
}

export default function DashboardLayout({
  children,
  params,
}: DashboardLayoutProps) {
  const locale = params?.locale || "en"

  return (
    <>
      <DashboardSidebar locale={locale}>
        {children}
      </DashboardSidebar>
      <MobileBottomNav />
    </>
  )
}
