"use client"

import { X, Bell, Lock, Clock, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import Image from "next/image"

interface ProfilePanelProps {
  onClose: () => void
}

export default function ProfilePanel({ onClose }: ProfilePanelProps) {
  return (
    <div className="flex flex-col h-full bg-sidebar">
      {/* Header */}
      <div className="flex items-center p-3 border-b">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
        <h3 className="ml-4 font-medium">Contact info</h3>
      </div>

      {/* Profile Info */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col items-center p-6 bg-background">
          <Avatar className="h-32 w-32 mb-4">
            <Image src="/placeholder.svg?height=128&width=128" alt="Profile" width={128} height={128} />
          </Avatar>
          <h2 className="text-xl font-semibold">Test El Centro</h2>
          <p className="text-sm text-muted-foreground">+1 98765 43210</p>
        </div>

        <div className="p-4">
          <p className="text-sm text-muted-foreground mb-1">About</p>
          <p className="text-sm">Available</p>
        </div>

        <Separator />

        <div className="p-4">
          <div className="flex items-center mb-4">
            <Bell className="h-5 w-5 mr-4 text-muted-foreground" />
            <div>
              <p className="text-sm">Mute notifications</p>
            </div>
          </div>

          <div className="flex items-center mb-4">
            <ImageIcon className="h-5 w-5 mr-4 text-muted-foreground" />
            <div>
              <p className="text-sm">Media, links and docs</p>
              <p className="text-xs text-muted-foreground">20 items</p>
            </div>
          </div>

          <div className="flex items-center mb-4">
            <Lock className="h-5 w-5 mr-4 text-muted-foreground" />
            <div>
              <p className="text-sm">Encryption</p>
              <p className="text-xs text-muted-foreground">Messages are end-to-end encrypted</p>
            </div>
          </div>

          <div className="flex items-center mb-4">
            <Clock className="h-5 w-5 mr-4 text-muted-foreground" />
            <div>
              <p className="text-sm">Disappearing messages</p>
              <p className="text-xs text-muted-foreground">Off</p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="p-4">
          <Button variant="destructive" className="w-full">
            Block
          </Button>
        </div>
      </div>
    </div>
  )
}
