import { NextRequest, NextResponse } from 'next/server';
import { createAPIResponse, createAPIErrorResponse } from '@/lib/api-auth';

// 性能指标收集API
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // 基本验证
    if (!data.type || !data.name || typeof data.value !== 'number') {
      return createAPIErrorResponse('Invalid metric data', 400);
    }

    // 在生产环境中，这里应该存储到数据库或发送到监控服务
    if (process.env.NODE_ENV === 'production') {
      // 示例：发送到外部监控服务
      // await sendToMonitoringService(data);
      
      // 或存储到数据库
      // await storeMetricToDatabase(data);
    }

    // 开发环境输出到控制台
    if (process.env.NODE_ENV === 'development') {
      console.log('📊 Performance Metric:', {
        type: data.type,
        name: data.name,
        value: data.value,
        rating: data.rating,
        url: data.url,
        timestamp: new Date(data.timestamp).toISOString()
      });
    }

    return createAPIResponse({ success: true });
  } catch (error) {
    console.error('Performance metrics error:', error);
    return createAPIErrorResponse('Failed to process metric', 500);
  }
}

// 获取性能指标统计
export async function GET(request: NextRequest) {
  try {
    // 这里应该从数据库查询性能指标统计
    const mockStats = {
      webVitals: {
        cls: { average: 0.05, rating: 'good' },
        fid: { average: 45, rating: 'good' },
        lcp: { average: 1200, rating: 'good' },
        fcp: { average: 800, rating: 'good' },
        ttfb: { average: 150, rating: 'good' }
      },
      customMetrics: {
        pageLoadTime: { average: 1500, unit: 'ms' },
        apiCallSuccess: { average: 250, unit: 'ms' },
        userInteraction: { average: 50, unit: 'ms' }
      },
      summary: {
        score: 95,
        totalMetrics: 1250,
        goodMetrics: 1187
      }
    };

    return createAPIResponse(mockStats);
  } catch (error) {
    console.error('Performance stats error:', error);
    return createAPIErrorResponse('Failed to get performance stats', 500);
  }
}