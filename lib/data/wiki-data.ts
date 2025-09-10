import { WikiSection, WikiCategory, WikiArticle, WikiTag } from '@/types/wiki'

// 八字知识库数据
export const baziWikiData: WikiSection = {
  id: 'bazi',
  name: '八字基础',
  description: '从天干地支开始，系统学习八字命理的核心理论',
  categories: [
    {
      id: 'basics',
      name: '基础',
      description: '八字入门必备知识',
      icon: 'BookOpen',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-300',
      articles: [
        {
          id: 'bazi-intro',
          title: '什么是八字？八字是怎么来的？',
          description: '了解八字的基本概念和历史起源',
          category: 'basics',
          tags: ['基础理论', '历史起源'],
          readTime: '5分钟',
          views: 2345,
          comments: 156,
          difficulty: 'entry',
          isFree: true,
          isNew: true,
          href: '/wiki/bazi/intro',
          publishDate: '2024-01-15',
          lastUpdated: '2024-01-15'
        },
        {
          id: 'paipan-basics',
          title: '如何排出自己的八字命盘？',
          description: '学会八字排盘的基本方法',
          category: 'basics',
          tags: ['排盘技巧', '基础操作'],
          readTime: '8分钟',
          views: 1876,
          comments: 98,
          difficulty: 'entry',
          isFree: true,
          href: '/wiki/bazi/paipan',
          publishDate: '2024-01-10',
          lastUpdated: '2024-01-10'
        }
      ]
    },
    {
      id: 'tiangan',
      name: '天干',
      description: '甲乙丙丁戊己庚辛壬癸详解',
      icon: 'Star',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-300',
      articles: [
        {
          id: 'tiangan-meaning',
          title: '十天干都代表什么含义？',
          description: '详解甲乙丙丁戊己庚辛壬癸的含义',
          category: 'tiangan',
          tags: ['天干含义', '基础理论'],
          readTime: '10分钟',
          views: 3421,
          comments: 201,
          difficulty: 'intermediate',
          isFree: true,
          isHot: true,
          href: '/wiki/bazi/tiangan-meaning',
          publishDate: '2024-01-08',
          lastUpdated: '2024-01-08'
        }
      ]
    },
    {
      id: 'practical',
      name: '实用',
      description: '八字在现实生活中的应用',
      icon: 'Target',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      borderColor: 'border-purple-300',
      articles: [
        {
          id: 'career-analysis',
          title: '八字怎么看适合什么职业？',
          description: '从八字分析职业方向',
          category: 'practical',
          tags: ['职业规划', '事业财运'],
          readTime: '18分钟',
          views: 5678,
          comments: 345,
          difficulty: 'intermediate',
          isFree: true,
          isHot: true,
          href: '/wiki/bazi/career',
          publishDate: '2024-01-05',
          lastUpdated: '2024-01-05'
        }
      ]
    }
  ],
  tags: [
    { id: 'basics', name: '基础理论', color: 'bg-blue-100 text-blue-600', count: 15 },
    { id: 'career', name: '事业财运', color: 'bg-yellow-100 text-yellow-600', count: 8 },
    { id: 'marriage', name: '桃花姻缘', color: 'bg-pink-100 text-pink-600', count: 6 },
    { id: 'health', name: '健康养生', color: 'bg-green-100 text-green-600', count: 4 }
  ]
}

