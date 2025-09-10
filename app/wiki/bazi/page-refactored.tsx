'use client'

import { useEffect } from 'react'
import { Star } from 'lucide-react'
import MobileAppLayout, { MobileCard } from '@/components/MobileAppLayout'
import WikiSearchBar from '@/components/wiki/WikiSearchBar'
import WikiCategoryFilter from '@/components/wiki/WikiCategoryFilter'
import WikiArticleList from '@/components/wiki/WikiArticleList'
import { useWikiStore, useWikiArticles, useWikiIsLoading } from '@/stores/wiki-store'
import { baziWikiData } from '@/lib/data/wiki-data'

export default function BaziWikiPageRefactored() {
  const { setCurrentSection, initializeWiki } = useWikiStore()
  const articles = useWikiArticles()
  const isLoading = useWikiIsLoading()

  // 初始化数据
  useEffect(() => {
    initializeWiki()
    setCurrentSection('bazi')
  }, [])

  if (isLoading) {
    return (
      <MobileAppLayout title="八字基础">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading...</p>
          </div>
        </div>
      </MobileAppLayout>
    )
  }

  return (
    <MobileAppLayout title="八字基础">
      <div className="min-h-screen bg-gray-50">
        <div className="p-4 space-y-6">
          {/* 搜索框 */}
          <WikiSearchBar placeholder="我什么时候能脱单？点搜索看看" />

          {/* 分类介绍 */}
          <MobileCard className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Star className="w-5 h-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-purple-800">{baziWikiData.name}</h3>
                <p className="text-sm text-purple-600 mt-1">
                  {baziWikiData.description}
                </p>
              </div>
            </div>
          </MobileCard>

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
    </MobileAppLayout>
  )
} 