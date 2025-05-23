"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar } from "@/components/ui/avatar"
import { Plus, Search, X } from "lucide-react"
import { SearchUserProfile, createGroupChat, createOneOnOneChat } from "@/actions/chat"
import Image from "next/image"

interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
}

interface NewChatDialogProps {
  onChatCreated: (chatId: string) => void;
}

export default function NewChatDialog({ onChatCreated }: NewChatDialogProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<UserProfile[]>([])
  const [selectedUsers, setSelectedUsers] = useState<UserProfile[]>([])
  const [chatName, setChatName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    
    try {
      setIsLoading(true)
      const results = await SearchUserProfile(searchQuery)
      setSearchResults(results)
    } catch (error) {
      console.error("Error searching users:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectUser = (user: UserProfile) => {
    if (!selectedUsers.some(u => u.id === user.id)) {
      setSelectedUsers([...selectedUsers, user])
    }
    setSearchQuery("")
    setSearchResults([])
  }

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter(user => user.id !== userId))
  }

  const handleCreateChat = async () => {
    if (selectedUsers.length === 0) return
    
    try {
      setIsLoading(true)
      
      // Use the first user's name as chat name if not provided
      const name = chatName.trim() || 
        (selectedUsers.length === 1 ? selectedUsers[0].name : `Group (${selectedUsers.length})`)
      
      const userIds = selectedUsers.map(user => user.id)
      
      let chat;
      if (selectedUsers.length === 1) {
        // Create a one-on-one chat
        chat = await createOneOnOneChat(selectedUsers[0].id)
      } else {
        // Create a group chat
        chat = await createGroupChat(name, userIds)
      }
      
      if (chat) {
        onChatCreated(chat.id)
        setOpen(false)
        resetForm()
      }
    } catch (error) {
      console.error("Error creating chat:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setSearchQuery("")
    setSearchResults([])
    setSelectedUsers([])
    setChatName("")
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Chat</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          {selectedUsers.length > 1 && (
            <div>
              <label className="text-sm font-medium mb-1 block">Group Name</label>
              <Input
                placeholder="Enter group name"
                value={chatName}
                onChange={(e) => setChatName(e.target.value)}
              />
            </div>
          )}
          
          <div>
            <label className="text-sm font-medium mb-1 block">Add Participants</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users"
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button onClick={handleSearch} disabled={!searchQuery.trim() || isLoading}>
                Search
              </Button>
            </div>
          </div>
          
          {/* Selected users */}
          {selectedUsers.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-1 block">Selected ({selectedUsers.length})</label>
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map(user => (
                  <div key={user.id} className="flex items-center bg-muted rounded-full pl-1 pr-2 py-1">
                    <Avatar className="h-6 w-6 mr-1">
                      <Image src={user.avatar_url || "/placeholder.svg?height=24&width=24"} alt={user.name} width={24} height={24} />
                    </Avatar>
                    <span className="text-xs">{user.name}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-5 w-5 p-0 ml-1"
                      onClick={() => handleRemoveUser(user.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Search results */}
          {searchResults.length > 0 && (
            <div>
              <label className="text-sm font-medium mb-1 block">Results</label>
              <div className="max-h-[200px] overflow-y-auto border rounded-md">
                {searchResults.map(user => (
                  <div 
                    key={user.id} 
                    className="flex items-center p-2 hover:bg-muted cursor-pointer"
                    onClick={() => handleSelectUser(user)}
                  >
                    <Avatar className="h-8 w-8 mr-2">
                      <Image src={user.avatar_url || "/placeholder.svg?height=32&width=32"} alt={user.name} width={32} height={32} />
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleCreateChat} 
              disabled={selectedUsers.length === 0 || isLoading}
            >
              Create Chat
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
