import React, { ReactNode } from 'react'
import { TopHeader } from './top-header'
import { LeftSidebar } from './left-sidebar'

import { RightSidebar } from './right-sidebar'


export default async function MainLayout({ children }: { children: ReactNode }) {
   
  return (
    <div className="flex flex-col h-screen w-full bg-white overflow-hidden">
      <TopHeader />

      <div className="flex flex-1 overflow-hidden">
        <LeftSidebar />

          {children}

        <RightSidebar />
      </div>
    </div>
  )
}

