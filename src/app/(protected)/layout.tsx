

import { type ReactNode} from "react"

import MainLayout from "@/layout/main-layout";

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
 

  return (
  
      <MainLayout>
         {children}
      </MainLayout>

    
  )
}