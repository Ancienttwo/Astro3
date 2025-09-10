// SEO元数据生成工具
import { Metadata } from 'next'

export interface SEOConfig {
  title: string
  description: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article' | 'profile'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  locale?: 'zh-CN' | 'en-US'
}

const defaultConfig = {
  siteName: 'AstroZi',
  siteUrl: 'https://astrozi.com',
  defaultImage: '/logo.png',
  twitterHandle: '@astrozi',
  locale: 'zh-CN' as const
}

export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    keywords = [],
    image = defaultConfig.defaultImage,
    url,
    type = 'website',
    publishedTime,
    modifiedTime,
    author,
    locale = defaultConfig.locale
  } = config

  const fullTitle = title.includes(defaultConfig.siteName) 
    ? title 
    : `${title} | ${defaultConfig.siteName}`

  const fullUrl = url ? `${defaultConfig.siteUrl}${url}` : defaultConfig.siteUrl
  const fullImage = image.startsWith('http') ? image : `${defaultConfig.siteUrl}${image}`

  const metadata: Metadata = {
    title: fullTitle,
    description,
    keywords: keywords.join(', '),
    
    // Open Graph
    openGraph: {
      title: fullTitle,
      description,
      url: fullUrl,
      siteName: defaultConfig.siteName,
      images: [
        {
          url: fullImage,
          width: 1200,
          height: 630,
          alt: title
        }
      ],
      locale,
      type,
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },

    // Twitter
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [fullImage],
      site: defaultConfig.twitterHandle,
      creator: defaultConfig.twitterHandle,
    },

    // Additional
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    ...(author && { authors: [{ name: author }] }),
    
    // Canonical URL
    alternates: {
      canonical: fullUrl,
      languages: {
        'zh-CN': `${defaultConfig.siteUrl}${url || ''}`,
        'en-US': `${defaultConfig.siteUrl}/en${url || ''}`,
      }
    }
  }

  return metadata
}

// 预设的页面SEO配置
export const pageSEOConfigs = {
  home: {
    title: 'AstroZi - AI生命工程平台',
    description: '专业的紫微斗数和八字命理AI分析平台，结合传统智慧与现代科技，为您提供精准的命理解读和人生指导。',
    keywords: ['紫微斗数', '八字命理', 'AI算命', '命理分析', '人生指导', '传统文化'],
    type: 'website' as const
  },
  
  ziwei: {
    title: '紫微斗数排盘 - 专业命盘分析',
    description: '免费紫微斗数排盘工具，精准计算命宫、十二宫位、主星分布，提供详细的命理解读和人生分析。',
    keywords: ['紫微斗数', '排盘', '命宫', '十二宫', '主星', '命理分析'],
    type: 'article' as const
  },

  bazi: {
    title: '八字排盘 - 四柱八字分析',
    description: '专业八字排盘工具，精确计算生辰八字、五行分析、十神关系，提供全面的命理解读服务。',
    keywords: ['八字', '四柱', '生辰八字', '五行', '十神', '命理'],
    type: 'article' as const
  },

  wiki: {
    title: '命理百科 - 传统文化知识库',
    description: '深入了解紫微斗数、八字命理、五行学说等传统文化知识，专业解读古典智慧的现代应用。',
    keywords: ['命理百科', '传统文化', '五行', '易经', '国学', '命理知识'],
    type: 'article' as const
  }
}

// 动态生成文章SEO
export function generateArticleSEO(article: {
  title: string
  description: string
  category: string
  publishedAt?: string
  updatedAt?: string
  author?: string
  tags?: string[]
  slug: string
}): SEOConfig {
  return {
    title: `${article.title} - ${article.category}`,
    description: article.description,
    keywords: article.tags || [],
    url: `/wiki/${article.slug}`,
    type: 'article',
    publishedTime: article.publishedAt,
    modifiedTime: article.updatedAt,
    author: article.author
  }
}