import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getRedisClient } from '@/lib/redis';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const checks = {
    timestamp: new Date().toISOString(),
    status: 'ok',
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    checks: {
      database: false,
      redis: false,
      stripe: false,
      dify: false,
      env_vars: false
    }
  };

  try {
    // 1. 数据库连接检查 - 修复为正确的表名
    try {
      const { error } = await supabase
        .from('user_charts')
        .select('count')
        .limit(1);
      
      checks.checks.database = !error;
      if (error) {
        console.error('Database health check failed:', error);
      } else {
        console.log('✅ Database connection successful');
      }
    } catch (error) {
      console.error('Database health check failed:', error);
      checks.checks.database = false;
    }

    // 2. Redis 连接检查
    try {
      const redisClient = getRedisClient();
      if (redisClient) {
        // 测试 Redis 连接
        await redisClient.ping();
        checks.checks.redis = true;
        console.log('✅ Redis connection successful');
      } else {
        // Redis 未配置，使用内存缓存
        checks.checks.redis = false;
        console.log('⚠️ Redis not configured, using memory cache');
      }
    } catch (error) {
      console.error('Redis health check failed:', error);
      checks.checks.redis = false;
    }

    // 3. Stripe 配置检查
    checks.checks.stripe = !!(
      process.env.STRIPE_SECRET_KEY && 
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    );

    // 4. Dify 配置检查
    checks.checks.dify = !!(
      process.env.DIFY_BASE_URL && 
      process.env.DIFY_API_KEY
    );

    // 5. 环境变量检查
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY'
    ];
    
    checks.checks.env_vars = requiredEnvVars.every(varName => {
      const hasVar = process.env[varName] && process.env[varName] !== '';
      if (!hasVar) {
        console.error(`❌ Missing environment variable: ${varName}`);
      }
      return hasVar;
    });

    // 6. 总体状态判断（Redis是可选的，不影响总体状态）
    const criticalChecks = [
      checks.checks.database,
      checks.checks.stripe,
      checks.checks.dify,
      checks.checks.env_vars
    ];
    const allCriticalChecksPass = criticalChecks.every(check => check === true);
    checks.status = allCriticalChecksPass ? 'ok' : 'degraded';

    return NextResponse.json({
      success: true,
      data: checks
    }, { 
      status: 200, // 健康检查API总是返回200，具体状态在data中体现
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json'
      }
    });

  } catch (error) {
    console.error('Health check error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: {
        timestamp: new Date().toISOString(),
        status: 'error',
        checks: checks.checks
      }
    }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json'
      }
    });
  }
} 