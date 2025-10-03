/**
 * 紫微斗数底部操作栏组件
 * 提供五个核心功能按钮：三合、四化、排盘、分析、设置
 * 平台自适应，匹配ziwei-old.tsx的设计
 */

import { useCallback, type CSSProperties } from 'react'
import { View, Text, TouchableOpacity, Platform, StyleSheet, Alert } from 'react-native'
import { useTranslation } from 'react-i18next'
import type { ZiweiBottomBarProps } from '../types'

// 默认文本标签（作为 fallback）
const DEFAULT_LABELS = {
  sanhe: '三合',
  sihua: '四化',
  paipan: '排盘',
  analysis: '分析',
  settings: '设置',
  inDevelopmentTitle: '开发中',
  inDevelopmentMessage: '此功能正在开发中，敬请期待'
}

export const ZiweiBottomBar: React.FC<ZiweiBottomBarProps> = ({
  onSanhePress,
  onSihuaPress,
  onPaipanPress,
  onAnalysisPress,
  onSettingsPress,
  // 与老版一致：支持 activeMode，用于高亮某个按钮（默认四化）
  activeMode = 'sihua',
}) => {
  const { t } = useTranslation('translation', { useSuspense: false })

  // 使用 i18n 或 fallback 到默认值
  const LABELS = {
    sanhe: t('ziwei.bottomBar.sanhe', DEFAULT_LABELS.sanhe),
    sihua: t('ziwei.bottomBar.sihua', DEFAULT_LABELS.sihua),
    paipan: t('ziwei.bottomBar.paipan', DEFAULT_LABELS.paipan),
    analysis: t('ziwei.bottomBar.analysis', DEFAULT_LABELS.analysis),
    settings: t('ziwei.bottomBar.settings', DEFAULT_LABELS.settings),
    inDevelopmentTitle: t('ziwei.bottomBar.inDevelopment.title', DEFAULT_LABELS.inDevelopmentTitle),
    inDevelopmentMessage: t('ziwei.bottomBar.inDevelopment.message', DEFAULT_LABELS.inDevelopmentMessage)
  }

  const handleSanhe = useCallback(() => {
    if (onSanhePress) return onSanhePress()
    const platformOS = Platform.OS as unknown as string
    if (platformOS === 'web') {
      alert(LABELS.inDevelopmentMessage)
    } else {
      Alert.alert(LABELS.inDevelopmentTitle, LABELS.inDevelopmentMessage)
    }
  }, [onSanhePress, LABELS.inDevelopmentTitle, LABELS.inDevelopmentMessage])
  // Web 版本完全对齐旧版 BottomBar.web.tsx 的样式与行为（非 fixed）
  if ((Platform.OS as unknown as string) === 'web') {
    const getButtonStyle = (mode: 'sanhe' | 'sihua' | 'analysis' | 'normal') => {
      const isActive = activeMode === mode
      return {
        padding: '2px 8px',
        backgroundColor: isActive ? '#3D0B5B' : 'transparent',
        border: 'none',
        fontSize: '11px',
        color: isActive ? '#FFFFFF' : '#3D0B5B',
        fontWeight: isActive ? '600' : '500',
        cursor: 'pointer',
        fontFamily: 'inherit',
        borderRadius: '4px',
        transition: 'all 0.2s ease',
      } as CSSProperties
    }

    return (
      <div style={{
        backgroundColor: '#FFFFFF',
        padding: '8px',
        borderTop: '0.5px solid #E0E0E0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '30px',
        boxSizing: 'border-box',
      }}>
        <button
          style={getButtonStyle('sanhe')}
          onClick={handleSanhe}
          onMouseOver={(e) => { if (activeMode !== 'sanhe') e.currentTarget.style.backgroundColor = '#F3F4F6' }}
          onMouseOut={(e) => { if (activeMode !== 'sanhe') e.currentTarget.style.backgroundColor = 'transparent' }}
        >
          {LABELS.sanhe}
        </button>
        <button
          style={getButtonStyle('sihua')}
          onClick={onSihuaPress}
          onMouseOver={(e) => { if (activeMode !== 'sihua') e.currentTarget.style.backgroundColor = '#F3F4F6' }}
          onMouseOut={(e) => { if (activeMode !== 'sihua') e.currentTarget.style.backgroundColor = 'transparent' }}
        >
          {LABELS.sihua}
        </button>
        <button
          style={getButtonStyle('normal')}
          onClick={onPaipanPress}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6' }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
        >
          {LABELS.paipan}
        </button>
        <button
          style={getButtonStyle('analysis')}
          onClick={onAnalysisPress}
          onMouseOver={(e) => { if (activeMode !== 'analysis') e.currentTarget.style.backgroundColor = '#F3F4F6' }}
          onMouseOut={(e) => { if (activeMode !== 'analysis') e.currentTarget.style.backgroundColor = 'transparent' }}
        >
          {LABELS.analysis}
        </button>
        <button
          style={getButtonStyle('normal')}
          onClick={onSettingsPress}
          onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6' }}
          onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'transparent' }}
        >
          {LABELS.settings}
        </button>
      </div>
    )
  }
  
  // Native版本 - 薄款设计，无表情符号
  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <TouchableOpacity
          style={styles.barItem}
          onPress={handleSanhe}
        >
          <Text style={styles.barLabel}>{LABELS.sanhe}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.barItem}
          onPress={onSihuaPress}
        >
          <Text style={styles.barLabel}>{LABELS.sihua}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.barItem}
          onPress={onPaipanPress}
        >
          <Text style={styles.barLabel}>{LABELS.paipan}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.barItem}
          onPress={onAnalysisPress}
        >
          <Text style={styles.barLabel}>{LABELS.analysis}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.barItem}
          onPress={onSettingsPress}
        >
          <Text style={styles.barLabel}>{LABELS.settings}</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: Platform.OS === 'web' ? 0 : 0.5,
    borderTopColor: '#E0E0E0',
    paddingVertical: 2,
    paddingHorizontal: 8
  },
  innerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 26
  },
  barItem: {
    paddingVertical: 2,
    paddingHorizontal: 8
  },
  barLabel: {
    fontSize: 11,
    color: '#3D0B5B',
    fontWeight: '500',
    fontFamily: Platform.select({ ios: 'PingFang SC', android: 'Noto Sans SC', default: 'Noto Sans SC' })
  }
})

// no default export per repository conventions
