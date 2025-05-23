"use client"

import { useRef, useEffect, useState } from "react"
import { ArrowLeft, Search, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar } from "@/components/ui/avatar"
import { SearchUserProfile, createOneOnOneChat } from "@/actions/chat"
import Image from "next/image"

interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
}

interface NewChatPanelProps {
  isOpen: boolean
  onClose: () => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  onChatCreated?: (chatId: string) => void
}

export default function NewChatPanel({ 
  isOpen, 
  onClose, 
  searchQuery, 
  setSearchQuery,
  onChatCreated
}: NewChatPanelProps) {
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [searchResults, setSearchResults] = useState<UserProfile[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isCreatingChat, setIsCreatingChat] = useState(false)

  // Focus new chat search input when panel opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 300) // Wait for animation to complete
    }
  }, [isOpen])

  // Search for users when search query changes
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }
      
      setIsSearching(true);
      try {
        const results = await SearchUserProfile(searchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error("Error searching users:", error);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimeout = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimeout);
  }, [searchQuery]);

  const handleCreateChat = async (user: UserProfile) => {
    setIsCreatingChat(true);
    try {
      // Create a new chat with the selected user
      console.log("user.id", user.id);
      const chat = await createOneOnOneChat(user.id);
      
      if (chat && onChatCreated) {
        onChatCreated(chat.id);
        // Reset and close the panel
        setSearchQuery("");
        onClose();
      }
    } catch (error) {
      console.error("Error creating chat:", error);
    } finally {
      setIsCreatingChat(false);
    }
  };

  return (
    <div
      className={`absolute top-0 left-0 w-full h-full bg-background flex flex-col z-10 transform transition-all duration-300 ease-in-out ${
        isOpen 
          ? "opacity-100 pointer-events-auto translate-x-0" 
          : "opacity-0 pointer-events-none -translate-x-full"
      }`}
    >
      {/* New Chat Header */}
      <div className="flex items-center gap-2 p-3 border-b">
        <Button variant="ghost" size="icon" onClick={onClose} className="h-9 w-9">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="font-medium">New Chat</h2>
      </div>

      {/* New Chat Search */}
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search contacts"
            className="pl-8 bg-muted/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Search results */}
      <div className="flex-1 overflow-y-auto p-1">
        {isSearching ? (
          <div className="flex justify-center items-center h-20">
            <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : searchResults.length > 0 ? (
          <div className="space-y-1">
            {searchResults.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-md">
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-3">
                    <Image src={user.avatar_url || "/placeholder.svg?height=40&width=40"} alt={user.name} width={40} height={40} />
                  </Avatar>
                  <div>
                    <h3 className="text-sm font-medium">{user.name}</h3>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="gap-1"
                  onClick={() => handleCreateChat(user)}
                  disabled={isCreatingChat}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span>Chat</span>
                </Button>
              </div>
            ))}
          </div>
        ) : searchQuery.trim() ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <p className="text-sm">No users found</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <p className="text-sm">Search for users to start a chat</p>
          </div>
        )}
      </div>
    </div>
  )
}