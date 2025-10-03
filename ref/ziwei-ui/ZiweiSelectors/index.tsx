/**
 * 大运/流年/流月选择器组件
 * 支持横向滚动选择
 * 平台自适应
 */

import React from 'react'
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Platform,
  StyleSheet 
} from 'react-native'
import type { ZiweiSelectorsProps } from '../types'

export const ZiweiSelectors: React.FC<ZiweiSelectorsProps> = ({
  periods,
  years,
  months,
  selectedPeriod,
  selectedYear,
  selectedMonth,
  onPeriodChange,
  onYearChange,
  onMonthChange
}) => {
  // Web版本
  if (Platform.OS === 'web') {
    return (
      <div className="ziwei-selectors">
        {/* 大运选择器 */}
        <div className="selector-section">
          <div className="selector-title">大运</div>
          <div className="selector-scroll">
            <div className="selector-items">
              {periods.map(period => (
                <div
                  key={period.id}
                  className={`selector-item ${selectedPeriod === period.id ? 'selected' : ''}`}
                  onClick={() => onPeriodChange(period.id)}
                >
                  <div className="item-text">{period.text}</div>
                  <div className="item-subtext">{period.subtext}</div>
                  <div className="item-age">{period.ageRange}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* 流年选择器 */}
        <div className="selector-section">
          <div className="selector-title">流年</div>
          <div className="selector-scroll">
            <div className="selector-items">
              {years.map(year => (
                <div
                  key={year.id}
                  className={`selector-item ${selectedYear === year.id ? 'selected' : ''}`}
                  onClick={() => onYearChange(year.id)}
                >
                  <div className="item-text">{year.text}</div>
                  <div className="item-age">{year.age}岁</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* 流月选择器 */}
        <div className="selector-section">
          <div className="selector-title">流月</div>
          <div className="selector-scroll">
            <div className="selector-items">
              {months.map(month => (
                <div
                  key={month.id}
                  className={`selector-item month-item ${selectedMonth === month.id ? 'selected' : ''}`}
                  onClick={() => onMonthChange(month.id)}
                >
                  <div className="item-text">{month.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  // Native版本
  return (
    <View style={styles.container}>
      {/* 大运选择器 */}
      <View style={styles.selectorSection}>
        <Text style={styles.selectorTitle}>大运</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.scrollView}
        >
          {periods.map(period => (
            <TouchableOpacity
              key={period.id}
              style={[
                styles.selectorItem,
                selectedPeriod === period.id && styles.selectedItem
              ]}
              onPress={() => onPeriodChange(period.id)}
            >
              <Text style={[
                styles.itemText,
                selectedPeriod === period.id && styles.selectedText
              ]}>
                {period.text}
              </Text>
              <Text style={[
                styles.itemSubtext,
                selectedPeriod === period.id && styles.selectedSubtext
              ]}>
                {period.subtext}
              </Text>
              <Text style={[
                styles.itemAge,
                selectedPeriod === period.id && styles.selectedAge
              ]}>
                {period.ageRange}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      {/* 流年选择器 */}
      <View style={styles.selectorSection}>
        <Text style={styles.selectorTitle}>流年</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.scrollView}
        >
          {years.map(year => (
            <TouchableOpacity
              key={year.id}
              style={[
                styles.selectorItem,
                styles.yearItem,
                selectedYear === year.id && styles.selectedItem
              ]}
              onPress={() => onYearChange(year.id)}
            >
              <Text style={[
                styles.itemText,
                selectedYear === year.id && styles.selectedText
              ]}>
                {year.text}
              </Text>
              <Text style={[
                styles.itemAge,
                selectedYear === year.id && styles.selectedAge
              ]}>
                {year.age}岁
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      {/* 流月选择器 */}
      <View style={styles.selectorSection}>
        <Text style={styles.selectorTitle}>流月</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.scrollView}
        >
          {months.map(month => (
            <TouchableOpacity
              key={month.id}
              style={[
                styles.selectorItem,
                styles.monthItem,
                selectedMonth === month.id && styles.selectedItem
              ]}
              onPress={() => onMonthChange(month.id)}
            >
              <Text style={[
                styles.itemText,
                selectedMonth === month.id && styles.selectedText
              ]}>
                {month.text}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10
  },
  selectorSection: {
    marginBottom: 15
  },
  selectorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    paddingHorizontal: 15,
    marginBottom: 8,
    fontFamily: Platform.select({ ios: 'PingFang SC', android: 'Noto Sans SC', default: 'Noto Sans SC' })
  },
  scrollView: {
    paddingHorizontal: 10
  },
  selectorItem: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 5,
    minWidth: 80,
    alignItems: 'center'
  },
  yearItem: {
    minWidth: 70
  },
  monthItem: {
    minWidth: 60
  },
  selectedItem: {
    backgroundColor: '#8B5CF6'
  },
  itemText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    fontFamily: Platform.select({ ios: 'PingFang SC', android: 'Noto Sans SC', default: 'Noto Sans SC' })
  },
  selectedText: {
    color: '#FFFFFF'
  },
  itemSubtext: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
    fontFamily: Platform.select({ ios: 'PingFang SC', android: 'Noto Sans SC', default: 'Noto Sans SC' })
  },
  selectedSubtext: {
    color: '#E9D5FF'
  },
  itemAge: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 4,
    fontFamily: Platform.select({ ios: 'Noto Sans SC', android: 'Noto Sans SC', default: 'Noto Sans SC' })
  },
  selectedAge: {
    color: '#DDD6FE'
  }
})

// no default export per repository conventions
