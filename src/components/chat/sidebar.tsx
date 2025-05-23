"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { MessageSquarePlus } from "lucide-react"
import { Button } from "@/components/ui/button"

import FilterBar from "./sidebar/filter-bar"
import ChatList from "./sidebar/chat-list"
import NewChatPanel from "./sidebar/new-chat-panel"
import CreateGroupPanel from "./sidebar/create-group-panel"
import { Chat } from "@/interface/interface"

interface SidebarProps {
  onChatSelect: (chatId: string) => void
  selectedChat: string | null
  userChats: Chat[]
  isChatLoading: boolean
}

interface CustomFilter {
  id: string
  name: string
  query: string
}

export default function Sidebar({ onChatSelect, selectedChat, userChats, isChatLoading }: SidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [searchQuery, setSearchQuery] = useState("")
  const [newChatSearchQuery, setNewChatSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")
  const [customFilterName, setCustomFilterName] = useState("")
  const [savedFilters, setSavedFilters] = useState<CustomFilter[]>([])
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null)
  const [isNewChatOpen, setIsNewChatOpen] = useState(false)
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false)

  useEffect(() => {
    const query = searchParams.get("q") || ""
    setSearchQuery(query)

    const filters = localStorage.getItem("customFilters")
    if (filters) {
      setSavedFilters(JSON.parse(filters))
    }
  }, [searchParams])

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())

    if (searchQuery) {
      params.set("q", searchQuery)
    } else {
      params.delete("q")
    }

    router.replace(`/chat?${params.toString()}`)
  }, [searchQuery, router, searchParams])

  const filteredChats = userChats.filter(
    (chat) =>
      chat.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      (activeFilter === "all" || chat.labels.includes(activeFilter)),
  )

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

  const openNewChat = () => {
    setIsNewChatOpen(true)
    // Close create group panel if open
    if (isCreateGroupOpen) {
      setIsCreateGroupOpen(false)
    }
  }

  const closeNewChat = () => {
    setIsNewChatOpen(false)
    setNewChatSearchQuery("")
  }

  const openCreateGroup = () => {
    setIsCreateGroupOpen(true)
    // Close new chat panel if open
    if (isNewChatOpen) {
      setIsNewChatOpen(false)
    }
  }

  const closeCreateGroup = () => {
    setIsCreateGroupOpen(false)
  }
  
  if(isChatLoading){
    return <div className="flex items-center justify-center h-full">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>
  }

  return (
    <div className="flex flex-col h-full w-full relative">
      {/* Main sidebar content */}
      <div className="flex flex-col h-full w-full relative">
        {/* Filter Bar */}
        <FilterBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSaveFilter={handleSaveFilter}
          customFilterName={customFilterName}
          setCustomFilterName={setCustomFilterName}
          onCreateGroup={openCreateGroup}
        />

        {/* Chat List */}
        <ChatList
          chats={filteredChats}
          selectedChat={selectedChat}
          onChatSelect={onChatSelect}
          onNewChat={openNewChat}
        />

        {/* New Chat Panel */}
        <NewChatPanel
          isOpen={isNewChatOpen}
          onClose={closeNewChat}
          searchQuery={newChatSearchQuery}
          setSearchQuery={setNewChatSearchQuery}
          onChatCreated={(chatId) => {
            // When a new chat is created, select it
            onChatSelect(chatId);
          }}
        />

        {/* Create Group Panel */}
        <CreateGroupPanel
          isOpen={isCreateGroupOpen}
          onClose={closeCreateGroup}
          onGroupCreated={(chatId) => {
            // When a new group is created, select it
            onChatSelect(chatId);
          }}
        />

        {/* New Chat Button - fixed at bottom right */}
        <Button onClick={openNewChat} className="absolute bottom-4 right-4 h-12 w-12 rounded-full shadow-lg z-20" size="icon">
          <MessageSquarePlus className="h-6 w-6" />
        </Button>
      </div>
    </div>
  )
}