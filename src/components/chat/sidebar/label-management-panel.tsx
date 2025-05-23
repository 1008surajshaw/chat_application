"use client"

import { useRef, useEffect, useState } from "react"
import { ArrowLeft, Tag, Plus, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { Chat } from "@/interface/interface"
import { useChatStore } from "@/store/chat-store"
import { useAuth } from "@/providers/auth-provider"

interface LabelManagementPanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function LabelManagementPanel({ 
  isOpen, 
  onClose
}: LabelManagementPanelProps) {
  const { user } = useAuth();
  const { chats, createNewLabel, fetchChats } = useChatStore();
  
  const [labelName, setLabelName] = useState("")
  const [labelColor, setLabelColor] = useState("#22c55e") // Default green color
  const [selectedChats, setSelectedChats] = useState<string[]>([])
  const [isCreating, setIsCreating] = useState(false)
  
  const colors = [
    "#22c55e", // green
    "#3b82f6", // blue
    "#a855f7", // purple
    "#f97316", // orange
    "#ef4444", // red
    "#06b6d4", // cyan
  ]

  const handleCreateLabel = async () => {
    if (!labelName.trim()) {
      toast.error("Please enter a label name")
      return
    }

    if (selectedChats.length === 0) {
      toast.error("Please select at least one chat")
      return
    }

    setIsCreating(true)
    try {
      const success = await createNewLabel(labelName, labelColor, selectedChats);
      
      if (success) {
        toast.success("Label created and added to chats");
        
        // Refresh chats to show updated labels
        await fetchChats(); // No need to pass userId anymore
        
        resetAndClose();
      } else {
        toast.error("Failed to create label");
      }
    } catch (error) {
      console.error("Error creating label:", error);
      toast.error("Failed to create label");
    } finally {
      setIsCreating(false);
    }
  }

  const toggleChatSelection = (chatId: string) => {
    if (selectedChats.includes(chatId)) {
      setSelectedChats(selectedChats.filter(id => id !== chatId));
    } else {
      setSelectedChats([...selectedChats, chatId]);
    }
  }

  const resetAndClose = () => {
    setLabelName("");
    setLabelColor("#22c55e");
    setSelectedChats([]);
    onClose();
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
        <Button variant="ghost" size="icon" onClick={resetAndClose} className="h-9 w-9">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h2 className="font-medium">Create Custom Filter</h2>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <div className="space-y-4">
          <div>
            <Label htmlFor="label-name">Label Name</Label>
            <Input
              id="label-name"
              placeholder="Enter label name"
              value={labelName}
              onChange={(e) => setLabelName(e.target.value)}
              className="mt-1"
              autoFocus
            />
          </div>

          <div>
            <Label>Label Color</Label>
            <div className="flex gap-2 mt-2">
              {colors.map(color => (
                <button
                  key={color}
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    labelColor === color ? 'ring-2 ring-offset-2 ring-black dark:ring-white' : ''
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setLabelColor(color)}
                >
                  {labelColor === color && <Check className="h-4 w-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>Select Chats</Label>
            <div className="mt-2 space-y-1 max-h-60 overflow-y-auto border rounded-md p-1">
              {chats.length > 0 ? (
                chats.map(chat => {
                  const isSelected = selectedChats.includes(chat.id);
                  return (
                    <div 
                      key={chat.id} 
                      className={`flex items-center justify-between p-2 hover:bg-muted/50 rounded-md cursor-pointer ${
                        isSelected ? 'bg-muted' : ''
                      }`}
                      onClick={() => toggleChatSelection(chat.id)}
                    >
                      <div className="flex items-center">
                        <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: labelColor }}></div>
                        <span className="text-sm">{chat.title}</span>
                      </div>
                      {isSelected && <Check className="h-4 w-4 text-green-500" />}
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  No chats available
                </div>
              )}
            </div>
          </div>

          <Button 
            className="w-full mt-4" 
            onClick={handleCreateLabel}
            disabled={isCreating || !labelName.trim() || selectedChats.length === 0}
          >
            {isCreating ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <Tag className="h-4 w-4 mr-2" />
                Create Label
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
