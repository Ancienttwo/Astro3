'use client'

import { useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useWikiStore } from '@/stores/wiki-store'

interface WikiSearchBarProps {
  placeholder?: string
  onSearch?: (query: string) => void
}

export default function WikiSearchBar({ 
  placeholder = "搜索命理知识...", 
  onSearch 
}: WikiSearchBarProps) {
  const [localQuery, setLocalQuery] = useState('')
  const { setSearchQuery } = useWikiStore()

  const handleSearch = () => {
    const trimmedQuery = localQuery.trim()
    setSearchQuery(trimmedQuery)
    onSearch?.(trimmedQuery)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
      <Input
        placeholder={placeholder}
        value={localQuery}
        onChange={(e) => setLocalQuery(e.target.value)}
        onKeyPress={handleKeyPress}
        className="pl-10 h-12 bg-white border-gray-200 focus:border-purple-500 focus:ring-purple-500"
      />
    </div>
  )
} 