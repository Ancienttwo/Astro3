/**
 * 中宫2×2网格组件
 * 显示出生信息和八字信息
 */

import React from 'react'
import { View, Text, Platform, StyleSheet } from 'react-native'
import type { CenterInfo } from '../types'
// 复用现有八字核心常量，避免重复实现十神算法
// 注意：通过 tsconfig 路径别名指向 dist 构建产物
// 优先使用 centerInfo.tenGods（由 view-transforms 预计算），
// 仅在缺失时作为兜底依赖核心常量进行即时计算。
import { TEN_GOD_RELATIONSHIPS, BRANCH_HIDDEN_STEMS, STEM_ELEMENTS, BRANCH_ELEMENTS } from '@astroall/bazi-core/chart'

interface CenterGridProps {
  centerInfo: CenterInfo
  chartSize?: number  // Native需要
}

export const CenterGrid: React.FC<CenterGridProps> = ({
  centerInfo,
  chartSize = 400
}) => {
  // —— 本地常量，避免包内循环依赖导致初始化为 undefined ——
  const BRANCH_ORDER = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'] as const
  const LIFE_MASTER_LOCAL = ['贪狼','巨门','禄存','文曲','廉贞','武曲','破军','武曲','廉贞','文曲','禄存','巨门'] as const
  const BODY_MASTER_LOCAL = ['火星','天相','天梁','天同','文昌','天机','火星','天相','天梁','天同','文昌','天机'] as const
  // —— 命主/身主兜底 ——
  const resolveMasters = (): { life: string; body: string } => {
    const life0 = centerInfo.masters?.life || ''
    const body0 = centerInfo.masters?.body || ''
    if (life0 && body0) return { life: life0, body: body0 }
    const idx = BRANCH_ORDER.indexOf(centerInfo.yearZhi as any)
    const life = idx >= 0 ? (LIFE_MASTER_LOCAL[idx] ?? '') : ''
    const body = idx >= 0 ? (BODY_MASTER_LOCAL[idx] ?? '') : ''
    return { life: life0 || life, body: body0 || body }
  }
  const mastersResolved = resolveMasters()
  const displayLife = mastersResolved.life || '—'
  const displayBody = mastersResolved.body || '—'
  const displayZiDou = centerInfo.masters?.ziDou || '—'
  // --- 十神辅助计算（仅 Web 渲染使用，不改变类型层） ---
  const simplifyTenGodChar = (tenGod?: string): string => {
    if (!tenGod) return ''
    // 本地简化映射，避免对未导出的常量产生运行时依赖
    const map: Record<string, string> = {
      比肩: '比', 劫财: '劫', 食神: '食', 伤官: '伤',
      偏财: '财', 正财: '财', 七杀: '杀', 正官: '官',
      偏印: '印', 正印: '印',
    }
    return map[tenGod] || ''
  }

  const calcStemTenGodChar = (dayGan?: string, targetGan?: string, isDay = false): string => {
    if (!dayGan || !targetGan) return ''
    if (isDay) return '主'
    const key = `${dayGan}${targetGan}`
    const tg = (TEN_GOD_RELATIONSHIPS as Record<string, string>)[key]
    return simplifyTenGodChar(tg)
  }

  const calcBranchTenGodChar = (dayGan?: string, branch?: string): string => {
    if (!dayGan || !branch) return ''
    const hidden = (BRANCH_HIDDEN_STEMS as Record<string, Array<{ stem: string; type?: string }>>)[branch]
    if (!hidden || hidden.length === 0) return ''
    // 优先主气(primary)，否则取第一个
    const primary = hidden.find(h => (h as any).type === 'primary') || hidden[0]
    if (!primary) return ''
    const key = `${dayGan}${primary.stem}`
    const tg = (TEN_GOD_RELATIONSHIPS as Record<string, string>)[key]
    return simplifyTenGodChar(tg)
  }

  // —— 五行配色辅助 ——
  const getStemElement = (stem?: string): '木'|'火'|'土'|'金'|'水'|'' => {
    if (!stem) return ''
    const el = (STEM_ELEMENTS as Record<string, string>)[stem]
    return (el as any) || ''
  }
  const getBranchElement = (branch?: string): '木'|'火'|'土'|'金'|'水'|'' => {
    if (!branch) return ''
    const el = (BRANCH_ELEMENTS as Record<string, string>)[branch]
    return (el as any) || ''
  }
  const wuxingClass = (el: string) => (el ? `wuxing-${el}` : '')
  const wuxingColor = (el: string) => {
    switch (el) {
      case '木': return '#16A34A'
      case '火': return '#DC2626'
      case '土': return '#A16207'
      case '金': return '#9CA3AF'
      case '水': return '#2563EB'
      default: return '#374151'
    }
  }

  // Web版本 - 合并的2×2单一区域
  const [collapsed, setCollapsed] = React.useState(false)
  if (Platform.OS === 'web') {
    return (
      <div className="center-grid-merged">
        <button type="button" className="center-toggle-btn" onClick={() => setCollapsed(v => !v)}>
          {collapsed ? '显示中宫' : '隐藏中宫'}
        </button>
        {/* 顶部：第一行 + 其余行（可隐藏） */}
        <div className="center-info-block">
          {/* 第一行：昵称｜性别｜五行局 */}
          <div className="info-line">
            <span className="info-label">昵称：</span>
            <span className="info-value">{centerInfo.name || '游客'}</span>
            <span className="info-value">{centerInfo.gender}</span>
            <span className="info-value">{centerInfo.fiveElementsBureau || '—'}</span>
          </div>
          {!collapsed && (
            <>
              <div className="info-line">
                <span className="info-label">公历：</span>
                <span className="info-value">{centerInfo.birthDate} {centerInfo.birthTime}</span>
              </div>
              <div className="info-line">
                <span className="info-label">农历：</span>
                <span className="info-value">{centerInfo.lunarDate} {centerInfo.lunarTime}</span>
              </div>
              <div className="info-line info-line--masters">
                <span className="info-label">命主：</span>
                <span className="info-value">{displayLife}</span>
                <span className="info-label">身主：</span>
                <span className="info-value">{displayBody}</span>
                <span className="info-label">子斗：</span>
                <span className="info-value">{displayZiDou}</span>
              </div>
            </>
          )}
        </div>
        {/* 中部：八字（按行文本排版，无表格） */}
        {!collapsed && (
        <div className="center-bazi-section">
          <div className="bazi-lines">
            <div className="bazi-line bazi-line--label">
              <span>年</span><span>月</span><span>日</span><span>时</span>
            </div>
            <div className="bazi-line bazi-line--ten-god">
              <span>{centerInfo.tenGods?.year?.stem ?? calcStemTenGodChar(centerInfo.dayGan, centerInfo.yearGan, false)}</span>
              <span>{centerInfo.tenGods?.month?.stem ?? calcStemTenGodChar(centerInfo.dayGan, centerInfo.monthGan, false)}</span>
              <span>{centerInfo.tenGods?.day?.stem ?? calcStemTenGodChar(centerInfo.dayGan, centerInfo.dayGan, true)}</span>
              <span>{centerInfo.tenGods?.hour?.stem ?? calcStemTenGodChar(centerInfo.dayGan, centerInfo.hourGan, false)}</span>
            </div>
            <div className="bazi-line bazi-line--stem">
              <span className={wuxingClass(getStemElement(centerInfo.yearGan))}>{centerInfo.yearGan}</span>
              <span className={wuxingClass(getStemElement(centerInfo.monthGan))}>{centerInfo.monthGan}</span>
              <span className={wuxingClass(getStemElement(centerInfo.dayGan))}>{centerInfo.dayGan}</span>
              <span className={wuxingClass(getStemElement(centerInfo.hourGan))}>{centerInfo.hourGan}</span>
            </div>
            <div className="bazi-line bazi-line--branch">
              <span className={wuxingClass(getBranchElement(centerInfo.yearZhi))}>{centerInfo.yearZhi}</span>
              <span className={wuxingClass(getBranchElement(centerInfo.monthZhi))}>{centerInfo.monthZhi}</span>
              <span className={wuxingClass(getBranchElement(centerInfo.dayZhi))}>{centerInfo.dayZhi}</span>
              <span className={wuxingClass(getBranchElement(centerInfo.hourZhi))}>{centerInfo.hourZhi}</span>
            </div>
            <div className="bazi-line bazi-line--ten-god-branch">
              <span>{centerInfo.tenGods?.year?.branch ?? calcBranchTenGodChar(centerInfo.dayGan, centerInfo.yearZhi)}</span>
              <span>{centerInfo.tenGods?.month?.branch ?? calcBranchTenGodChar(centerInfo.dayGan, centerInfo.monthZhi)}</span>
              <span>{centerInfo.tenGods?.day?.branch ?? calcBranchTenGodChar(centerInfo.dayGan, centerInfo.dayZhi)}</span>
              <span>{centerInfo.tenGods?.hour?.branch ?? calcBranchTenGodChar(centerInfo.dayGan, centerInfo.hourZhi)}</span>
            </div>
          </div>
        </div>
        )}
        {/* 起运：位于八字与大运之间，居中显示 */}
        {!collapsed && centerInfo.startLuck && (
          <div className="center-start-luck">
            <span className="info-label">起运：</span>
            <span className="info-value">{centerInfo.startLuck}</span>
          </div>
        )}
        {/* 八个大运：位于八字下方，居中排布 */}
        {!collapsed && Array.isArray(centerInfo.majorPeriods8) && centerInfo.majorPeriods8.length > 0 && (
          <div className="center-dayun-8">
          {centerInfo.majorPeriods8!.map((p, idx) => {
            const stemEl = getStemElement(p.stem as any)
            const branchEl = getBranchElement(p.branch as any)
            return (
              <div key={idx} className="dayun-col">
                <div className="dayun-tg-stem">{p.tgStem || '—'}</div>
                <div className={`dayun-gan ${wuxingClass(stemEl)}`}>{p.stem || '—'}</div>
                <div className={`dayun-zhi ${wuxingClass(branchEl)}`}>{p.branch || '—'}</div>
                <div className="dayun-tg-branch">{p.tgBranch || '—'}</div>
                <div className="dayun-start-age">{Number.isFinite(p.startAge as any) ? String(p.startAge) : '—'}</div>
              </div>
            )
          })}
          </div>
        )}

      </div>
    )
  }
  
  // Native版本
  const centerSize = chartSize / 2
  const centerPosition = chartSize / 4
  
  return (
    <View style={[
      styles.centerContainer,
      {
        width: centerSize,
        height: centerSize,
        left: centerPosition,
        top: centerPosition
      }
    ]}>
      <View style={styles.centerGrid}>
        {/* 左上: 名字｜性别｜五行局 */}
        <View style={[styles.centerCell, styles.topLeft]}>
          <Text style={styles.nameText} numberOfLines={1}>
            {centerInfo.name || '—'} ｜ {centerInfo.gender} ｜ {centerInfo.fiveElementsBureau || ''}
          </Text>
        </View>
        
        {/* 右上: 公历 + 命主/身主/子斗（单行） */}
        <View style={[styles.centerCell, styles.topRight]}>
          <Text style={styles.labelText}>公历</Text>
          <Text style={styles.dateText}>{centerInfo.birthDate} {centerInfo.birthTime}</Text>
          <Text style={styles.dateText} numberOfLines={1}>
            命主：{displayLife}｜身主：{displayBody}｜子斗：{displayZiDou}
          </Text>
          {!!centerInfo.startLuck && (
            <Text style={styles.dateText} numberOfLines={1}>
              起运：{centerInfo.startLuck}
            </Text>
          )}
        </View>
        
        {/* 左下: 农历日期 */}
        <View style={[styles.centerCell, styles.bottomLeft]}>
          <Text style={styles.labelText}>农历</Text>
          <Text style={styles.lunarText}>{centerInfo.lunarDate}</Text>
          <Text style={styles.lunarTimeText}>{centerInfo.lunarTime}</Text>
        </View>
        
        {/* 右下: 四柱八字（含十神五行布局） */}
        <View style={[styles.centerCell, styles.bottomRight]}>
          <View style={styles.baziContainer}>
            {/* 年 */}
            <View style={styles.baziColumn}>
              <Text style={styles.baziLabel}>年</Text>
              <Text style={styles.tenGodText}>{centerInfo.tenGods?.year?.stem || calcStemTenGodChar(centerInfo.dayGan, centerInfo.yearGan, false)}</Text>
              <Text style={[styles.ganText, { color: wuxingColor(getStemElement(centerInfo.yearGan)) }]}>{centerInfo.yearGan}</Text>
              <Text style={[styles.zhiText, { color: wuxingColor(getBranchElement(centerInfo.yearZhi)) }]}>{centerInfo.yearZhi}</Text>
              <Text style={styles.tenGodText}>{centerInfo.tenGods?.year?.branch || calcBranchTenGodChar(centerInfo.dayGan, centerInfo.yearZhi)}</Text>
            </View>
            {/* 月 */}
            <View style={styles.baziColumn}>
              <Text style={styles.baziLabel}>月</Text>
              <Text style={styles.tenGodText}>{centerInfo.tenGods?.month?.stem || calcStemTenGodChar(centerInfo.dayGan, centerInfo.monthGan, false)}</Text>
              <Text style={[styles.ganText, { color: wuxingColor(getStemElement(centerInfo.monthGan)) }]}>{centerInfo.monthGan}</Text>
              <Text style={[styles.zhiText, { color: wuxingColor(getBranchElement(centerInfo.monthZhi)) }]}>{centerInfo.monthZhi}</Text>
              <Text style={styles.tenGodText}>{centerInfo.tenGods?.month?.branch || calcBranchTenGodChar(centerInfo.dayGan, centerInfo.monthZhi)}</Text>
            </View>
            {/* 日 */}
            <View style={styles.baziColumn}>
              <Text style={styles.baziLabel}>日</Text>
              <Text style={styles.tenGodText}>{centerInfo.tenGods?.day?.stem || calcStemTenGodChar(centerInfo.dayGan, centerInfo.dayGan, true)}</Text>
              <Text style={[styles.ganText, { color: wuxingColor(getStemElement(centerInfo.dayGan)) }]}>{centerInfo.dayGan}</Text>
              <Text style={[styles.zhiText, { color: wuxingColor(getBranchElement(centerInfo.dayZhi)) }]}>{centerInfo.dayZhi}</Text>
              <Text style={styles.tenGodText}>{centerInfo.tenGods?.day?.branch || calcBranchTenGodChar(centerInfo.dayGan, centerInfo.dayZhi)}</Text>
            </View>
            {/* 时 */}
            <View style={styles.baziColumn}>
              <Text style={styles.baziLabel}>时</Text>
              <Text style={styles.tenGodText}>{centerInfo.tenGods?.hour?.stem || calcStemTenGodChar(centerInfo.dayGan, centerInfo.hourGan, false)}</Text>
              <Text style={[styles.ganText, { color: wuxingColor(getStemElement(centerInfo.hourGan)) }]}>{centerInfo.hourGan}</Text>
              <Text style={[styles.zhiText, { color: wuxingColor(getBranchElement(centerInfo.hourZhi)) }]}>{centerInfo.hourZhi}</Text>
              <Text style={styles.tenGodText}>{centerInfo.tenGods?.hour?.branch || calcBranchTenGodChar(centerInfo.dayGan, centerInfo.hourZhi)}</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  centerContainer: {
    position: 'absolute',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  centerGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  centerCell: {
    width: '50%',
    height: '50%',
    padding: 8,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center'
  },
  topLeft: {
    borderTopWidth: 0,
    borderLeftWidth: 0
  },
  topRight: {
    borderTopWidth: 0,
    borderRightWidth: 0
  },
  bottomLeft: {
    borderBottomWidth: 0,
    borderLeftWidth: 0
  },
  bottomRight: {
    borderBottomWidth: 0,
    borderRightWidth: 0
  },
  nameText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#111827',
    fontFamily: Platform.select({ ios: 'PingFang SC', android: 'Noto Sans SC', default: 'Noto Sans SC' }),
    marginBottom: 4
  },
  genderText: {
    fontSize: 8,
    color: '#6B7280',
    fontFamily: Platform.select({ ios: 'PingFang SC', android: 'Noto Sans SC', default: 'Noto Sans SC' })
  },
  labelText: {
    fontSize: 7,
    color: '#374151',
    fontWeight: '700',
    marginBottom: 2,
    fontFamily: Platform.select({ ios: 'PingFang SC', android: 'Noto Sans SC', default: 'Noto Sans SC' })
  },
  dateText: {
    fontSize: 7,
    color: '#374151',
    marginBottom: 2,
    fontFamily: Platform.select({ ios: 'PingFang SC', android: 'Noto Sans SC', default: 'Noto Sans SC' })
  },
  timeText: {
    fontSize: 6,
    color: '#6B7280',
    fontFamily: Platform.select({ ios: 'PingFang SC', android: 'Noto Sans SC', default: 'Noto Sans SC' })
  },
  lunarText: {
    fontSize: 7,
    color: '#374151',
    marginBottom: 2,
    fontFamily: Platform.select({ ios: 'PingFang SC', android: 'Noto Sans SC', default: 'Noto Sans SC' })
  },
  lunarTimeText: {
    fontSize: 6,
    color: '#6B7280',
    fontFamily: Platform.select({ ios: 'PingFang SC', android: 'Noto Sans SC', default: 'Noto Sans SC' })
  },
  baziContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%'
  },
  baziColumn: {
    alignItems: 'center'
  },
  ganText: {
    fontSize: 7,
    fontWeight: '600',
    color: '#DC2626',
    fontFamily: Platform.select({ ios: 'PingFang SC', android: 'Noto Sans SC', default: 'Noto Sans SC' })
  },
  zhiText: {
    fontSize: 7,
    fontWeight: '600',
    color: '#1E40AF',
    fontFamily: Platform.select({ ios: 'Noto Sans SC', android: 'Noto Sans SC', default: 'Noto Sans SC' })
  },
  baziLabel: {
    fontSize: 7,
    color: '#111827',
    marginTop: 2,
    fontFamily: Platform.select({ ios: 'Noto Sans SC', android: 'Noto Sans SC', default: 'Noto Sans SC' })
  },
  tenGodText: {
    fontSize: 9,
    color: '#6B7280',
    fontWeight: '600',
    fontFamily: Platform.select({ ios: 'Noto Sans SC', android: 'Noto Sans SC', default: 'Noto Sans SC' })
  }
})

// no default export per repository conventions
