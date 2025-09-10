import { NextRequest, NextResponse } from 'next/server';
import { translationBackupManager } from '@/lib/translation-backup';
import { supabaseAdmin } from '@/lib/supabase';

// 获取备份列表
export async function GET(request: NextRequest) {
  try {
    const backups = await translationBackupManager.getBackupList();
    return NextResponse.json(backups);
  } catch (error) {
    console.error('获取备份列表失败:', error);
    return NextResponse.json({ error: '获取备份列表失败' }, { status: 500 });
  }
}

// 创建备份
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !userData.user) {
      return NextResponse.json({ error: '认证失败' }, { status: 401 });
    }

    const body = await request.json();
    const { description } = body;

    const backupPath = await translationBackupManager.createFullBackup(description);
    
    return NextResponse.json({
      message: '备份创建成功',
      backup_path: backupPath,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('创建备份失败:', error);
    return NextResponse.json({ error: '创建备份失败' }, { status: 500 });
  }
}

// 恢复备份
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    
    if (userError || !userData.user) {
      return NextResponse.json({ error: '认证失败' }, { status: 401 });
    }

    const body = await request.json();
    const { version } = body;

    if (!version) {
      return NextResponse.json({ error: '缺少备份版本号' }, { status: 400 });
    }

    await translationBackupManager.restoreBackup(version);
    
    return NextResponse.json({
      message: '备份恢复成功',
      version,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('恢复备份失败:', error);
    return NextResponse.json({ error: '恢复备份失败' }, { status: 500 });
  }
} 