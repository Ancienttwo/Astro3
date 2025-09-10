#!/bin/bash

# 关帝灵签多语言系统 - Supabase CLI部署脚本
# 作者: SuperClaude 架构师
# 创建日期: 2025-01-31

set -e

echo "🚀 开始部署关帝灵签多语言系统到Supabase..."
echo "================================================"

# 检查Supabase CLI是否安装
if ! command -v supabase &> /dev/null; then
    echo "❌ 错误: Supabase CLI未安装"
    echo "请先安装: npm install -g supabase@latest"
    echo "或访问: https://supabase.com/docs/guides/cli"
    exit 1
fi

# 检查是否已登录
echo "🔐 检查Supabase登录状态..."
if ! supabase projects list &> /dev/null; then
    echo "⚠️  未登录Supabase，请先登录:"
    echo "supabase login"
    exit 1
fi

echo "✅ Supabase CLI已就绪"

# 检查项目是否已链接
if [ ! -f ".supabase/config.toml" ]; then
    echo "⚠️  项目未链接到Supabase"
    echo "请先链接项目: supabase link --project-ref your-project-ref"
    exit 1
fi

echo "✅ 项目已链接"

# 1. 执行多语言数据库Schema
echo ""
echo "📊 步骤 1: 部署多语言数据库Schema..."
echo "--------------------------------------"

supabase db push

if [ $? -eq 0 ]; then
    echo "✅ 数据库Schema部署成功"
else
    echo "❌ 数据库Schema部署失败"
    exit 1
fi

# 2. 执行SQL迁移脚本
echo ""
echo "🔧 步骤 2: 执行多语言系统迁移..."
echo "--------------------------------------"

# 执行多语言系统SQL脚本
cat sql/multilingual-fortune-system-enhanced.sql | supabase db psql

if [ $? -eq 0 ]; then
    echo "✅ 多语言系统迁移完成"
else
    echo "❌ 多语言系统迁移失败"
    exit 1
fi

# 3. 插入示例数据
echo ""
echo "📝 步骤 3: 插入示例签文数据..."
echo "--------------------------------------"

# 创建临时SQL文件用于插入数据
cat > /tmp/insert_sample_data.sql << 'EOF'
-- 插入第7签数据
INSERT INTO fortune_slips (slip_number, temple_code, fortune_level, categories) 
VALUES (7, 'guandi', 'excellent', ARRAY['修道', '求医', '功名', '仙缘'])
ON CONFLICT (temple_code, slip_number) DO NOTHING;

-- 获取第7签的ID
DO $$
DECLARE
    slip_7_id UUID;
