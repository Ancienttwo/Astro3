"use client"

import React from 'react'
import { useUserContext } from '@/hooks/useUserContext'
import Web3Layout from '@/components/Web3Layout'

interface SmartLayoutWrapperProps {
  children: React.ReactNode
  // Optional overrides for specific pages
  forceWeb3Layout?: boolean
  forceStandardLayout?: boolean
  showNavigation?: boolean
  // Custom loading component
  loadingComponent?: React.ReactNode
}

/**
 * 智能布局包装器
 * 基于用户类型自动选择合适的布局（Web3Layout 或标准布局）
 * 
 * 使用示例:
 * <SmartLayoutWrapper>
 *   <YourPageContent />
 * </SmartLayoutWrapper>
 */
export function SmartLayoutWrapper({
  children,
  forceWeb3Layout = false,
  forceStandardLayout = false,
  showNavigation = true,
  loadingComponent
}: SmartLayoutWrapperProps) {
  const { shouldUseWeb3Layout, user, isLoading } = useUserContext()

  // 默认加载组件
  const DefaultLoadingComponent = () => (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3D0B5B] mx-auto mb-4"></div>
        <p className="text-[#3D0B5B]">Loading...</p>
      </div>
    </div>
  )

  // 显示加载状态
  if (isLoading) {
    return loadingComponent || <DefaultLoadingComponent />
  }

  // 布局决策逻辑
  const useWeb3Layout = forceWeb3Layout || 
    (!forceStandardLayout && shouldUseWeb3Layout && user)

  // 返回对应布局
  if (useWeb3Layout && user) {
    return (
      <Web3Layout user={user} showNavigation={showNavigation}>
        {children}
      </Web3Layout>
    )
  }

  // 标准布局（直接渲染内容）
  return <>{children}</>
}

/**
 * 便捷的布局决策Hooks
 */

// 获取当前应该使用的布局类型
export const useLayoutType = () => {
  const { shouldUseWeb3Layout, user } = useUserContext()
  
  return {
    layoutType: shouldUseWeb3Layout && user ? 'web3' : 'standard',
    shouldUseWeb3Layout,
    hasUser: !!user
  }
}

// 为页面提供布局相关的便捷方法
export const usePageLayout = () => {
  const { shouldUseWeb3Layout, user, userType, isLoading } = useUserContext()
  
  return {
    // 布局信息
    layoutType: shouldUseWeb3Layout && user ? 'web3' : 'standard',
    shouldUseWeb3Layout,
    user,
    userType,
    isLoading,
    
    // 便捷方法
    wrapWithSmartLayout: (content: React.ReactNode, options?: Partial<SmartLayoutWrapperProps>) => (
      <SmartLayoutWrapper {...options}>
        {content}
      </SmartLayoutWrapper>
    ),
    
    // 条件渲染助手
    ifWeb3Layout: (content: React.ReactNode) => shouldUseWeb3Layout && user ? content : null,
    ifStandardLayout: (content: React.ReactNode) => !shouldUseWeb3Layout || !user ? content : null,
  }
}

export default SmartLayoutWrapper