/**
 * 星盘容器组件
 * 提供统一的容器样式和响应式布局
 */

import React from 'react'
import { View, Platform, StyleSheet } from 'react-native'

interface ChartContainerProps {
  children: React.ReactNode
  size?: number
  // Web 专用：使用视口高度减去固定区域高度，动态计算可用尺寸
  maxVhOffset?: number
}

export const ChartContainer: React.FC<ChartContainerProps> = ({ 
  children, 
  size = 600,
  maxVhOffset
}) => {
  // Web版本
  if (Platform.OS === 'web') {
    // 占满父容器高度（由外层 flex:1 决定），不再强制 1:1 正方形
    const maxHeight = maxVhOffset !== null && maxVhOffset !== undefined
      ? `calc(100vh - ${Math.max(0, maxVhOffset)}px)`
      : null
    return (
      <div 
        className="ziwei-chart-container"
        style={{
          width: '100%',
          height: '100%',
          ...(maxHeight ? { maxHeight } : {}),
          padding: 0,
          margin: 0,
          overflow: 'visible', // 允许箭头超出边界仍可见
          boxSizing: 'border-box' as const
        }}
      >
        {children}
      </div>
    )
  }
  
  // Native版本
  return (
    <View style={[
      styles.container,
      {
        width: size,
        height: size
      }
    ]}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#F9FAFB',
    borderRadius: 0, // 关闭圆角
    padding: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2
  }
})

// no default export per repository conventions