BEGIN
    SELECT id INTO slip_7_id FROM fortune_slips WHERE temple_code = 'guandi' AND slip_number = 7;
    
    -- 插入第7签的多语言数据
    -- 繁体中文版本
    INSERT INTO fortune_slips_i18n (slip_id, language_code, title, content, basic_interpretation, historical_context, symbolism, keywords)
    VALUES (
        slip_7_id,
        'zh-TW',
        '洞賓煉丹',
        '仙風道骨本天生、又遇仙宗為主盟、指日丹成謝巖谷、一朝引領向天行。',
        '比別人幸運的是天生就有道緣，而且又遇到高人的指點，可以很順利的尋得求道之路，而且可以一路順遂，得到不錯的成就。此籤又可解為求醫者可求得良藥，但又有仙升，即作古升天之意，故求籤者要小心處置。此籤雖是大吉，但除了以上所提之事，對其餘事情幾乎都無任何影響，所以不可全部判斷為大吉籤。',
        '洞賓煉丹 唐呂岩。字洞賓。天寶十四年四月十四日巳時生。自號純陽子。由進士授江州德化縣令。私行廬遇鍾離真人。授天仙劍法。另曰遇火龍真人。授天遁劍法。得九九數。學金丹之術。居深山中煉丹。丹成長生不老。多往來湘鄂間。滕守宗諒嘗遇諸岳陽樓。自稱華州道人。',
        '本來天生就是仙風道骨，又遇到神仙的好幫助，立即煉成仙丹妙藥，離開了山谷，一旦成仙，遨遊天外去。這首籤詩，表示本來天生仙骨，又得神仙之助，乃得成仙昇騰，也就是暗示，凡高貴的人占得此籤，必事事遂意。若貧賤的人，占得此籤，僅是平常而已。如問疾病，占得此籤，表示當有名醫來治，在一個月內可以治好，否則即有仙逝之兆。',
        ARRAY['洞賓', '煉丹', '仙風道骨', '大吉', '修道', '求醫']
    ) ON CONFLICT (slip_id, language_code) DO NOTHING;
    
    -- 简体中文版本
    INSERT INTO fortune_slips_i18n (slip_id, language_code, title, content, basic_interpretation, historical_context, symbolism, keywords)
    VALUES (
        slip_7_id,
        'zh-CN',
        '洞宾炼丹',
        '仙风道骨本天生、又遇仙宗为主盟、指日丹成谢岩谷、一朝引领向天行。',
        '比别人幸运的是天生就有道缘，而且又遇到高人的指点，可以很顺利的寻得求道之路，而且可以一路顺遂，得到不错的成就。此签又可解为求医者可求得良药，但又有仙升，即作古升天之意，故求签者要小心处置。此签虽是大吉，但除了以上所提之事，对其余事情几乎都无任何影响，所以不可全部判断为大吉签。',
        '洞宾炼丹 唐吕岩。字洞宾。天宝十四年四月十四日巳时生。自号纯阳子。由进士授江州德化县令。私行庐遇钟离真人。授天仙剑法。另曰遇火龙真人。授天遁剑法。得九九数。学金丹之术。居深山中炼丹。丹成长生不老。多往来湘鄂间。滕守宗谅尝遇诸岳阳楼。自称华州道人。',
        '本来天生就是仙风道骨，又遇到神仙的好帮助，立即炼成仙丹妙药，离开了山谷，一旦成仙，遨游天外去。这首签诗，表示本来天生仙骨，又得神仙之助，乃得成仙升腾，也就是暗示，凡高贵的人占得此签，必事事遂意。若贫贱的人，占得此签，仅是平常而已。如问疾病，占得此签，表示当有名医来治，在一个月内可以治好，否则即有仙逝之兆。',
        ARRAY['洞宾', '炼丹', '仙风道骨', '大吉', '修道', '求医']
    ) ON CONFLICT (slip_id, language_code) DO NOTHING;
    
    -- 英文版本
    INSERT INTO fortune_slips_i18n (slip_id, language_code, title, content, basic_interpretation, historical_context, symbolism, keywords)
    VALUES (
        slip_7_id,
        'en-US',
        'Lu Dongbin Refining Elixir',
        'Born with immortal spirit and Taoist bones, Meeting celestial masters as alliance leaders, Soon the elixir will be complete, leaving the mountain valley, One day leading the ascension to heaven.',
        'You are more fortunate than others, being naturally endowed with spiritual destiny. Moreover, with guidance from enlightened masters, you can smoothly find the path of cultivation and proceed successfully to achieve good accomplishments. This divination can also be interpreted as finding good medicine for those seeking healing, but it also implies celestial ascension, meaning departure from this world, so fortune seekers should handle this carefully. Although this is a great fortune, except for the aforementioned matters, it has almost no influence on other affairs, so it cannot be entirely judged as a great fortune divination.',
        'Lu Dongbin Refining Elixir. Tang Dynastys Lu Yan, styled Dongbin, born on the 14th day of the 4th month in the 14th year of Tianbao, at the Si hour. Self-styled as Master Chunyang. Appointed as magistrate of Dehua County in Jiangzhou through imperial examination. Met Immortal Zhongli in private travels and learned celestial sword techniques. Also said to have met Fire Dragon Immortal and learned Heaven Escape sword techniques. Mastered the ninety-nine numbers and learned the art of golden elixir. Lived in deep mountains refining elixir. Upon completion, gained immortality. Often traveled between Hunan and Hubei.',
        'Originally born with immortal spirit and Taoist bones, and with the help of celestial beings, immediately refined the immortal elixir medicine, left the mountain valley, and once becoming immortal, soared through the heavens. This divination poem indicates natural immortal bones aided by celestial beings, thus achieving immortal ascension. This suggests that noble people who draw this divination will have everything go according to their wishes.',
        ARRAY['Lu Dongbin', 'Elixir', 'Immortal', 'Great Fortune', 'Cultivation', 'Medicine']
    ) ON CONFLICT (slip_id, language_code) DO NOTHING;
END $$;

-- 插入第8签数据
INSERT INTO fortune_slips (slip_number, temple_code, fortune_level, categories) 
VALUES (8, 'guandi', 'excellent', ARRAY['农作', '事业', '时运', '收获'])
ON CONFLICT (temple_code, slip_number) DO NOTHING;

