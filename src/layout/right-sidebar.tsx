import { Clipboard, Download, Maximize2, RefreshCw, User, Users } from "lucide-react"

export function RightSidebar() {
  return (
    <div className="w-14 border-l flex flex-col items-center py-4 space-y-6 bg-white">
      <button className="text-gray-400 hover:text-gray-600">
        <RefreshCw size={18} />
      </button>
      <button className="text-gray-400 hover:text-gray-600">
        <Download size={18} />
      </button>
      <button className="text-gray-400 hover:text-gray-600">
        <Maximize2 size={18} />
      </button>
      <button className="text-gray-400 hover:text-gray-600">
        <Clipboard size={18} />
      </button>
      <button className="text-gray-400 hover:text-gray-600">
        <Users size={18} />
      </button>
      <button className="text-gray-400 hover:text-gray-600">
        <User size={18} />
      </button>
    </div>
  )
}
