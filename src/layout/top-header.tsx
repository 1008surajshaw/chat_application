import { Button } from "@/components/ui/button"
import {
  ChevronDown,
  Download,
  HelpCircle,
  Maximize2,
  Menu,
  MessageCircle,
  Phone,
  RefreshCw,
} from "lucide-react"

export function TopHeader() {
  return (
    <div className="h-12 bg-white border-b flex items-center justify-between px-4">
      <div className="flex items-center space-x-4">
        <div className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center text-white text-sm font-medium">
          F
        </div>
        <div className="flex items-center space-x-1 text-gray-600">
          <MessageCircle size={16} className="text-gray-400" />
          <span className="text-sm">chats</span>
        </div>
      </div>

      <div className="flex items-center space-x-5">
        <Button variant="outline">
          <RefreshCw size={16} />
          <span className="text-sm">Refresh</span>
        </Button>

        <Button variant="outline">
          <HelpCircle size={16} />
          <span className="text-sm">Help</span>
        </Button>

        <Button variant="outline">
          <Phone size={16} className="text-yellow-500" />
          <span className="text-sm font-medium">5/6 phones</span>
          <ChevronDown size={14} />
        </Button>
        

        <div className="flex items-center space-x-4">
          <Button variant="outline">
            <Download size={20} />
          </Button>
          <Button variant="outline">
            <Maximize2 size={20} />
          </Button>
          <Button variant="outline">
            <Menu size={20} />
          </Button >
        
        </div>
      </div>
    </div>
  )
}
