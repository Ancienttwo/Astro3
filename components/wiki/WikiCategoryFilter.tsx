'use client'

import { useWikiStore } from '@/stores/wiki-store'
import type { WikiCategory } from '@/types/wiki'

interface WikiCategoryFilterProps {
  categories: WikiCategory[]
  showAll?: boolean
}

export default function WikiCategoryFilter({ 
  categories, 
  showAll = true 
}: WikiCategoryFilterProps) {
  const { filterState, setActiveCategory } = useWikiStore()

  const allCategories = showAll 
    ? [{ id: 'all', name: '全部', color: 'bg-purple-100 text-purple-600' }, ...categories]
    : categories

  return (
    <div className="overflow-x-auto">
      <div className="flex space-x-3 pb-2">
        {allCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`
              px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
              ${filterState.activeCategory === category.id
                ? category.color || 'bg-purple-100 text-purple-600'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }
            `}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  )
} 