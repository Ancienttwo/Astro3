'use client'

import React, { useEffect, useState } from 'react'
import { motion, useInView, useAnimation } from 'framer-motion'

interface ScrollRevealProps {
  children: React.ReactNode
  direction?: 'up' | 'down' | 'left' | 'right' | 'fade'
  delay?: number
  duration?: number
  distance?: number
  className?: string
  once?: boolean
  forceAnimate?: boolean  // 新增：强制动画属性
}

export function ScrollReveal({
  children,
  direction = 'up',
  delay = 0,
  duration = 0.8,
  distance = 50,
  className = '',
  once = true,
  forceAnimate = false
}: ScrollRevealProps) {
  const controls = useAnimation()
  const ref = React.useRef(null)
  const isInView = useInView(ref, {
    once,
    margin: '-50px',  // 减小margin以更早触发
    amount: 0.1       // 降低阈值，更容易触发
  })
  
  const getInitialState = () => {
    switch (direction) {
      case 'up':
        return { y: distance, opacity: 0 }
      case 'down':
        return { y: -distance, opacity: 0 }
      case 'left':
        return { x: distance, opacity: 0 }
      case 'right':
        return { x: -distance, opacity: 0 }
      case 'fade':
        return { opacity: 0 }
      default:
        return { y: distance, opacity: 0 }
    }
  }

  const getAnimateState = () => {
    switch (direction) {
      case 'up':
      case 'down':
        return { y: 0, opacity: 1 }
      case 'left':
      case 'right':
        return { x: 0, opacity: 1 }
      case 'fade':
        return { opacity: 1 }
      default:
        return { y: 0, opacity: 1 }
    }
  }

  useEffect(() => {
    if (isInView || forceAnimate) {
      controls.start(getAnimateState())
    } else if (!once) {
      controls.start(getInitialState())
    }
  }, [isInView, forceAnimate, controls, once])

  // 移动端自动触发动画
  useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      const timer = setTimeout(() => {
        controls.start(getAnimateState())
      }, delay * 1000 + 200)  // 延迟后自动触发
      
      return () => clearTimeout(timer)
    }
  }, [controls, delay])

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={getInitialState()}
      animate={controls}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94] // cubic-bezier缓动
      }}
    >
      {children}
    </motion.div>
  )
}

// 预设动效组件
export const FadeUp = ({ children, ...props }: Omit<ScrollRevealProps, 'direction'>) => (
  <ScrollReveal direction="up" {...props}>{children}</ScrollReveal>
)

export const FadeLeft = ({ children, ...props }: Omit<ScrollRevealProps, 'direction'>) => (
  <ScrollReveal direction="left" {...props}>{children}</ScrollReveal>
)

export const FadeRight = ({ children, ...props }: Omit<ScrollRevealProps, 'direction'>) => (
  <ScrollReveal direction="right" {...props}>{children}</ScrollReveal>
)

// 改进的StaggerContainer，添加移动端优化
export const StaggerContainer = ({ 
  children, 
  className = '',
  forceMobile = true  // 移动端强制显示
}: { 
  children: React.ReactNode, 
  className?: string,
  forceMobile?: boolean 
}) => {
  const [shouldAnimate, setShouldAnimate] = useState(false)
  
  useEffect(() => {
    // 移动端延迟触发动画
    if (forceMobile && typeof window !== 'undefined' && window.innerWidth <= 768) {
      const timer = setTimeout(() => {
        setShouldAnimate(true)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [forceMobile])
  
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate={shouldAnimate ? "visible" : undefined}
      whileInView="visible"
      viewport={{ 
        once: true, 
        margin: '-50px',  // 减小margin
        amount: 0.1       // 降低阈值
      }}
      transition={{ staggerChildren: 0.1 }}
    >
      {children}
    </motion.div>
  )
}

export const StaggerItem = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => (
  <motion.div
    className={className}
    variants={{
      hidden: { y: 20, opacity: 0 },  // 减小移动距离
      visible: { y: 0, opacity: 1 }
    }}
    transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
  >
    {children}
  </motion.div>
) 