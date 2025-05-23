"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter, useSearchParams, useParams } from "next/navigation"
import { MessageSquarePlus } from "lucide-react"
import { Button } from "@/components/ui/button"

import FilterBar from "./sidebar/filter-bar"
import ChatList from "./sidebar/chat-list"
import NewChatPanel from "./sidebar/new-chat-panel"
import CreateGroupPanel from "./sidebar/create-group-panel"
import LabelManagementPanel from "./sidebar/label-management-panel"
import { ChatListSkeleton } from "../ui/skeletons/chat-list-skeleton"
import { useChatStore } from "@/store/chat-store"
import { useAuth } from "@/providers/auth-provider"

interface CustomFilter {
  id: string
  name: string
  query: string
}

interface SidebarProps {
  onChatSelect?: (chatId: string) => void
}

export default function Sidebar({ onChatSelect }: SidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const params = useParams()
  const { user } = useAuth()
  const initialRenderRef = useRef(true)
  
  // Use the chat store
  const { 
    chats, 
    selectedChatId, 
    isLoading, 
    fetchChats, 
    selectChat,
    filterChatsByLabel
  } = useChatStore()

  const [searchQuery, setSearchQuery] = useState("")
  const [newChatSearchQuery, setNewChatSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")
  const [customFilterName, setCustomFilterName] = useState("")
  const [savedFilters, setSavedFilters] = useState<CustomFilter[]>([])
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null)
  const [isNewChatOpen, setIsNewChatOpen] = useState(false)
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false)
  const [isLabelManagementOpen, setIsLabelManagementOpen] = useState(false)
  const [initialLoadDone, setInitialLoadDone] = useState(false)

  // Fetch chats only once when component mounts
  useEffect(() => {
    if (!initialLoadDone && user) {
      console.log("Sidebar: Fetching chats on initial load")
      fetchChats().then(() => {
        setInitialLoadDone(true)
      })
    }
  }, [user, fetchChats, initialLoadDone])

  // Handle URL search params only once
  useEffect(() => {
    const query = searchParams.get("q") || ""
    setSearchQuery(query)

    const filters = localStorage.getItem("customFilters")
    if (filters) {
      setSavedFilters(JSON.parse(filters))
    }
  }, [searchParams])

  // Update URL only when search query changes
  useEffect(() => {
    const currentQuery = searchParams.get("q") || ""
    
    // Only update if the query has actually changed
    if (searchQuery !== currentQuery) {
      const params = new URLSearchParams(searchParams.toString())
  
      if (searchQuery) {
        params.set("q", searchQuery)
      } else {
        params.delete("q")
      }
  
      router.replace(`/chat?${params.toString()}`, { scroll: false })
    }
  }, [searchQuery, router, searchParams])

  // Filter chats based on search query and active label filter
  const filteredChats = chats
    .filter(chat => chat.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .filter(chat => activeFilter === "all" || chat.labels.includes(activeFilter))

  const handleSaveFilter = () => {
    if (!customFilterName.trim()) return

    const newFilter: CustomFilter = {
      id: Date.now().toString(),
      name: customFilterName,
      query: searchQuery,
    }

    const updatedFilters = [...savedFilters, newFilter]
    setSavedFilters(updatedFilters)
    localStorage.setItem("customFilters", JSON.stringify(updatedFilters))
    setCustomFilterName("")
    setSelectedFilter(newFilter.id)
  }

  const handleChatSelect = useCallback((chatId: string) => {
    console.log("Sidebar: Selecting chat", chatId)
    
    // Use the provided onChatSelect callback if available
    if (onChatSelect) {
      onChatSelect(chatId)
    } else {
      // Otherwise, handle it here
      selectChat(chatId)
      
      // Update URL without full page reload
      if (initialRenderRef.current) {
        initialRenderRef.current = false
      } else {
        router.push(`/chat/${chatId}`, { scroll: false })
      }
    }
  }, [selectChat, onChatSelect, router])

  const openNewChat = () => {
    setIsNewChatOpen(true)
    if (isCreateGroupOpen) {
      setIsCreateGroupOpen(false)
    }
    if (isLabelManagementOpen) {
      setIsLabelManagementOpen(false)
    }
  }

  const closeNewChat = () => {
    setIsNewChatOpen(false)
    setNewChatSearchQuery("")
  }

  const openCreateGroup = () => {
    setIsCreateGroupOpen(true)
    // Close other panels if open
    if (isNewChatOpen) {
      setIsNewChatOpen(false)
    }
    if (isLabelManagementOpen) {
      setIsLabelManagementOpen(false)
    }
  }

  const closeCreateGroup = () => {
    setIsCreateGroupOpen(false)
  }
  
  const openLabelManagement = () => {
    setIsLabelManagementOpen(true)
    // Close other panels if open
    if (isNewChatOpen) {
      setIsNewChatOpen(false)
    }
    if (isCreateGroupOpen) {
      setIsCreateGroupOpen(false)
    }
  }
  
  const closeLabelManagement = () => {
    setIsLabelManagementOpen(false)
  }
  
  if(isLoading && !initialLoadDone){
    return <ChatListSkeleton/>
  }

  return (
    <div className="flex flex-col h-full w-full relative">
      <div className="flex flex-col h-full w-full relative">
        <FilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSaveFilter={handleSaveFilter}
          customFilterName={customFilterName}
          setCustomFilterName={setCustomFilterName}
          onCreateGroup={openCreateGroup}
          onManageLabels={openLabelManagement}
        />

        {/* Chat List */}
        <ChatList
          chats={filteredChats}
          selectedChat={selectedChatId}
          onChatSelect={handleChatSelect}
          onNewChat={openNewChat}
        />

        {/* New Chat Panel */}
        <NewChatPanel
          isOpen={isNewChatOpen}
          onClose={closeNewChat}
          searchQuery={newChatSearchQuery}
          setSearchQuery={setNewChatSearchQuery}
          onChatCreated={(chatId) => {
            handleChatSelect(chatId);
            // Refresh chats after creating a new one
            fetchChats();
          }}
        />

        {/* Create Group Panel */}
        <CreateGroupPanel
          isOpen={isCreateGroupOpen}
          onClose={closeCreateGroup}
          onGroupCreated={(chatId) => {
            handleChatSelect(chatId);
            // Refresh chats after creating a new group
            fetchChats();
          }}
        />
        
        {/* Label Management Panel */}
        <LabelManagementPanel
          isOpen={isLabelManagementOpen}
          onClose={closeLabelManagement}
        />

        <Button onClick={openNewChat} className="absolute bottom-4 right-4 h-12 w-12 rounded-full shadow-lg z-20 bg-green-600 hover:bg-green-700" size="icon">
          <MessageSquarePlus className="h-10 w-10" />
        </Button>

      </div>
    </div>
  )
}
