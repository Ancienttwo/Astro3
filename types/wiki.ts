// 百科系统类型定义
export interface WikiArticle {
  id: string
  title: string
  description: string
  category: string
  tags: string[]
  readTime: string
  views: number
  comments: number
  difficulty: 'entry' | 'intermediate' | 'advanced'
  isFree: boolean
  isNew?: boolean
  isHot?: boolean
  href: string
  content?: string
  publishDate: string
  lastUpdated: string
}

export interface WikiCategory {
  id: string
  name: string
  description: string
  icon: string
  color: string
  bgColor: string
  borderColor: string
  articles: WikiArticle[]
}

export interface WikiTag {
  id: string
  name: string
  color: string
  count: number
}

export interface WikiSection {
  id: string
  name: string
  description: string
  categories: WikiCategory[]
  tags: WikiTag[]
}

export interface WikiSearchParams {
  query: string
  category: string
  tags: string[]
  difficulty: string[]
  isFree?: boolean
  sortBy: 'views' | 'comments' | 'date' | 'difficulty'
  sortOrder: 'asc' | 'desc'
}

export interface WikiFilterState {
  searchQuery: string
  activeCategory: string
  selectedTags: string[]
  showFreeOnly: boolean
  sortBy: string
}

// 难度级别配置
export const DIFFICULTY_LEVELS = {
  entry: { label: '入门', color: 'bg-green-100 text-green-600' },
  intermediate: { label: '进阶', color: 'bg-blue-100 text-blue-600' },
  advanced: { label: '高级', color: 'bg-purple-100 text-purple-600' }
} as const

// 文章状态配置
export const ARTICLE_STATUS = {
  new: { label: '新', color: 'bg-red-500 text-white' },
  hot: { label: '热', color: 'bg-orange-500 text-white' },
  free: { label: '免费', color: 'bg-yellow-100 text-yellow-600' }
} as const 