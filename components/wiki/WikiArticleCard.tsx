'use client'

import { useRouter } from 'next/navigation'
import { BookOpen, Eye, MessageCircle, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { MobileCard } from '@/components/MobileAppLayout'
import type { WikiArticle } from '@/types/wiki'
import { DIFFICULTY_LEVELS, ARTICLE_STATUS } from '@/types/wiki'

interface WikiArticleCardProps {
  article: WikiArticle
  showCategory?: boolean
  showTags?: boolean
  className?: string
}

export default function WikiArticleCard({ 
  article, 
  showCategory = false, 
  showTags = true,
  className = '' 
}: WikiArticleCardProps) {
  const router = useRouter()

  const handleClick = () => {
    router.push(article.href)
  }

  const getTagColor = (tag: string) => {
    if (tag.includes('桃花') || tag.includes('感情') || tag.includes('婚姻')) {
      return 'bg-pink-100 text-pink-600'
    }
    if (tag.includes('事业') || tag.includes('财运') || tag.includes('职业')) {
      return 'bg-yellow-100 text-yellow-600'
    }
    if (tag.includes('健康') || tag.includes('养生')) {
      return 'bg-green-100 text-green-600'
    }
    return 'bg-gray-100 text-gray-600'
  }

  return (
    <MobileCard
      onClick={handleClick}
      className={`cursor-pointer hover:shadow-md transition-all duration-200 ${className}`}
    >
      <div className="flex items-start space-x-3">
        {/* 文章图标 */}
        <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-5 h-5 text-purple-600" />
        </div>
        
        {/* 文章内容 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-medium text-gray-900 text-sm leading-tight pr-2">
              {article.title}
            </h3>
            <div className="flex items-center space-x-1 flex-shrink-0">
              {article.isNew && (
                <Badge className={ARTICLE_STATUS.new.color + ' text-xs px-2 py-0.5'}>
                  {ARTICLE_STATUS.new.label}
                </Badge>
              )}
              {article.isHot && (
                <Badge className={ARTICLE_STATUS.hot.color + ' text-xs px-2 py-0.5'}>
                  {ARTICLE_STATUS.hot.label}
                </Badge>
              )}
            </div>
          </div>
          
          {/* 描述 */}
          <p className="text-xs text-gray-500 mb-2 line-clamp-1">
            {article.description}
          </p>
          
          {/* 标签 */}
          {showTags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {article.tags.slice(0, 2).map((tag, index) => (
                <Badge 
                  key={index} 
                  className={`text-xs px-2 py-0.5 ${getTagColor(tag)}`}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          
          {/* 底部信息 */}
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-3">
              {article.isFree && (
                <span className={ARTICLE_STATUS.free.color + ' px-2 py-0.5 rounded'}>
                  {ARTICLE_STATUS.free.label}
                </span>
              )}
              {showCategory && (
                <Badge variant="outline" className="text-xs">
                  {article.category}
                </Badge>
              )}
              <div className="flex items-center space-x-1">
                <Eye className="w-3 h-3" />
                <span>{article.views}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageCircle className="w-3 h-3" />
                <span>{article.comments}</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{article.readTime}</span>
              </div>
              <Badge className={`text-xs px-2 py-0.5 ${DIFFICULTY_LEVELS[article.difficulty].color}`}>
                {DIFFICULTY_LEVELS[article.difficulty].label}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </MobileCard>
  )
} 