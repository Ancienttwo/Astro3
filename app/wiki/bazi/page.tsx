'use client'

import { useEffect } from 'react'
import { Star } from 'lucide-react'
import MobileAppLayout, { MobileCard } from '@/components/MobileAppLayout'
import { AdaptiveLayout } from '@/components/layout/adaptive-layout'
import { useIsMobile } from '@/hooks/useDeviceType'
import WikiSearchBar from '@/components/wiki/WikiSearchBar'
import WikiCategoryFilter from '@/components/wiki/WikiCategoryFilter'
import WikiArticleList from '@/components/wiki/WikiArticleList'
import { useWikiStore, useWikiArticles, useWikiIsLoading } from '@/stores/wiki-store'
import { baziWikiData } from '@/lib/data/wiki-data'

export default function BaziWikiPage() {
  const { setCurrentSection, initializeWiki } = useWikiStore()
  const articles = useWikiArticles()
  const isLoading = useWikiIsLoading()
  const isMobile = useIsMobile()

  useEffect(() => {
    initializeWiki()
    setCurrentSection('bazi')
  }, [])

  // 页面内容组件
  const pageContent = (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-4 space-y-6">
        {/* 搜索框 */}
        <WikiSearchBar placeholder="我什么时候能脱单？点搜索看看" />

        {/* 分类介绍 */}
        <div className={`${isMobile ? 'rounded-xl border bg-card p-4' : 'bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4'}`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
              <Star className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-purple-800 dark:text-purple-200">{baziWikiData.name}</h3>
              <p className="text-sm text-purple-600 dark:text-purple-300 mt-1">
                {baziWikiData.description}
              </p>
            </div>
          </div>
        </div>

        {/* 分类筛选 */}
        <WikiCategoryFilter categories={baziWikiData.categories} />

        {/* 文章列表 */}
        <WikiArticleList
          articles={articles}
          title="学习内容"
          showTags={true}
          emptyMessage="没有找到相关内容"
        />
      </div>
    </div>
  )

  if (isLoading) {
    const loadingContent = (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    )

    return isMobile ? (
      <MobileAppLayout title="八字基础">
        {loadingContent}
      </MobileAppLayout>
    ) : (
      <AdaptiveLayout>
        {loadingContent}
      </AdaptiveLayout>
    )
  }

  return isMobile ? (
    <MobileAppLayout title="八字基础">
      {pageContent}
    </MobileAppLayout>
  ) : (
    <AdaptiveLayout>
      {pageContent}
    </AdaptiveLayout>
  )
} 