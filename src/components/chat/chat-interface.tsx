"use client"

import { useEffect, useState } from "react"
import ChatWindow from "@/components/chat/chat-windows"
import ProfilePanel from "@/components/chat/profile-panel"

import { useMobile } from "@/hooks/use-mobile"
import { useAuth } from "@/providers/auth-provider"
import { FullPageLoader } from "../ui/loading"
import Sidebar from "./sidebar"
import { MessageSquare } from "lucide-react"
import { fetchUserChats } from "@/services/chat-service"

export default function ChatInterface() {

  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [showProfilePanel, setShowProfilePanel] = useState(false)
  const [userChats, setUserChats] = useState<any[]>([])
  const [isChatLoading, setisChatLoading] = useState(true)
  const { isLoading } = useAuth()
  const isMobile = useMobile()

  const handleChatSelect = (chatId: string) => {
    console.log("chatId", chatId);
    setSelectedChat(chatId)
    if (isMobile) {
      setShowProfilePanel(false)
    }
  }

  const toggleProfilePanel = () => {
    setShowProfilePanel(!showProfilePanel)
  }

  if (isLoading) {
    return <FullPageLoader />
  }

   useEffect(() => {
      const loadUserChats = async () => {
        setisChatLoading(true)
        try {
          const chats = await fetchUserChats()
          setUserChats(chats)
        } catch (error) {
          console.error("Failed to load user chats:", error)
        } finally {
          setisChatLoading(false)
        }
      }
  
      loadUserChats()
  }, [])

  return (
    <div className="flex h-[calc(100vh-64px)] w-full bg-background overflow-hidden">
      <div className={`${isMobile && selectedChat ? "hidden" : "w-[400px]"} flex-shrink-0 border-r h-full flex flex-col`}>
        <Sidebar 
          onChatSelect={handleChatSelect} 
          selectedChat={selectedChat} 
          userChats={userChats}
          isChatLoading={isChatLoading}
        />
      </div>
     
      {/* Chat Window - fixed height with scrollable messages */}
      <div className={`${isMobile && !selectedChat ? "hidden" : "flex"} flex-1 flex-col h-full overflow-hidden`}>
        {selectedChat ? (
          <ChatWindow
            chatId={selectedChat}
            onBackClick={() => setSelectedChat(null)}
            onProfileClick={toggleProfilePanel}
            isChatLoading={isChatLoading}
            userChats={userChats}
            
            
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full bg-muted/20">
            <div className="text-center p-6 max-w-md">
              <div className="bg-primary/10 p-6 rounded-full inline-block mb-4">
                <MessageSquare className="h-12 w-12 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Welcome to Chat</h2>
              <p className="text-muted-foreground mb-4">
                Select a conversation from the sidebar or start a new chat to begin messaging.
              </p>
              <div className="text-sm text-muted-foreground">
                <p className="mb-2">• Your messages are end-to-end encrypted</p>
                <p className="mb-2">• Share photos, videos, and documents</p>
                <p>• Stay connected with friends and colleagues</p>
              </div>
            </div>
          </div>
        )}
        </div>

      {/* Profile Panel - fixed height */}
      {showProfilePanel && !isMobile && (
        <div className="w-[350px] flex-shrink-0 border-l h-full overflow-y-auto">
          <ProfilePanel onClose={() => setShowProfilePanel(false)} />
        </div>
      )}
    </div>
  )
}
