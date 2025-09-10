/**
 * DIFY Prompt优化器 - 提升性能和准确性
 * 基于DIFY官方性能最佳实践
 */

interface PromptOptimizationConfig {
  maxLength: number;
  priority: 'speed' | 'accuracy' | 'balanced';
  complexity: 'simple' | 'medium' | 'complex';
}

export class PromptOptimizer {
  
  /**
   * 优化八字分析Prompt - 减少处理时间
   */
  static optimizeBaziPrompt(baziData: any, config: PromptOptimizationConfig = {
    maxLength: 1500,
    priority: 'balanced',
    complexity: 'medium'
  }): string {
    
    const { priority, complexity } = config;
    
    // 基础信息（必须）
    let prompt = `八字命理分析：
性别：${baziData.gender}
四柱：${baziData.baziString}`;

    // 根据复杂度级别添加信息
    if (complexity === 'simple') {
      prompt += `\n\n请简要分析：性格特质、事业方向、财运概况`;
    } else if (complexity === 'medium') {
      prompt += `\n五行：${baziData.wuxingInfo}
用神：${baziData.yongShenInfo}

请分析：
1. 性格特质与优势
2. 事业发展方向  
3. 财运与人际关系
4. 需要注意的方面`;
    } else {
      // complex - 完整分析
      prompt += `\n${baziData.tenGodsInfo}
${baziData.hiddenStemsInfo}
${baziData.dayunInfo}
用神分析：${baziData.yongShenInfo}

请基于盲派理论深度分析：
1. 格局判断与命局特点
2. 性格特质与天赋才能
3. 事业发展与适合行业
4. 财运分析与理财建议
5. 婚姻感情与人际关系
6. 健康状况与养生建议`;
    }

    // 性能优化：限制长度
    if (prompt.length > config.maxLength) {
      console.log(`⚡ Prompt优化：从${prompt.length}字符压缩到${config.maxLength}字符`);
      prompt = prompt.substring(0, config.maxLength) + '...';
    }

    return prompt;
  }

  /**
   * 优化紫微斗数Prompt
   */
  static optimizeZiweiPrompt(arrowData: any, config: PromptOptimizationConfig = {
    maxLength: 1200,
    priority: 'balanced', 
    complexity: 'medium'
  }): string {
    
    const { complexity } = config;
    
    let prompt = `紫微斗数分析：
命盘信息：${JSON.stringify(arrowData, null, 2)}`;

    if (complexity === 'simple') {
      prompt = `紫微斗数简析：请根据命盘数据分析基本性格和人生大方向`;
    } else if (complexity === 'medium') {
      prompt = `紫微斗数分析：
请分析命盘的：
1. 命宫主星特质
2. 财帛宫财运状况
3. 事业宫发展方向
4. 夫妻宫感情运势
5. 总体格局建议`;
    }
    // complex保持原样，包含详细命盘数据

    // 性能优化：限制长度
    if (prompt.length > config.maxLength) {
      console.log(`⚡ 紫微Prompt优化：从${prompt.length}字符压缩到${config.maxLength}字符`);
      prompt = prompt.substring(0, config.maxLength) + '...';
    }

    return prompt;
  }

  /**
   * 智能选择复杂度级别
   */
  static selectComplexity(requestContext: {
    isFirstTime?: boolean;
    userLevel?: 'beginner' | 'intermediate' | 'advanced';
    timeConstraint?: 'urgent' | 'normal' | 'detailed';
    networkQuality?: 'poor' | 'good' | 'excellent';
  }): 'simple' | 'medium' | 'complex' {
    
    const { isFirstTime, userLevel, timeConstraint, networkQuality } = requestContext;
    
    // 网络质量差 → 简单模式
    if (networkQuality === 'poor') return 'simple';
    
    // 急需结果 → 简单或中等模式
    if (timeConstraint === 'urgent') {
      return userLevel === 'beginner' ? 'simple' : 'medium';
    }
    
    // 新用户 → 中等模式（平衡体验和性能）
    if (isFirstTime || userLevel === 'beginner') return 'medium';
    
    // 高级用户且网络良好 → 复杂模式
    if (userLevel === 'advanced' && networkQuality === 'excellent') {
      return 'complex';
    }
    
    // 默认中等模式
    return 'medium';
  }

  /**
   * 分析请求成本 - 帮助选择最佳策略
   */
  static analyzeRequestCost(prompt: string): {
    tokens: number;
    estimatedTime: number;
    costLevel: 'low' | 'medium' | 'high';
    recommendation: string;
  } {
    
    const tokens = Math.ceil(prompt.length / 3.5); // 估算token数
    
    let estimatedTime: number;
    let costLevel: 'low' | 'medium' | 'high';
    let recommendation: string;
    
    if (tokens < 500) {
      estimatedTime = 30;
      costLevel = 'low';
      recommendation = '快速响应，适合实时交互';
    } else if (tokens < 1500) {
      estimatedTime = 90;
      costLevel = 'medium';
      recommendation = '平衡模式，推荐用于大多数分析';
    } else {
      estimatedTime = 180;
      costLevel = 'high';
      recommendation = '深度分析，适合详细报告';
    }
    
    return {
      tokens,
      estimatedTime,
      costLevel,
      recommendation
    };
  }
}

/**
 * DIFY性能监控器
 */
export class DifyPerformanceMonitor {
  private static metrics: Map<string, number[]> = new Map();
  
  static recordResponseTime(agentType: string, responseTime: number) {
    if (!this.metrics.has(agentType)) {
      this.metrics.set(agentType, []);
    }
    
    const times = this.metrics.get(agentType)!;
    times.push(responseTime);
    
    // 只保留最近50次记录
    if (times.length > 50) {
      times.shift();
    }
    
    // 性能报告
    if (times.length >= 10) {
      const avg = times.reduce((a, b) => a + b, 0) / times.length;
      const slowRequests = times.filter(t => t > 120000).length; // 超过2分钟
      
      if (slowRequests > times.length * 0.3) {
        console.log(`⚠️ ${agentType}性能警告：30%请求超过2分钟，建议优化Prompt复杂度`);
      }
      
      console.log(`📊 ${agentType}性能统计：平均${(avg/1000).toFixed(1)}秒，慢请求${slowRequests}/${times.length}`);
    }
  }
  
  static getRecommendedComplexity(agentType: string): 'simple' | 'medium' | 'complex' {
    const times = this.metrics.get(agentType) || [];
    
    if (times.length < 5) return 'medium'; // 默认中等
    
    const recentAvg = times.slice(-10).reduce((a, b) => a + b, 0) / Math.min(times.length, 10);
    
    if (recentAvg > 150000) return 'simple';    // 超过2.5分钟 → 简化
    if (recentAvg > 90000) return 'medium';     // 超过1.5分钟 → 中等
    return 'complex';                           // 性能良好 → 复杂分析
  }
} 