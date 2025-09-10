'use client'

import { useEffect } from 'react'
import { injectStructuredData } from '@/lib/seo/structured-data'

interface SEOHeadProps {
  structuredData?: any | any[]
  children?: React.ReactNode
}

export default function SEOHead({ structuredData, children }: SEOHeadProps) {
  useEffect(() => {
    if (structuredData) {
      if (Array.isArray(structuredData)) {
        structuredData.forEach(data => injectStructuredData(data))
      } else {
        injectStructuredData(structuredData)
      }
    }
  }, [structuredData])

  return (
    <>
      {children}
    </>
  )
}