"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import ChatWindow from "@/components/chat/chat-windows"
import ProfilePanel from "@/components/chat/profile-panel"
import { useMobile } from "@/hooks/use-mobile"
import { useAuth } from "@/providers/auth-provider"
import Sidebar from "./sidebar"
import { MessageSquare } from "lucide-react"
import { FullScreenSkeleton } from "../ui/skeletons/full-screen-skeleton"
import { useChatStore } from "@/store/chat-store"

export default function ChatInterface() {
  const params = useParams()
  const router = useRouter()
  const { isLoading: authLoading, user } = useAuth()
  const isMobile = useMobile()
  const initialRenderRef = useRef(true)
  
  // Use the chat store
  const { 
    chats, 
    selectedChatId, 
    isLoading: chatsLoading, 
    fetchChats, 
    selectChat 
  } = useChatStore()

  const [showProfilePanel, setShowProfilePanel] = useState(false)
  const [initialLoadDone, setInitialLoadDone] = useState(false)

  // Fetch chats only once when component mounts
  useEffect(() => {
    if (!initialLoadDone && user) {
      console.log("Fetching chats on initial load")
      fetchChats().then(() => {
        setInitialLoadDone(true)
      })
    }
  }, [fetchChats, initialLoadDone, user])

  // Get chatId from URL params - only run when params change or after initial load
  useEffect(() => {
    if (initialLoadDone || !chatsLoading) {
      const chatIdFromParams = params?.chatId as string
      if (chatIdFromParams && chatIdFromParams !== selectedChatId) {
        console.log("Setting selected chat from params:", chatIdFromParams)
        selectChat(chatIdFromParams)
      }
    }
  }, [params, selectChat, selectedChatId, initialLoadDone, chatsLoading])

  // Handle chat selection without full page reload
  const handleChatSelect = useCallback((chatId: string) => {
    console.log("Selecting chat:", chatId)
    
    // Update the store state
    selectChat(chatId)
    
    // Update the URL without triggering a full page reload
    if (initialRenderRef.current) {
      initialRenderRef.current = false
    } else {
      // Use shallow routing to update URL without reloading the page
      router.push(`/chat/${chatId}`, { scroll: false })
    }
    
    if (isMobile) {
      setShowProfilePanel(false)
    }
  }, [selectChat, router, isMobile])

  const toggleProfilePanel = () => {
    setShowProfilePanel(!showProfilePanel)
  }

  if (authLoading || (chatsLoading && !initialLoadDone)) {
    return <FullScreenSkeleton/>
  }

  return (
    <div className="flex h-[calc(100vh-64px)] w-full bg-background overflow-hidden">
      <div className={`${isMobile && selectedChatId ? "hidden" : "w-[400px]"} flex-shrink-0 border-r h-full flex flex-col`}>
        <Sidebar onChatSelect={handleChatSelect} />
      </div>
     
      {/* Chat Window - fixed height with scrollable messages */}
      <div className={`${isMobile && !selectedChatId ? "hidden" : "flex"} flex-1 flex-col h-full overflow-hidden`}>
        {selectedChatId ? (
          <ChatWindow
            chatId={selectedChatId}
            onBackClick={() => {
              selectChat(null)
              router.push('/chat', { scroll: false })
            }}
            onProfileClick={toggleProfilePanel}
            isChatLoading={chatsLoading}
            userChats={chats}
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