// 紫微斗数知识库数据
export const ziweiWikiData: WikiSection = {
  id: 'ziwei',
  name: '紫微斗数',
  description: '从星曜宫位开始，深入学习紫微斗数的精髓',
  categories: [
    {
      id: 'basics',
      name: '基础',
      description: '紫微斗数入门知识',
      icon: 'Compass',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-300',
      articles: [
        {
          id: 'ziwei-intro',
          title: '什么是紫微斗数？紫微斗数的起源？',
          description: '了解紫微斗数的基本概念和历史背景',
          category: 'basics',
          tags: ['基础理论', '历史起源'],
          readTime: '6分钟',
          views: 3245,
          comments: 189,
          difficulty: 'entry',
          isFree: true,
          isNew: true,
          href: '/wiki/ziwei/intro',
          publishDate: '2024-01-12',
          lastUpdated: '2024-01-12'
        }
      ]
    },
    {
      id: 'stars',
      name: '星曜',
      description: '十四主星和各类辅星详解',
      icon: 'Star',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      borderColor: 'border-indigo-300',
      articles: [
        {
          id: 'fourteen-stars',
          title: '紫微十四主星都有什么特点？',
          description: '详解紫微、天机、太阳等十四主星',
          category: 'stars',
          tags: ['主星特质', '性格分析'],
          readTime: '15分钟',
          views: 4321,
          comments: 267,
          difficulty: 'intermediate',
          isFree: true,
          isHot: true,
          href: '/wiki/ziwei/fourteen-stars',
          publishDate: '2024-01-10',
          lastUpdated: '2024-01-10'
        }
      ]
    }
  ],
  tags: [
    { id: 'stars', name: '星曜特质', color: 'bg-indigo-100 text-indigo-600', count: 12 },
    { id: 'palaces', name: '宫位分析', color: 'bg-emerald-100 text-emerald-600', count: 10 },
    { id: 'sihua', name: '四化飞星', color: 'bg-orange-100 text-orange-600', count: 6 }
  ]
}

// 五行知识库数据
export const wuxingWikiData: WikiSection = {
  id: 'wuxing',
  name: '五行理论',
  description: '探索五行相生相克的奥秘',
  categories: [
    {
      id: 'theory',
      name: '理论',
      description: '五行基础理论',
      icon: 'Target',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      borderColor: 'border-purple-300',
      articles: [
        {
          id: 'wuxing-intro',
          title: '什么是五行？五行的起源和发展',
          description: '了解五行学说的基本概念和历史发展',
          category: 'theory',
          tags: ['基础理论', '历史起源'],
          readTime: '8分钟',
          views: 2890,
          comments: 167,
          difficulty: 'entry',
          isFree: true,
          href: '/wiki/wuxing/intro',
          publishDate: '2024-01-08',
          lastUpdated: '2024-01-08'
        }
      ]
    }
  ],
  tags: [
    { id: 'theory', name: '基础理论', color: 'bg-purple-100 text-purple-600', count: 8 },
    { id: 'health', name: '健康养生', color: 'bg-green-100 text-green-600', count: 5 },
    { id: 'fengshui', name: '风水应用', color: 'bg-blue-100 text-blue-600', count: 4 }
  ]
}

// 合并所有知识库数据
export const allWikiData = {
  bazi: baziWikiData,
  ziwei: ziweiWikiData,
  wuxing: wuxingWikiData
}

// 获取所有文章
export const getAllArticles = (): WikiArticle[] => {
  const articles: WikiArticle[] = []
  
  Object.values(allWikiData).forEach(section => {
    section.categories.forEach(category => {
      articles.push(...category.articles)
    })
  })
  
  return articles
}

// 获取热门文章
export const getHotArticles = (limit: number = 5): WikiArticle[] => {
  return getAllArticles()
    .filter(article => article.isHot)
    .sort((a, b) => b.views - a.views)
    .slice(0, limit)
}

// 获取最新文章
export const getNewArticles = (limit: number = 5): WikiArticle[] => {
  return getAllArticles()
    .filter(article => article.isNew)
    .sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
    .slice(0, limit)
}

// 获取免费文章
export const getFreeArticles = (): WikiArticle[] => {
  return getAllArticles().filter(article => article.isFree)
}

// 搜索文章
export const searchArticles = (query: string, sectionId?: string): WikiArticle[] => {
  const articles = sectionId ? allWikiData[sectionId as keyof typeof allWikiData]?.categories.flatMap(c => c.articles) || [] : getAllArticles()
  
  if (!query.trim()) return articles
  
  return articles.filter(article => 
    article.title.toLowerCase().includes(query.toLowerCase()) ||
    article.description.toLowerCase().includes(query.toLowerCase()) ||
    article.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
  )
} 