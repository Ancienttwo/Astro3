'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function EnglishChartsPage() {
  const router = useRouter();
  
  useEffect(() => {
    // 重定向到带语言参数的命盘记录页面
    router.replace('/charts?lang=en');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-primary/5 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        <p className="text-muted-foreground">Redirecting to Charts...</p>
      </div>
    </div>
  );
} 