-- 获取第8签的ID并插入多语言数据
DO $$
DECLARE
    slip_8_id UUID;
BEGIN
    SELECT id INTO slip_8_id FROM fortune_slips WHERE temple_code = 'guandi' AND slip_number = 8;
    
    -- 繁体中文版本
    INSERT INTO fortune_slips_i18n (slip_id, language_code, title, content, basic_interpretation, historical_context, symbolism, keywords)
    VALUES (
        slip_8_id,
        'zh-TW',
        '大舜耕歷山',
        '年來耕稼苦無收、今歲田疇定有秋、況遇太平無事日、士農工賈百無憂。',
        '過去的努力似乎都沒有收穫，只要再持續下去，今年必定會有結果，而且是不錯的回收。田裡的收成，完全要靠老天爺的幫忙，適逢風調雨順，得以豐收，各行各業也因此而有所斬獲。此籤表示即將有所收穫，不管之前有多麼不順遂，到此又是另一番景象，要好好把握，也表示以前的努力，現在才開始要回收，將會有美好的未來。',
        '大舜耕歷山 帝舜有虞氏，瞽瞍之子。父頑母嚴，弟象傲。舜事親盡孝，小杖則受，大杖則走，恐陷親不義也。其耕於歷山，有象為之耕，有鳥為之耘。後受帝堯禪位。',
        '多年來辛勤耕作，可是收穫不多，今年風調雨順，全看秋天的豐收了。而且又逢太平無事的日子，士農工商都是喜氣洋洋，無憂無慮，百事亨通。抽得此籤，先凶後吉之兆。所謂否極泰來，時來運轉是也。過去耕種的苦勞，目下將一齊收穫。',
        ARRAY['大舜', '耕作', '豐收', '上上', '農業', '時運']
    ) ON CONFLICT (slip_id, language_code) DO NOTHING;
    
    -- 简体中文版本
    INSERT INTO fortune_slips_i18n (slip_id, language_code, title, content, basic_interpretation, historical_context, symbolism, keywords)
    VALUES (
        slip_8_id,
        'zh-CN',
        '大舜耕历山',
        '年来耕稼苦无收、今岁田畴定有秋、况遇太平无事日、士农工贾百无忧。',
        '过去的努力似乎都没有收获，只要再持续下去，今年必定会有结果，而且是不错的回收。田里的收成，完全要靠老天爷的帮忙，适逢风调雨顺，得以丰收，各行各业也因此而有所斩获。此签表示即将有所收获，不管之前有多么不顺遂，到此又是另一番景象，要好好把握，也表示以前的努力，现在才开始要回收，将会有美好的未来。',
        '大舜耕历山 帝舜有虞氏，瞽瞍之子。父顽母严，弟象傲。舜事亲尽孝，小杖则受，大杖则走，恐陷亲不义也。其耕于历山，有象为之耕，有鸟为之耘。后受帝尧禅位。',
        '多年来辛勤耕作，可是收获不多，今年风调雨顺，全看秋天的丰收了。而且又逢太平无事的日子，士农工商都是喜气洋洋，无忧无虑，百事亨通。抽得此签，先凶后吉之兆。所谓否极泰来，时来运转是也。过去耕种的苦劳，目下将一齐收获。',
        ARRAY['大舜', '耕作', '丰收', '上上', '农业', '时运']
    ) ON CONFLICT (slip_id, language_code) DO NOTHING;
    
    -- 英文版本
    INSERT INTO fortune_slips_i18n (slip_id, language_code, title, content, basic_interpretation, historical_context, symbolism, keywords)
    VALUES (
        slip_8_id,
        'en-US',
        'Emperor Shun Farming at Mount Li',
        'Years of farming with bitter harvests, This year the fields will surely bear fruit in autumn, Moreover, meeting peaceful and eventful days, Scholars, farmers, craftsmen, and merchants all without worry.',
        'Past efforts seemed to yield no harvest, but if you continue persevering, this year will definitely bring results, and good returns. The harvest in the fields depends entirely on heavens help. Meeting favorable weather conditions brings abundant harvest, and all trades and professions benefit accordingly. This divination indicates upcoming harvest. No matter how unfavorable things were before, now presents a different scene that should be well grasped.',
        'Emperor Shun Farming at Mount Li. Emperor Shun of the You Yu clan, son of Gusou. His father was stubborn, mother harsh, and younger brother Xiang was arrogant. Shun served his parents with complete filial piety, accepting light punishment but avoiding severe punishment, fearing to trap his parents in unrighteousness. When farming at Mount Li, elephants plowed for him and birds weeded for him. Later he received the throne abdicated by Emperor Yao.',
        'Years of diligent farming with little harvest, but this year with favorable weather, all depends on autumns abundant harvest. Moreover, meeting peaceful and eventful times, scholars, farmers, craftsmen, and merchants are all joyful, carefree, and everything prospers. Drawing this divination indicates first misfortune then fortune.',
        ARRAY['Emperor Shun', 'Farming', 'Harvest', 'Supreme Fortune', 'Agriculture', 'Timing']
    ) ON CONFLICT (slip_id, language_code) DO NOTHING;
