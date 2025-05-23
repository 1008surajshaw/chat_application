"use client"

import { useRef, useEffect, useState } from "react"
import { ArrowLeft, Search, Users, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { SearchUserProfile, createGroupChat } from "@/actions/chat"
import { toast } from "sonner"
import Image from "next/image"


interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
}

interface CreateGroupPanelProps {
  isOpen: boolean
  onClose: () => void
  onGroupCreated?: (chatId: string) => void
}

export default function CreateGroupPanel({ 
  isOpen, 
  onClose,
  onGroupCreated
}: CreateGroupPanelProps) {
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [groupName, setGroupName] = useState("")
  const [searchResults, setSearchResults] = useState<UserProfile[]>([])
  const [selectedUsers, setSelectedUsers] = useState<UserProfile[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [step, setStep] = useState<"select-users" | "set-name">("select-users")
  const [allUsers, setAllUsers] = useState<UserProfile[]>([])
  const [isLoadingUsers, setIsLoadingUsers] = useState(false)

  // Focus search input when panel opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 300) // Wait for animation to complete
    }
  }, [isOpen])

  // Load all users when panel opens
  useEffect(() => {
    if (isOpen) {
      loadAllUsers()
    }
  }, [isOpen])

  // Load all users
  const loadAllUsers = async () => {
    setIsLoadingUsers(true)
    try {
      // Search with empty string to get all users
      const users = await SearchUserProfile("")
      setAllUsers(users)
    } catch (error) {
      console.error("Error loading users:", error)
    } finally {
      setIsLoadingUsers(false)
    }
  }

  // Search for users when search query changes
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim()) {
        setSearchResults(allUsers);
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
  }, [searchQuery, allUsers]);

  // Toggle user selection
  const toggleUserSelection = (user: UserProfile) => {
    if (selectedUsers.some(u => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id))
    } else {
      setSelectedUsers([...selectedUsers, user])
    }
  }

  // Go to next step
  const goToNextStep = () => {
    if (selectedUsers.length < 2) {
      toast.error("Please select at least 2 members to create a group")
      return
    }
    setStep("set-name")
  }

  // Go back to previous step
  const goBack = () => {
    if (step === "set-name") {
      setStep("select-users")
    } else {
      resetAndClose()
    }
  }

  // Create the group
  const createGroup = async () => {
    if (!groupName.trim()) {
      toast.error("Please enter a group name")
      return
    }

    if (selectedUsers.length < 2) {
      toast.error("Please select at least 2 members to create a group")
      return
    }

    setIsCreating(true)
    try {
      const userIds = selectedUsers.map(user => user.id)
      const chat = await createGroupChat(groupName, userIds)
      
      if (chat && onGroupCreated) {
        onGroupCreated(chat.id)
        toast.success("Group created successfully")
        resetAndClose()
      }
    } catch (error) {
      console.error("Error creating group:", error)
      toast.error("Failed to create group")
    } finally {
      setIsCreating(false)
    }
  }

  // Reset and close
  const resetAndClose = () => {
    setSearchQuery("")
    setGroupName("")
    setSelectedUsers([])
    setStep("select-users")
    onClose()
  }

  return (
    <div
      className={`absolute top-0 left-0 w-full h-full bg-background flex flex-col z-20 transform transition-all duration-300 ease-in-out ${
        isOpen 
          ? "opacity-100 pointer-events-auto translate-x-0" 
          : "opacity-0 pointer-events-none -translate-x-full"
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 p-3 border-b">
        <Button variant="ghost" size="icon" onClick={goBack} className="h-9 w-9">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="font-medium">
          {step === "select-users" ? "Create Group" : "Set Group Name"}
        </h2>
        {step === "select-users" && selectedUsers.length > 0 && (
          <div className="ml-auto">
            <Button 
              size="sm" 
              onClick={goToNextStep}
              className="gap-1"
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Select Users Step */}
      {step === "select-users" && (
        <>
          {/* Search */}
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search users"
                className="pl-8 bg-muted/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Selected users */}
          {selectedUsers.length > 0 && (
            <div className="p-3 border-b">
              <div className="flex flex-wrap gap-2">
                {selectedUsers.map(user => (
                  <div key={user.id} className="flex items-center bg-muted rounded-full pl-1 pr-2 py-1">
                    <Avatar className="h-6 w-6 mr-1">
                      <Image src={user.avatar_url || "/placeholder.svg?height=24&width=24"} alt={user.name} width={24} height={24}  />
                    </Avatar>
                    <span className="text-xs">{user.name}</span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-5 w-5 p-0 ml-1"
                      onClick={() => toggleUserSelection(user)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User list */}
          <div className="flex-1 overflow-y-auto">
            {isLoadingUsers || isSearching ? (
              <div className="flex justify-center items-center h-20">
                <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : (searchResults.length > 0 ? (
              <div className="divide-y">
                {searchResults.map(user => {
                  const isSelected = selectedUsers.some(u => u.id === user.id)
                  return (
                    <div 
                      key={user.id} 
                      className="flex items-center justify-between p-3 hover:bg-muted/50"
                      onClick={() => toggleUserSelection(user)}
                    >
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10 mr-3">
                          <Image src={user.avatar_url || "/placeholder.svg?height=40&width=40"} alt={user.name} width={40} height={40} />
                        </Avatar>
                        <div>
                          <h3 className="text-sm font-medium">{user.name}</h3>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <Checkbox checked={isSelected} />
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <p className="text-sm">No users found</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Set Group Name Step */}
      {step === "set-name" && (
        <div className="p-4 flex-1">
          <div className="space-y-4">
            <div>
              <Label htmlFor="group-name">Group Name</Label>
              <Input
                id="group-name"
                placeholder="Enter group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="mt-1"
                autoFocus
              />
            </div>

            <div>
              <Label>Selected Members ({selectedUsers.length})</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedUsers.map(user => (
                  <div key={user.id} className="flex items-center bg-muted rounded-full pl-1 pr-2 py-1">
                    <Avatar className="h-6 w-6 mr-1">
                      <Image src={user.avatar_url || "/placeholder.svg?height=24&width=24"} alt={user.name} width={24} height={24} />
                    </Avatar>
                    <span className="text-xs">{user.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button 
              className="w-full mt-4" 
              onClick={createGroup}
              disabled={isCreating || !groupName.trim()}
            >
              {isCreating ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Users className="h-4 w-4 mr-2" />
                  Create Group
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}