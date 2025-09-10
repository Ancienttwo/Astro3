"use client";

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function DebugAuthPage() {
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message: string) => {
    setResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testSupabaseConnection = async () => {
    setLoading(true);
    setResults([]);
    
    try {
      addResult('开始测试 Supabase 连接...');
      
      // 测试基本连接
      addResult('1. 测试基本配置...');
      const url = supabase.supabaseUrl;
      const key = supabase.supabaseKey;
      addResult(`URL: ${url}`);
      addResult(`Key存在: ${!!key}`);
      
      // 测试健康检查
      addResult('2. 测试健康检查...');
      try {
        const response = await fetch(`${url}/auth/v1/health`);
        const health = await response.text();
        addResult(`健康检查: ${health}`);
      } catch (e) {
        addResult(`健康检查失败: ${e}`);
      }
      
      // 测试获取会话
      addResult('3. 测试获取会话...');
      try {
        const { data: session, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          addResult(`会话错误: ${sessionError.message}`);
        } else {
          addResult(`会话状态: ${session ? '已登录' : '未登录'}`);
        }
      } catch (e) {
        addResult(`会话获取失败: ${e}`);
      }
      
      // 测试基本数据库查询
      addResult('4. 测试数据库查询...');
      try {
        const { data, error } = await supabase
          .from('temple_systems')
          .select('temple_name')
          .limit(1);
        
        if (error) {
          addResult(`数据库查询错误: ${error.message}`);
        } else {
          addResult(`数据库查询成功: 找到 ${data?.length || 0} 条记录`);
        }
      } catch (e) {
        addResult(`数据库查询失败: ${e}`);
      }
      
      addResult('测试完成！');
      
    } catch (error) {
      addResult(`总体错误: ${error}`);
    }
    
    setLoading(false);
  };

  const testAuthSignIn = async () => {
    setLoading(true);
    addResult('开始测试认证登录...');
    
    try {
      const testEmail = 'test@example.com';
      const testPassword = 'testpassword123';
      
      addResult(`尝试登录: ${testEmail}`);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      });
      
      if (error) {
        addResult(`登录错误: ${error.message}`);
      } else {
        addResult(`登录成功: ${data?.user?.email || '未知用户'}`);
      }
      
    } catch (error) {
      addResult(`登录异常: ${error}`);
    }
    
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Supabase 认证调试页面</h1>
      
      <div className="space-y-4 mb-6">
        <button
          onClick={testSupabaseConnection}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? '测试中...' : '测试 Supabase 连接'}
        </button>
        
        <button
          onClick={testAuthSignIn}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 ml-2"
        >
          {loading ? '测试中...' : '测试认证登录'}
        </button>
      </div>
      
      <div className="bg-gray-100 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">测试结果:</h2>
        <div className="space-y-1 max-h-96 overflow-y-auto">
          {results.map((result, index) => (
            <div key={index} className="text-sm font-mono">
              {result}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}