'use client'

import { BookOpen } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import WikiArticleCard from './WikiArticleCard'
import type { WikiArticle } from '@/types/wiki'

interface WikiArticleListProps {
  articles: WikiArticle[]
  title?: string
  showCategory?: boolean
  showTags?: boolean
  emptyMessage?: string
  className?: string
}

export default function WikiArticleList({ 
  articles, 
  title = '学习内容',
  showCategory = false,
  showTags = true,
  emptyMessage = '没有找到相关内容',
  className = ''
}: WikiArticleListProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* 标题 */}
      {title && (
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <Badge variant="outline" className="text-xs">
            {articles.length} 篇文章
          </Badge>
        </div>
      )}

      {/* 文章列表 */}
      {articles.length > 0 ? (
        <div className="space-y-3">
          {articles.map((article) => (
            <WikiArticleCard
              key={article.id}
              article={article}
              showCategory={showCategory}
              showTags={showTags}
            />
          ))}
        </div>
      ) : (
        /* 空状态 */
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">{emptyMessage}</p>
          <p className="text-sm text-gray-400 mt-1">试试其他关键词或分类</p>
        </div>
      )}
    </div>
  )
} 