// 结构化数据生成器 (JSON-LD)
export interface StructuredDataConfig {
  type: 'WebSite' | 'Article' | 'Organization' | 'Person' | 'Service' | 'FAQ' | 'HowTo'
  data: any
}

// 基础网站结构化数据
export function generateWebsiteStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'AstroZi',
    description: 'AI生命工程平台 - 专业的紫微斗数和八字命理分析',
    url: 'https://astrozi.com',
    logo: 'https://astrozi.com/logo.png',
    sameAs: [
      'https://twitter.com/astrozi',
      'https://github.com/astrozi'
    ],
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://astrozi.com/search?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  }
}

// 组织结构化数据
export function generateOrganizationStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AstroZi',
    description: '专业的AI命理分析平台',
    url: 'https://astrozi.com',
    logo: 'https://astrozi.com/logo.png',
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      availableLanguage: ['Chinese', 'English']
    },
    foundingDate: '2024',
    areaServed: {
      '@type': 'Country',
      name: 'China'
    },
    serviceType: ['命理分析', '紫微斗数', '八字排盘', 'AI咨询']
  }
}

// 文章结构化数据
export function generateArticleStructuredData(article: {
  title: string
  description: string
  content: string
  author: string
  publishedAt: string
  updatedAt?: string
  category: string
  tags: string[]
  url: string
  image?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    articleBody: article.content,
    author: {
      '@type': 'Person',
      name: article.author
    },
    publisher: {
      '@type': 'Organization',
      name: 'AstroZi',
      logo: {
        '@type': 'ImageObject',
        url: 'https://astrozi.com/logo.png'
      }
    },
    datePublished: article.publishedAt,
    dateModified: article.updatedAt || article.publishedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://astrozi.com${article.url}`
    },
    articleSection: article.category,
    keywords: article.tags.join(', '),
    ...(article.image && {
      image: {
        '@type': 'ImageObject',
        url: article.image,
        width: 1200,
        height: 630
      }
    })
  }
}

// 服务结构化数据
export function generateServiceStructuredData(service: {
  name: string
  description: string
  provider: string
  areaServed: string
  serviceType: string
  url: string
  offers?: {
    price: string
    currency: string
    availability: string
  }
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.name,
    description: service.description,
    provider: {
      '@type': 'Organization',
      name: service.provider
    },
    areaServed: service.areaServed,
    serviceType: service.serviceType,
    url: service.url,
    ...(service.offers && {
      offers: {
        '@type': 'Offer',
        price: service.offers.price,
        priceCurrency: service.offers.currency,
        availability: `https://schema.org/${service.offers.availability}`
      }
    })
  }
}

// FAQ结构化数据
export function generateFAQStructuredData(faqs: Array<{
  question: string
  answer: string
}>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }
}

// HowTo结构化数据
export function generateHowToStructuredData(howTo: {
  name: string
  description: string
  estimatedCost?: string
  totalTime?: string
  steps: Array<{
    name: string
    text: string
    image?: string
  }>
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: howTo.name,
    description: howTo.description,
    ...(howTo.estimatedCost && { estimatedCost: { '@type': 'MonetaryAmount', currency: 'CNY', value: howTo.estimatedCost } }),
    ...(howTo.totalTime && { totalTime: howTo.totalTime }),
    step: howTo.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      ...(step.image && {
        image: {
          '@type': 'ImageObject',
          url: step.image
        }
      })
    }))
  }
}

// 紫微斗数专用结构化数据
export function generateZiweiServiceStructuredData() {
  return generateServiceStructuredData({
    name: '紫微斗数排盘分析',
    description: '专业的紫微斗数命盘排列和分析服务，包含十二宫位、主星分布、流年运势等详细解读',
    provider: 'AstroZi',
    areaServed: '中国',
    serviceType: '命理咨询',
    url: 'https://astrozi.com/ziwei',
    offers: {
      price: '0',
      currency: 'CNY',
      availability: 'InStock'
    }
  })
}

// 八字命理专用结构化数据
export function generateBaziServiceStructuredData() {
  return generateServiceStructuredData({
    name: '八字命理分析',
    description: '基于生辰八字的专业命理分析，包含五行分析、十神关系、大运流年等全面解读',
    provider: 'AstroZi',
    areaServed: '中国',
    serviceType: '命理咨询',
    url: 'https://astrozi.com/bazi',
    offers: {
      price: '0',
      currency: 'CNY',
      availability: 'InStock'
    }
  })
}

// 常见问题结构化数据
export function generateAstrologyFAQStructuredData() {
  return generateFAQStructuredData([
    {
      question: '什么是紫微斗数？',
      answer: '紫微斗数是中国传统命理学的重要分支，以紫微星为主星，通过排列十二宫位来分析人的命运和性格特征。'
    },
    {
      question: '八字和紫微斗数有什么区别？',
      answer: '八字主要基于生辰时间的天干地支组合，注重五行平衡；紫微斗数则通过星曜在十二宫的分布来分析，更注重宫位关系。'
    },
    {
      question: 'AI算命准确吗？',
      answer: 'AI算命基于传统命理理论和大数据分析，可以提供客观的参考，但命运受多种因素影响，建议理性看待。'
    },
    {
      question: '如何使用紫微斗数排盘？',
      answer: '输入准确的出生年月日时，系统会自动计算命盘，显示十二宫位和星曜分布，并提供详细的分析解读。'
    }
  ])
}

// 生成并插入结构化数据的工具函数
export function injectStructuredData(data: any) {
  if (typeof window !== 'undefined') {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(data)
    
    // 移除已存在的相同类型结构化数据
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]')
    existingScripts.forEach(script => {
      try {
        const existingData = JSON.parse(script.textContent || '')
        if (existingData['@type'] === data['@type']) {
          script.remove()
        }
      } catch (e) {
        // 忽略解析错误
      }
    })
    
    document.head.appendChild(script)
  }
}