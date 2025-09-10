'use client'

import React from 'react'

interface JapaneseTextRendererProps {
  children: React.ReactNode
  className?: string
}

/**
 * 日语文本渲染组件
 * 确保日语文本正确显示和格式化
 */
export function JapaneseTextRenderer({ children, className = '' }: JapaneseTextRendererProps) {
  const japaneseTextClass = `
    font-noto-sans-jp
    leading-japanese
    tracking-japanese
    text-size-japanese-base
    ${className}
  `.trim()

  return (
    <div className={japaneseTextClass} lang="ja">
      {children}
    </div>
  )
}

/**
 * 日语标题组件
 */
export function JapaneseTitle({ children, level = 1, className = '' }: {
  children: React.ReactNode
  level?: 1 | 2 | 3 | 4 | 5 | 6
  className?: string
}) {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements
  const getHeadingClass = (level: number) => {
    switch (level) {
      case 1: return 'heading-japanese-1'
      case 2: return 'heading-japanese-2'
      case 3: return 'heading-japanese-3'
      case 4: return 'heading-japanese-4'
      default: return 'heading-japanese-4'
    }
  }
  
  const titleClass = `
    font-noto-sans-jp
    ${getHeadingClass(level)}
    ${className}
  `.trim()

  return (
    <Tag className={titleClass} lang="ja">
      {children}
    </Tag>
  )
}

/**
 * 日语段落组件
 */
export function JapaneseParagraph({ children, className = '' }: {
  children: React.ReactNode
  className?: string
}) {
  const paragraphClass = `
    font-noto-sans-jp
    leading-japanese
    tracking-japanese
    text-size-japanese-base
    text-justify-japanese
    mb-6
    ${className}
  `.trim()

  return (
    <p className={paragraphClass} lang="ja">
      {children}
    </p>
  )
}

/**
 * 日语列表组件
 */
export function JapaneseList({ children, ordered = false, className = '' }: {
  children: React.ReactNode
  ordered?: boolean
  className?: string
}) {
  const Tag = ordered ? 'ol' : 'ul'
  const listClass = `
    font-noto-sans-jp
    list-japanese
    ${ordered ? 'list-decimal' : 'list-disc'}
    pl-6
    ${className}
  `.trim()

  return (
    <Tag className={listClass} lang="ja">
      {children}
    </Tag>
  )
}

/**
 * 日语按钮组件
 */
export function JapaneseButton({ children, className = '', ...props }: {
  children: React.ReactNode
  className?: string
  [key: string]: any
}) {
  const buttonClass = `
    font-noto-sans-jp
    btn-japanese
    ${className}
  `.trim()

  return (
    <button className={buttonClass} lang="ja" {...props}>
      {children}
    </button>
  )
}

/**
 * 日语输入框组件
 */
export function JapaneseInput({ className = '', ...props }: {
  className?: string
  [key: string]: any
}) {
  const inputClass = `
    font-noto-sans-jp
    input-japanese
    ${className}
  `.trim()

  return (
    <input className={inputClass} lang="ja" {...props} />
  )
}

/**
 * 日语卡片组件
 */
export function JapaneseCard({ children, className = '' }: {
  children: React.ReactNode
  className?: string
}) {
  const cardClass = `
    font-noto-sans-jp
    card-japanese
    ${className}
  `.trim()

  return (
    <div className={cardClass} lang="ja">
      {children}
    </div>
  )
}