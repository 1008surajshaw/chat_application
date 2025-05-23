import { Suspense } from "react"
import Sidebar from "@/components/chat/sidebar"

interface SidebarContainerProps {
  onChatSelect: (chatId: string) => void
  selectedChat: string | null
  isChatLoading: boolean
  userChats: any[]
}

// This could be a Server Component that pre-fetches data
export default function SidebarContainer(props: SidebarContainerProps) {
  return (
    <Suspense fallback={<div className="p-4">Loading chats...</div>}>
      <Sidebar {...props} />
    </Suspense>
  )
}