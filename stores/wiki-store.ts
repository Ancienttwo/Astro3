import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { WikiArticle, WikiFilterState, WikiSection } from '@/types/wiki'
import { allWikiData, searchArticles, getAllArticles, getHotArticles, getNewArticles, getFreeArticles } from '@/lib/data/wiki-data'

interface WikiStore {
  // 状态
  filterState: WikiFilterState
  articles: WikiArticle[]
  filteredArticles: WikiArticle[]
  hotArticles: WikiArticle[]
  newArticles: WikiArticle[]
  freeArticles: WikiArticle[]
  currentSection: WikiSection | null
  isLoading: boolean
  error: string | null
  
  // 操作方法
  setSearchQuery: (query: string) => void
  setActiveCategory: (category: string) => void
  toggleTag: (tag: string) => void
  setShowFreeOnly: (showFree: boolean) => void
  setSortBy: (sortBy: string) => void
  setCurrentSection: (sectionId: string) => void
  resetFilters: () => void
  searchWiki: (query: string, sectionId?: string) => void
  
  // 初始化和加载数据
  initializeWiki: () => void
  loadHotArticles: () => void
  loadNewArticles: () => void
  loadFreeArticles: () => void
  
  // 计算方法
  getFilteredArticles: () => WikiArticle[]
  getArticlesByCategory: (categoryId: string) => WikiArticle[]
  getArticlesByTag: (tagId: string) => WikiArticle[]
}

const initialFilterState: WikiFilterState = {
  searchQuery: '',
  activeCategory: 'all',
  selectedTags: [],
  showFreeOnly: false,
  sortBy: 'views'
}

export const useWikiStore = create<WikiStore>()(
  immer((set, get) => ({
    // 初始状态
    filterState: initialFilterState,
    articles: [],
    filteredArticles: [],
    hotArticles: [],
    newArticles: [],
    freeArticles: [],
    currentSection: null,
    isLoading: false,
    error: null,
    
    // 设置搜索查询
    setSearchQuery: (query: string) => {
      set((state) => {
        state.filterState.searchQuery = query
        state.filteredArticles = get().getFilteredArticles()
      })
    },
    
    // 设置当前分类
    setActiveCategory: (category: string) => {
      set((state) => {
        state.filterState.activeCategory = category
        state.filteredArticles = get().getFilteredArticles()
      })
    },
    
    // 切换标签
    toggleTag: (tag: string) => {
      set((state) => {
        const index = state.filterState.selectedTags.indexOf(tag)
        if (index > -1) {
          state.filterState.selectedTags.splice(index, 1)
        } else {
          state.filterState.selectedTags.push(tag)
        }
        state.filteredArticles = get().getFilteredArticles()
      })
    },
    
    // 设置只显示免费文章
    setShowFreeOnly: (showFree: boolean) => {
      set((state) => {
        state.filterState.showFreeOnly = showFree
        state.filteredArticles = get().getFilteredArticles()
      })
    },
    
    // 设置排序方式
    setSortBy: (sortBy: string) => {
      set((state) => {
        state.filterState.sortBy = sortBy
        state.filteredArticles = get().getFilteredArticles()
      })
    },
    
    // 设置当前知识库板块
    setCurrentSection: (sectionId: string) => {
      set((state) => {
        state.currentSection = allWikiData[sectionId as keyof typeof allWikiData] || null
        if (state.currentSection) {
          state.articles = state.currentSection.categories.flatMap(c => c.articles)
          state.filteredArticles = get().getFilteredArticles()
        }
      })
    },
    
    // 重置筛选器
    resetFilters: () => {
      set((state) => {
        state.filterState = { ...initialFilterState }
        state.filteredArticles = get().getFilteredArticles()
      })
    },
    
    // 搜索百科
    searchWiki: (query: string, sectionId?: string) => {
      set((state) => {
        state.isLoading = true
        state.error = null
      })
      
      try {
        const results = searchArticles(query, sectionId)
        set((state) => {
          state.articles = results
          state.filteredArticles = results
          state.isLoading = false
        })
      } catch (error) {
        set((state) => {
          state.error = error instanceof Error ? error.message : '搜索失败'
          state.isLoading = false
        })
      }
    },
    
    // 初始化百科数据
    initializeWiki: () => {
      set((state) => {
        state.articles = getAllArticles()
        state.filteredArticles = getAllArticles()
        state.hotArticles = getHotArticles()
        state.newArticles = getNewArticles()
        state.freeArticles = getFreeArticles()
      })
    },
    
    // 加载热门文章
    loadHotArticles: () => {
      set((state) => {
        state.hotArticles = getHotArticles()
      })
    },
    
    // 加载最新文章
    loadNewArticles: () => {
      set((state) => {
        state.newArticles = getNewArticles()
      })
    },
    
    // 加载免费文章
    loadFreeArticles: () => {
      set((state) => {
        state.freeArticles = getFreeArticles()
      })
    },
    
    // 获取筛选后的文章
    getFilteredArticles: () => {
      const { filterState, articles, currentSection } = get()
      let filtered = articles
      
      // 按分类筛选
      if (filterState.activeCategory !== 'all') {
        filtered = filtered.filter(article => article.category === filterState.activeCategory)
      }
      
      // 按标签筛选
      if (filterState.selectedTags.length > 0) {
        filtered = filtered.filter(article => 
          filterState.selectedTags.some(tag => article.tags.includes(tag))
        )
      }
      
      // 按免费状态筛选
      if (filterState.showFreeOnly) {
        filtered = filtered.filter(article => article.isFree)
      }
      
      // 按搜索查询筛选
      if (filterState.searchQuery.trim()) {
        filtered = filtered.filter(article => 
          article.title.toLowerCase().includes(filterState.searchQuery.toLowerCase()) ||
          article.description.toLowerCase().includes(filterState.searchQuery.toLowerCase()) ||
          article.tags.some(tag => tag.toLowerCase().includes(filterState.searchQuery.toLowerCase()))
        )
      }
      
      // 排序 - 创建副本以避免修改只读数组
      filtered = [...filtered].sort((a, b) => {
        switch (filterState.sortBy) {
          case 'views':
            return b.views - a.views
          case 'comments':
            return b.comments - a.comments
          case 'date':
            return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
          case 'difficulty':
            const difficultyOrder = { 'entry': 0, 'intermediate': 1, 'advanced': 2 }
            return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
          default:
            return 0
        }
      })
      
      return filtered
    },
    
    // 按分类获取文章
    getArticlesByCategory: (categoryId: string) => {
      const { articles } = get()
      return articles.filter(article => article.category === categoryId)
    },
    
    // 按标签获取文章
    getArticlesByTag: (tagId: string) => {
      const { articles } = get()
      return articles.filter(article => article.tags.includes(tagId))
    }
  }))
)

// 选择器
export const useWikiFilters = () => useWikiStore((state) => state.filterState)
export const useWikiArticles = () => useWikiStore((state) => state.filteredArticles)
export const useWikiHotArticles = () => useWikiStore((state) => state.hotArticles)
export const useWikiNewArticles = () => useWikiStore((state) => state.newArticles)
export const useWikiCurrentSection = () => useWikiStore((state) => state.currentSection)
export const useWikiIsLoading = () => useWikiStore((state) => state.isLoading)
export const useWikiError = () => useWikiStore((state) => state.error) 