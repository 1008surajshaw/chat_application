import { HomeIcon, MessageCircle, Settings } from "lucide-react"
import {
  ChannelsIcon,
  AnalyticsIcon,
  TeamsIcon,
  ContactsIcon,
  GalleryIcon,
  IntegrationsIcon,
} from "@/components/icons/sidebar-icons"

export function LeftSidebar() {
  return (
    <div className="w-14 bg-white border-r flex flex-col items-center py-4 space-y-6 justify-between">
      <div className="flex flex-col items-center space-y-6">
        <div className="text-gray-500 hover:text-green-600 cursor-pointer">
          <HomeIcon size={20} />
        </div>
        <div className="text-green-600">
          <MessageCircle size={20} />
        </div>
        <div className="text-gray-500 hover:text-green-600 cursor-pointer">
          <ChannelsIcon />
        </div>
       
        <div className="text-gray-500 hover:text-green-600 cursor-pointer  border-t bg-sidebar pt-1">
          <AnalyticsIcon />
        </div>
        <div className="text-gray-500 hover:text-green-600 cursor-pointer">
          <TeamsIcon />
        </div>
        <div className="text-gray-500 hover:text-green-600 cursor-pointer  border-t bg-sidebar pt-1">
          <ContactsIcon />
        </div>
        <div className="text-gray-500 hover:text-green-600 cursor-pointer">
          <GalleryIcon />
        </div>
        <div className="text-gray-500 hover:text-green-600 cursor-pointer  border-t bg-sidebar pt-1">
          <IntegrationsIcon />
        </div>
        <div className="text-gray-500 hover:text-green-600 cursor-pointer">
          <Settings size={20} />
        </div>
      </div>

      <div className="flex flex-col items-center space-y-4">

        <div className="text-gray-500 hover:text-green-600 cursor-pointer">
          <IntegrationsIcon />
        </div>
        <div className="text-gray-500 hover:text-green-600 cursor-pointer">
          <Settings size={20} />
        </div>
      </div>
    </div>
  )
}
