/**
 * 宫位卡片组件
 * 统一组件，平台差异通过Platform.select处理
 */

import React from 'react'
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Platform, 
  StyleSheet 
} from 'react-native'
import type { Palace, Star } from '../types'
import { useAnchors } from '../Arrows/AnchorContext'

interface PalaceCardProps {
  palace: Palace
  isActive: boolean
  onClick: () => void
  selectedPeriod?: string | null
  selectedYear?: string | null
  selectedMonth?: string | null
  chartSize?: number  // Native需要
  majorLabel?: { text: string; highlight: boolean }
  yearLabel?: { text: string }
  minorLabel?: { text: string }
  dayunYearAge?: string
  monthLabel?: string
  activeSihuaHighlights?: Map<string, { code: 'A' | 'B' | 'C' | 'D'; color: string }>
}

export const PalaceCard: React.FC<PalaceCardProps> = ({
  palace,
  isActive,
  onClick,
  selectedPeriod: _selectedPeriod,
  selectedYear: _selectedYear,
  selectedMonth: _selectedMonth,
  chartSize = 400,
  majorLabel,
  yearLabel,
  minorLabel,
  dayunYearAge,
  monthLabel,
  activeSihuaHighlights
}) => {
  // Web版本渲染
  if (Platform.OS === 'web') {
    const { setAnchor, getContainerRect } = useAnchors()

    // Web: 注册天干锚点（精确到“天干”文本位置中心）
    const stemTextRef = React.useRef<HTMLSpanElement | null>(null)
    // Web: 蛇形排布所需测量
    const starsContainerRef = React.useRef<HTMLDivElement | null>(null)
    const [cols, setCols] = React.useState<number>(0)
    const measureCols = React.useCallback(() => {
      const el = starsContainerRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const first = el.querySelector('.star') as HTMLElement | null
      const starW = first ? first.getBoundingClientRect().width : 14
      const cw = rect.width || 0
      const c = Math.max(1, Math.floor(cw / Math.max(1, starW)))
      if (c !== cols) setCols(c)
    }, [cols])
    React.useEffect(() => {
      const el = starsContainerRef.current
      if (!el) return
      measureCols()
      const RO = (window as any).ResizeObserver as any
      const ro = RO ? new RO(() => measureCols()) : null
      ro && ro.observe(el)
      return () => { ro && ro.disconnect() }
    }, [measureCols])
    React.useEffect(() => {
      if (!stemTextRef.current) return
      const el = stemTextRef.current
      const RO = (window as any).ResizeObserver as any
      const update = () => {
        const cr = el.getBoundingClientRect()
        const container = getContainerRect()
        if (!container) return
        const x = cr.left - container.left + cr.width / 2
        const y = cr.top - container.top + cr.height / 2
        setAnchor(`stem:${palace.branch}`, { x, y })
      }
      const ro = RO ? new RO(update) : null
      ro && ro.observe(el)
      update()
      return () => { ro && ro.disconnect() }
    }, [palace.branch, setAnchor, getContainerRect])

    // 子组件：星曜（自带锚点注册）
    const StarItemWeb: React.FC<{ star: Star; idx: number }> = ({ star, idx }) => {
      const ref = React.useRef<HTMLDivElement | null>(null)
      const { setAnchor, getContainerRect } = useAnchors()
      const brightRef = React.useRef<HTMLDivElement | null>(null)
      React.useEffect(() => {
        if (!ref.current) return
        const el = ref.current
        const update = () => {
          const cr = el.getBoundingClientRect()
          const container = getContainerRect()
          if (!container) return
          const x = cr.left - container.left + cr.width / 2
          const y = cr.top - container.top + cr.height / 2
          setAnchor(`star:${palace.branch}:${star.name}:${idx}` , { x, y })
        }
        const RO = (window as any).ResizeObserver as any
        const ro = RO ? new RO(update) : null
        ro && ro.observe(el)
        update()
        return () => { ro && ro.disconnect() }
    }, [idx, palace.branch, star.name, setAnchor, getContainerRect])

      React.useEffect(() => {
        if (!brightRef.current) return
        const el = brightRef.current
        const update = () => {
          const cr = el.getBoundingClientRect()
          const container = getContainerRect()
          if (!container) return
          const x = cr.left - container.left + cr.width // 右端稍偏右，避免遮盖
          const y = cr.top - container.top + cr.height / 2
          setAnchor(`bright:${palace.branch}:${star.name}:${idx}` , { x, y })
        }
        const RO = (window as any).ResizeObserver as any
        const ro = RO ? new RO(update) : null
        ro && ro.observe(el)
        update()
        return () => { ro && ro.disconnect() }
      }, [idx, palace.branch, star.name, setAnchor, getContainerRect])

      const chars = Array.from(star.name)
      const colorClass = `star-${star.type}`

      // Check if this star should be highlighted (flying palace sihua)
      const sihuaHighlight = activeSihuaHighlights?.get(star.name)
      const isHighlighted = Boolean(sihuaHighlight)

      return (
        <div
          ref={ref}
          className={`star ${colorClass} ${isHighlighted ? 'star-sihua-highlighted' : ''}`}
          data-star-name={star.name}
          style={{ color: getStarColor(star) }}
        >
          <div
            className="star-vertical-name"
            style={{
              backgroundColor: isHighlighted ? sihuaHighlight?.color : 'transparent',
              color: isHighlighted ? '#FFFFFF' : 'inherit',
              padding: isHighlighted ? '1px 2px' : '0',
              borderRadius: isHighlighted ? '2px' : '0',
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              margin: isHighlighted ? '-1px -2px' : '0'
            }}
          >
            {chars.map((ch, i) => (
              <span key={i} className="star-char">{ch}</span>
            ))}
          </div>
          {star.brightness && (
            <div ref={brightRef} className="star-brightness-line">{star.brightness}</div>
          )}
          {(star.sihuaOrigin || star.sihuaInward || star.sihuaOutward || star.sihua) && (
            <div className="star-sihua-line">
              {star.sihuaOrigin && (
                <span className={`star-sihua sihua-${star.sihuaOrigin}`}>{star.sihuaOrigin}</span>
              )}
              {star.sihuaInward && (
                <span className={`star-sihua star-sihua-muted sihua-i sihua-${star.sihuaInward}`}>{`i${star.sihuaInward}`}</span>
              )}
              {star.sihuaOutward && (
                <span className={`star-sihua star-sihua-muted sihua-x sihua-${star.sihuaOutward}`}>{`x${star.sihuaOutward}`}</span>
              )}
              {!star.sihuaOrigin && !star.sihuaInward && !star.sihuaOutward && star.sihua && (
                <span className={`star-sihua sihua-${star.sihua}`}>{star.sihua}</span>
              )}
            </div>
          )}
        </div>
      )
    }

    // Web: 生成蛇形顺序（行0→正序，行1→逆序），锚点用原始索引
    const snakeStarsWeb = React.useMemo(() => {
      const list = (palace.stars || []).map((s, i) => ({ star: s, origIdx: i }))
      if (!cols || cols <= 1) return list
      const res: Array<{ star: Star; origIdx: number }> = []
      for (let i = 0; i < list.length; i += cols) {
        const row = list.slice(i, i + cols)
        const rowIndex = Math.floor(i / cols)
        if (rowIndex % 2 === 1) row.reverse()
        res.push(...row)
      }
      return res
    }, [palace.stars, cols])

    const hasBothMarkers = Boolean(palace.isBodyPalace && palace.isLaiyinPalace)
    return (
      <div 
        className={`palace-card palace-${palace.branch} ${isActive ? 'palace-active' : ''} ${hasBothMarkers ? 'has-both-markers' : ''}`}
        onClick={onClick}
        data-branch={palace.branch}
      >
        {/* 星曜容器（每颗星按竖排字符显示，整体横向排列，可换行） */}
        <div className="palace-stars" ref={starsContainerRef}>
          {snakeStarsWeb.map(({ star, origIdx }) => (
            <StarItemWeb key={`${star.name}-${origIdx}`} star={star} idx={origIdx} />
          ))}
        </div>
        
        {/* 宫位底部信息 */}
        <div className="palace-bottom">
          <div className="palace-stem-branch">
            <span className="palace-stem" ref={stemTextRef}>{palace.stem}</span>
            <span className="palace-branch">{palace.branch}</span>
          </div>
          <div className="palace-name">
            <span>{palace.name}</span>
          </div>
        </div>

        {/* 大运激活时：在左下天干的上方，排布该宫对应的“年 与 岁”（最多10年映射之一） */}
        {dayunYearAge && (
          <div className="palace-year-age">
            <span className="year-age-text">{dayunYearAge}</span>
          </div>
        )}

        {/* 流年激活时：以“年财”宫为起点，从左下角标注正月→腊月（顺序） */}
        {_selectedYear && monthLabel && (
          <div className="palace-month">
            <span className="palace-month-text">{monthLabel}</span>
          </div>
        )}

        {/* 选择某步大运后：在宫名上方排布 12 个“大运宫位名”，以选中宫为“大命”起点逆时针 */}
        {!!majorLabel && (
          <div className={`palace-major-label ${majorLabel.highlight ? 'highlight' : ''}`}>
            <span className="major-label-text">{majorLabel.text}</span>
          </div>
        )}
        
        {/* 固定大运区间：每个宫底部置中展示（无需点击选择器） */}
        {yearLabel ? (
          <div className={`palace-dayun-fixed year-label ${['年命','年财','年官'].includes(yearLabel.text) ? 'highlight' : ''}`}>
            <span className="palace-dayun-fixed-text">{yearLabel.text}</span>
          </div>
        ) : palace.dayunInfo && (
          <div className="palace-dayun-fixed">
            <span className="palace-dayun-fixed-text">
              {(palace.dayunInfo.ageRange || '').replace(/岁$/, '').replace(/\s+/g, '')}
            </span>
          </div>
        )}
        {/* 小限标签：置于流年标签上方 */}
        {minorLabel && (
          <div className={`palace-minor-label ${minorLabel.text === '小限' ? 'highlight' : ''}`}>
            <span className="minor-label-text">{minorLabel.text}</span>
          </div>
        )}
        
        {_selectedYear && palace.liunianInfo && (
          <div className="palace-liunian">
            <span>{palace.liunianInfo.name}</span>
          </div>
        )}
        
        {_selectedMonth && palace.liuyueInfo && (
          <div className="palace-liuyue">
            <span>{palace.liuyueInfo}</span>
          </div>
        )}
        
        {/* 特殊标记 */}
        {palace.isBodyPalace && (
          <div className="palace-marker body-palace">身</div>
        )}
        {palace.isLaiyinPalace && (
          <div className="palace-marker laiyin-palace">来</div>
        )}
      </div>
    )
  }
  
  // Native版本渲染
  const palaceSize = chartSize / 4
  const position = getPalacePosition(palace.branch, palaceSize)
  const { setAnchor } = useAnchors()
  const starsContainerLayout = React.useRef<{ x: number; y: number; width?: number }>({ x: 0, y: 0, width: 0 })
  const [nativeCols, setNativeCols] = React.useState<number>(0)
  const [nativeStarW, setNativeStarW] = React.useState<number>(14)
  const computeNativeCols = React.useCallback(() => {
    const cw = starsContainerLayout.current.width || 0
    const c = Math.max(1, Math.floor(cw / Math.max(1, nativeStarW)))
    if (c !== nativeCols) setNativeCols(c)
  }, [nativeCols, nativeStarW])
  const snakeStarsNative = React.useMemo(() => {
    const list = (palace.stars || []).map((s, i) => ({ star: s, origIdx: i }))
    if (!nativeCols || nativeCols <= 1) return list
    const res: Array<{ star: Star; origIdx: number }> = []
    for (let i = 0; i < list.length; i += nativeCols) {
      const row = list.slice(i, i + nativeCols)
      const rowIndex = Math.floor(i / nativeCols)
      if (rowIndex % 2 === 1) row.reverse()
      res.push(...row)
    }
    return res
  }, [palace.stars, nativeCols])

  return (
    <TouchableOpacity
      style={[
        styles.palaceContainer,
        {
          width: palaceSize,
          height: palaceSize,
          ...position
        },
        isActive && styles.palaceActive
      ]}
      onPress={onClick}
      activeOpacity={0.7}
    >
      {/* 星曜显示（竖排字符 + 亮度 + 四化三类） */}
      <View
        style={styles.starsContainer}
        onLayout={(e) => {
          starsContainerLayout.current = { x: e.nativeEvent.layout.x, y: e.nativeEvent.layout.y, width: e.nativeEvent.layout.width }
          computeNativeCols()
        }}
      >
        {snakeStarsNative.map(({ star, origIdx }) => {
          const chars = Array.from(star.name)
          const color = getStarColor(star)
          return (
            <View
              key={`${star.name}-${origIdx}`}
              style={styles.starCol}
              onLayout={(e) => {
                // 记录星曜最小宽度用于估算列数
                const w = e.nativeEvent.layout.width
                if (w > 0 && (w < nativeStarW || nativeStarW === 0)) {
                  setNativeStarW(w)
                  computeNativeCols()
                }
                // 计算相对 ChartContainer 的绝对坐标
                const x = (position as any).left + (starsContainerLayout.current.x || 0) + e.nativeEvent.layout.x + e.nativeEvent.layout.width / 2
                const y = (position as any).top + (starsContainerLayout.current.y || 0) + e.nativeEvent.layout.y + e.nativeEvent.layout.height / 2
                setAnchor(`star:${palace.branch}:${star.name}:${origIdx}`, { x, y })
              }}
            >
              <View style={styles.verticalName}>
                {chars.map((ch, i) => (
                  <Text key={i} style={[styles.starNameVertical, { color }]}>{ch}</Text>
                ))}
              </View>
              {star.brightness && (
                <Text
                  style={styles.starBrightnessLine}
                  onLayout={(e) => {
                    const x = (position as any).left + (starsContainerLayout.current.x || 0) + e.nativeEvent.layout.x + e.nativeEvent.layout.width
                    const y = (position as any).top + (starsContainerLayout.current.y || 0) + e.nativeEvent.layout.y + e.nativeEvent.layout.height / 2
                    setAnchor(`bright:${palace.branch}:${star.name}:${origIdx}`, { x, y })
                  }}
                >
                  {star.brightness}
                </Text>
              )}
              {(star.sihuaOrigin || star.sihuaInward || star.sihuaOutward || star.sihua) && (
                <View style={styles.sihuaRow}>
                  {star.sihuaOrigin && (
                    <View style={[styles.sihuaBadge, { backgroundColor: getSihuaColor(star.sihuaOrigin) }]}>
                      <Text style={styles.sihuaText}>{star.sihuaOrigin}</Text>
                    </View>
                  )}
                  {star.sihuaInward && (
                    <View style={[styles.sihuaBadgeMuted, { borderColor: getSihuaColor(star.sihuaInward) }]}>
                      <Text style={[styles.sihuaTextMuted, { color: getSihuaColor(star.sihuaInward) }]}>{`i${star.sihuaInward}`}</Text>
                    </View>
                  )}
                  {star.sihuaOutward && (
                    <View style={[styles.sihuaBadgeMuted, { borderColor: getSihuaColor(star.sihuaOutward) }]}>
                      <Text style={[styles.sihuaTextMuted, { color: getSihuaColor(star.sihuaOutward) }]}>{`x${star.sihuaOutward}`}</Text>
                    </View>
                  )}
                  {!star.sihuaOrigin && !star.sihuaInward && !star.sihuaOutward && star.sihua && (
                    <View style={[styles.sihuaBadge, { backgroundColor: getSihuaColor(star.sihua) }]}>
                      <Text style={styles.sihuaText}>{star.sihua}</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          )
        })}
      </View>
      
      {/* 宫位信息 */}
      <View style={styles.palaceBottom}>
        <View style={styles.stemBranch}>
          <Text
            style={styles.stemText}
            onLayout={(e) => {
              const x = (position as any).left + e.nativeEvent.layout.x + e.nativeEvent.layout.width / 2
              const y = (position as any).top + e.nativeEvent.layout.y + e.nativeEvent.layout.height / 2
              setAnchor(`stem:${palace.branch}`, { x, y })
            }}
          >
            {palace.stem}
          </Text>
          <Text style={styles.branchText}>{palace.branch}</Text>
        </View>
        <Text style={styles.palaceName}>{palace.name}</Text>
      </View>
      
      {/* 特殊标记 */}
      {palace.isBodyPalace && (
        <View style={[styles.marker, styles.bodyMarker, palace.isLaiyinPalace ? styles.bodyMarkerShift : null]}>
          <Text style={styles.markerText}>身</Text>
        </View>
      )}
      {palace.isLaiyinPalace && (
        <View style={[styles.marker, styles.laiyinMarker]}>
          <Text style={styles.markerText}>来</Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

// Native平台位置计算
const getPalacePosition = (branch: string, size: number) => {
  const positions: Record<string, { left: number, top: number }> = {
    '巳': { left: 0, top: 0 },
    '午': { left: size, top: 0 },
    '未': { left: size * 2, top: 0 },
    '申': { left: size * 3, top: 0 },
    '辰': { left: 0, top: size },
    '酉': { left: size * 3, top: size },
    '卯': { left: 0, top: size * 2 },
    '戌': { left: size * 3, top: size * 2 },
    '寅': { left: 0, top: size * 3 },
    '丑': { left: size, top: size * 3 },
    '子': { left: size * 2, top: size * 3 },
    '亥': { left: size * 3, top: size * 3 }
  }
  
  return {
    position: 'absolute' as const,
    ...positions[branch]
  }
}

// 星曜颜色（按名称与类型覆盖）
const MAIN_DEEP_PURPLE = '#3D0B5B' // 系统深紫（14主星）
const PINK = '#F06292'             // 桃花星（更浅的粉红）
const GREEN = '#10B981'            // 禄存/天马/天钺/天魁（青绿）
const RED = '#EF4444'              // 文昌/文曲/左辅/右弼（红）
const GRAY = '#6B7280'             // 煞星（灰）

const GREEN_STARS = new Set(['禄存', '天马', '天钺', '天魁'])
const RED_STARS = new Set(['文昌', '文曲', '左辅', '右弼'])
// 桃花星：粉红色
const PINK_STARS = new Set(['桃花', '桃花星', '咸池', '红鸾', '天喜', '天姚'])
// 煞星：统一灰色
const SHA_STARS = new Set(['地空', '地劫', '擎羊', '陀罗', '火星', '铃星', '天刑'])

const getStarColor = (star: Star) => {
  // 名称优先的强制映射（满足业务配色需求）
  if (SHA_STARS.has(star.name)) return GRAY
  if (PINK_STARS.has(star.name)) return PINK
  if (GREEN_STARS.has(star.name)) return GREEN
  if (RED_STARS.has(star.name)) return RED
  if (star.type === 'main') return MAIN_DEEP_PURPLE
  if (star.type === 'malefic') return GRAY
  const fallback: Record<string, string> = {
    auxiliary: '#3B82F6',
    auspicious: GREEN,
    default: GRAY
  }
  return fallback[star.type] || fallback['default']
}

// 四化颜色
const getSihuaColor = (sihua: string) => {
  const colors: Record<string, string> = {
    'A': '#10B981',  // 禄 - 绿
    'B': '#8B5CF6',  // 权 - 紫
    'C': '#3B82F6',  // 科 - 蓝
    'D': '#EF4444'   // 忌 - 红
  }
  return colors[sihua] || '#6B7280'
}

const styles = StyleSheet.create({
  palaceContainer: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 4
  },
  palaceActive: {
    borderColor: '#8B5CF6',
    borderWidth: 2
  },
  starsContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  starCol: {
    alignItems: 'center',
    marginRight: 0,
    marginBottom: 4,
    minWidth: 14
  },
  verticalName: {
    alignItems: 'center'
  },
  starNameVertical: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: Platform.select({ ios: 'PingFang SC', android: 'Noto Sans SC', default: 'Noto Sans SC' }),
    lineHeight: 12
  },
  starBrightnessLine: {
    fontSize: 9,
    color: '#9CA3AF',
    fontFamily: Platform.select({ ios: 'PingFang SC', android: 'Noto Sans SC', default: 'Noto Sans SC' }),
    marginTop: 1
  },
  sihuaBadge: {
    paddingHorizontal: 2,
    paddingVertical: 1,
    borderRadius: 2,
    marginTop: 1
  },
  sihuaBadgeMuted: {
    paddingHorizontal: 1,
    paddingVertical: 0,
    borderRadius: 0, // 方形
    marginTop: 1,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed' // 虚线边框
  },
  sihuaText: {
    fontSize: 8,
    color: 'white',
    fontWeight: 'bold',
    fontFamily: Platform.select({ ios: 'PingFang SC', android: 'Noto Sans SC', default: 'Noto Sans SC' })
  },
  sihuaTextMuted: {
    fontSize: 8,
    color: '#6B7280',
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'PingFang SC', android: 'Noto Sans SC', default: 'Noto Sans SC' })
  },
  sihuaRow: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2
  },
  palaceBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingTop: 2
  },
  stemBranch: {
    alignItems: 'center'
  },
  stemText: {
    fontSize: 9,
    color: '#374151',
    fontFamily: Platform.select({ ios: 'PingFang SC', android: 'Noto Sans SC', default: 'Noto Sans SC' })
  },
  branchText: {
    fontSize: 9,
    color: '#374151',
    fontFamily: Platform.select({ ios: 'PingFang SC', android: 'Noto Sans SC', default: 'Noto Sans SC' })
  },
  palaceName: {
    fontSize: 10,
    fontWeight: '600',
    color: '#111827',
    fontFamily: Platform.select({ ios: 'PingFang SC', android: 'Noto Sans SC', default: 'Noto Sans SC' })
  },
  marker: {
    position: 'absolute',
    right: 2, // 贴近宫名（在右侧）
    bottom: 12,  // 宫名上方基线
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 2
  },
  bodyMarker: {
    backgroundColor: '#FCD34D',
    bottom: 38
  },
  bodyMarkerShift: {
    bottom: 58
  },
  laiyinMarker: {
    backgroundColor: '#EF4444',
    bottom: 38 // 再上移 8px（注意：与身宫相同高度，若需错层请告知）
  },
  markerText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#78350F',
    fontFamily: Platform.select({ ios: 'PingFang SC', android: 'Noto Sans SC', default: 'Noto Sans SC' })
  }
})

// no default export per repository conventions
