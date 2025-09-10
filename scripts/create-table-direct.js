// 直接创建翻译表
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function createTableDirect() {
  console.log('🚀 直接创建fortune_slips_i18n表...\n');

  try {
    // 方法1: 通过创建一个假记录来"创建"表（这通常不工作，但值得一试）
    console.log('方法1: 尝试通过API创建表结构...');
    
    // 首先确认表不存在
    const { data: testData, error: testError } = await supabase
      .from('fortune_slips_i18n')
      .select('*')
      .limit(1);

    if (!testError) {
      console.log('✅ 表已存在');
      return true;
    }

    console.log('❌ 表不存在，错误:', testError.message);

    // 方法2: 创建SQL脚本文件，提示用户手动执行
    const createTableSQL = `
-- 创建多语言翻译表
CREATE TABLE IF NOT EXISTS public.fortune_slips_i18n (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slip_id UUID NOT NULL,
    language_code VARCHAR(10) NOT NULL CHECK (language_code IN ('zh-CN', 'zh-TW', 'en-US')),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    basic_interpretation TEXT NOT NULL,
    historical_context TEXT,
    symbolism TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 确保每个签文的每种语言只有一条记录
    UNIQUE(slip_id, language_code),
    
    -- 外键约束
    FOREIGN KEY (slip_id) REFERENCES public.fortune_slips(id) ON DELETE CASCADE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_fortune_slips_i18n_lookup 
ON public.fortune_slips_i18n(slip_id, language_code);

CREATE INDEX IF NOT EXISTS idx_fortune_slips_i18n_language 
ON public.fortune_slips_i18n(language_code);

-- 启用RLS
ALTER TABLE public.fortune_slips_i18n ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略：任何人都可以读取
CREATE POLICY "Anyone can view fortune translations" ON public.fortune_slips_i18n
    FOR SELECT
    USING (true);

-- Service role可以管理所有数据
CREATE POLICY "Service role can manage fortune translations" ON public.fortune_slips_i18n
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 授权
GRANT SELECT ON public.fortune_slips_i18n TO authenticated;
GRANT SELECT ON public.fortune_slips_i18n TO anon;
GRANT ALL ON public.fortune_slips_i18n TO service_role;
`;

    console.log('\n📝 需要在Supabase Dashboard中手动执行以下SQL:');
    console.log('=====================================');
    console.log(createTableSQL);
    console.log('=====================================');

    // 将SQL保存到文件
    const fs = require('fs');
    const path = require('path');
    const sqlPath = path.join(__dirname, '../sql/create-fortune-slips-i18n.sql');
    fs.writeFileSync(sqlPath, createTableSQL);
    console.log(`\n✅ SQL脚本已保存到: ${sqlPath}`);

    console.log('\n📋 手动创建步骤:');
    console.log('1. 打开 Supabase Dashboard');
    console.log('2. 进入 SQL Editor');
    console.log('3. 复制粘贴上面的SQL并执行');
    console.log('4. 或者运行保存的SQL文件');

    return false;

  } catch (error) {
    console.error('❌ 创建表时发生错误:', error.message);
    return false;
  }
}

async function main() {
  const success = await createTableDirect();
  
  if (success) {
    console.log('\n✅ 表已存在，可以继续导入翻译数据');
  } else {
    console.log('\n⚠️  需要手动创建表后再继续');
  }
}

main();