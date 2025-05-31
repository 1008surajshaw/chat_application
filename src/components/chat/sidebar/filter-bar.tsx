"use client"

import { useState, useRef, useEffect } from "react"
import { Search, X, Users } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { RiFolderDownloadFill } from "react-icons/ri";


interface FilterBarProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  onSaveFilter: () => void
  customFilterName: string
  setCustomFilterName: (name: string) => void
  onCreateGroup: () => void
  onManageLabels: () => void
}

export default function FilterBar({
  searchQuery,
  setSearchQuery,
  onSaveFilter,

  onCreateGroup,
  onManageLabels
}: FilterBarProps) {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isSearchExpanded && searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        // Don't collapse if clicking on the search icon/button
        const target = event.target as HTMLElement
        if (target.closest("[data-search-toggle]")) {
          return
        }
        setIsSearchExpanded(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isSearchExpanded])

  const toggleSearch = () => {
    setIsSearchExpanded(!isSearchExpanded)
    if (!isSearchExpanded && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    }
  }

  return (
    <div className="flex items-center gap-2 p-3.5 border-b overflow-hidden">
      
      <div className="flex items-center space-x-1">
          <div
            className={`transition-all duration-300 ease-in-out flex items-center ${
              isSearchExpanded ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100"
            }`}
          >
            <button
              className="flex items-center text-sm font-bold h-auto text-green-700 whitespace-nowrap px-0 cursor-pointer"
              onClick={onManageLabels}
              type="button"
            >
              <RiFolderDownloadFill className="h-4 w-4 mr-1" />
              <span className="text-xs">Custom filter</span>
            </button>
          </div>

          <div
            className={`transition-all duration-300 ease-in-out ${
              isSearchExpanded ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100"
            }`}
          >
            <Button
              variant="outline"
              size="sm"
              className="text-xs font-normal h-auto py-1 whitespace-nowrap rounded-sm"
              onClick={onSaveFilter}
            >
              Save
            </Button>
          </div>
        </div>
 
        <div className={`relative transition-all duration-300 ease-in-out ${isSearchExpanded ? "flex-1" : "w-40"}`}>
          <div
            className="absolute left-2.5 top-1.5 h-5 w-4 text-muted-foreground cursor-pointer z-10"
            onClick={toggleSearch}
            data-search-toggle
          >
            {isSearchExpanded ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
          </div>
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search"
            className="pl-9 h-7 text-base transition-all duration-300 ease-in-out"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onClick={() => !isSearchExpanded && setIsSearchExpanded(true)}
          />
        </div>

        <div
          className={`transition-all duration-300 ease-in-out ${
            isSearchExpanded ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100"
          }`}
        >
          <Button
            variant="outline"
            className="text-xs font-bold h-7 text-green-700 flex items-center whitespace-nowrap "
            onClick={onCreateGroup}
          >
            <Users className="h-4 w-4 mr-1" />
              Filtered
          </Button>
        </div>


    </div>
  )
}