END $$;

-- 验证数据插入
SELECT 
    fs.slip_number,
    fs.temple_code,
    fs.fortune_level,
    COUNT(fsi.language_code) as language_count,
    ARRAY_AGG(fsi.language_code ORDER BY fsi.language_code) as languages
FROM fortune_slips fs
LEFT JOIN fortune_slips_i18n fsi ON fs.id = fsi.slip_id
WHERE fs.slip_number IN (7, 8) AND fs.temple_code = 'guandi'
GROUP BY fs.slip_number, fs.temple_code, fs.fortune_level
ORDER BY fs.slip_number;
EOF

# 执行数据插入
supabase db psql < /tmp/insert_sample_data.sql

if [ $? -eq 0 ]; then
    echo "✅ 示例数据插入成功"
    rm /tmp/insert_sample_data.sql
else
    echo "❌ 示例数据插入失败"
    rm /tmp/insert_sample_data.sql
    exit 1
fi

# 4. 验证部署
echo ""
echo "🔍 步骤 4: 验证多语言系统部署..."
echo "--------------------------------------"

# 检查表是否创建成功
echo "检查数据库表..."
supabase db psql -c "
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'fortune%' 
OR table_name LIKE 'language%'
ORDER BY table_name;
"

# 检查多语言数据
echo ""
echo "检查多语言数据..."
supabase db psql -c "
SELECT 
    'Total slips' as metric,
    COUNT(*) as value
FROM fortune_slips
UNION ALL
SELECT 
    'Total translations' as metric,
    COUNT(*) as value
FROM fortune_slips_i18n
UNION ALL
SELECT 
    'Languages supported' as metric,
    COUNT(DISTINCT language_code) as value
FROM fortune_slips_i18n;
"

# 5. 生成部署报告
echo ""
echo "📋 步骤 5: 生成部署报告..."
echo "--------------------------------------"

# 获取项目信息
PROJECT_REF=$(grep 'project_id' .supabase/config.toml | cut -d'"' -f2)
SUPABASE_URL="https://${PROJECT_REF}.supabase.co"

echo ""
echo "🎉 多语言系统部署完成!"
echo "=================================="
echo ""
echo "📊 系统信息:"
echo "  - Supabase项目: ${PROJECT_REF}"
echo "  - 项目URL: ${SUPABASE_URL}"
echo "  - 数据库: PostgreSQL (多语言支持)"
echo "  - API版本: v2.0"
echo ""
echo "🌐 支持的语言:"
echo "  - 🇨🇳 简体中文 (zh-CN)"
echo "  - 🇹🇼 繁体中文 (zh-TW)"
echo "  - 🇺🇸 英文 (en-US)"
echo ""
echo "📝 示例数据:"
echo "  - 第7签: 洞宾炼丹 (三种语言)"
echo "  - 第8签: 大舜耕历山 (三种语言)"
echo ""
echo "🚀 下一步:"
echo "  1. 启动开发服务器: npm run dev"
echo "  2. 访问演示页面: http://localhost:3000/multilingual-demo"
echo "  3. 测试API端点: ${SUPABASE_URL}/rest/v1/..."
echo "  4. 查看使用指南: cat MULTILINGUAL_SYSTEM_USAGE_GUIDE.md"
echo ""
echo "🔗 API端点测试:"
echo "  - GET /api/fortune/v2/slips/guandi/7?language=zh-CN"
echo "  - GET /api/fortune/v2/slips/guandi/8?language=zh-TW"
echo "  - GET /api/fortune/v2/random?temple=guandi&language=en-US"
echo "  - GET /api/fortune/test-multilingual"
echo ""
echo "✅ 部署成功完成!"