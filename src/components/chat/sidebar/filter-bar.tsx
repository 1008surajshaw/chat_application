"use client"

import { useState, useRef, useEffect } from "react"
import { Search, Filter, X, Users } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface FilterBarProps {
  searchQuery: string
  setSearchQuery: (query: string) => void
  onSaveFilter: () => void
  customFilterName: string
  setCustomFilterName: (name: string) => void
  onCreateGroup: () => void
}

export default function FilterBar({
  searchQuery,
  setSearchQuery,
  onSaveFilter,
  customFilterName,
  setCustomFilterName,
  onCreateGroup
}: FilterBarProps) {
  const [isSearchExpanded, setIsSearchExpanded] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Handle click outside to collapse search
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
      // Focus the input when expanding
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 100)
    }
  }

  return (
    <div className="flex items-center gap-2 p-3 border-b overflow-hidden">
      {/* Custom filter button - hidden when search is expanded */}
      <div
        className={`transition-all duration-300 ease-in-out flex items-center ${
          isSearchExpanded ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100"
        }`}
      >
        <Button
          variant="ghost"
          className="text-xs font-normal justify-start h-auto text-green-500 flex items-center whitespace-nowrap"
        >
          <Filter className="h-4 w-4 mr-1" />
          Custom filter
        </Button>
      </div>

      {/* Save button - hidden when search is expanded */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isSearchExpanded ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100"
        }`}
      >
        <Button
          variant="ghost"
          size="sm"
          className="text-xs font-normal h-auto py-1 whitespace-nowrap"
          onClick={onSaveFilter}
        >
          Save
        </Button>
      </div>

      {/* Search input - expands when clicked */}
      <div className={`relative transition-all duration-300 ease-in-out ${isSearchExpanded ? "flex-1" : "w-40"}`}>
        <div
          className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground cursor-pointer z-10"
          onClick={toggleSearch}
          data-search-toggle
        >
          {isSearchExpanded ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
        </div>
        <Input
          ref={searchInputRef}
          type="text"
          placeholder="Search"
          className="pl-8 h-9 text-sm transition-all duration-300 ease-in-out"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onClick={() => !isSearchExpanded && setIsSearchExpanded(true)}
        />
      </div>

      {/* Create Group button - hidden when search is expanded */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isSearchExpanded ? "w-0 opacity-0 overflow-hidden" : "w-auto opacity-100"
        }`}
      >
        <Button
          variant="ghost"
          className="text-xs font-normal h-auto py-1 text-green-500 flex items-center whitespace-nowrap"
          onClick={onCreateGroup}
        >
          <Users className="h-4 w-4 mr-1" />
          Create Group
        </Button>
      </div>
    </div>
  )
}