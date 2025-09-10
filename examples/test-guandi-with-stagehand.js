// 使用 Stagehand 自动测试关帝签功能
const { Stagehand } = require('@browserbasehq/stagehand');
const { z } = require('zod');

async function testGuandiFeatures() {
  console.log('🎭 开始自动测试关帝签功能...\n');

  // 检查是否有有效的 OpenAI API key
  const hasValidApiKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'placeholder_for_stagehand_testing';
  
  if (!hasValidApiKey) {
    console.log('⚠️  未检测到有效的 OpenAI API key，将进行基础测试（不使用 AI 功能）');
  }

  const stagehand = new Stagehand({
    env: 'LOCAL',
    verbose: 1,
    debugDom: true,
    headless: false, // 可视化测试
  });

  try {
    await stagehand.init();
    console.log('✅ Stagehand 初始化成功');

    // 1. 导航到关帝签页面
    console.log('🏛️ 导航到关帝签页面...');
    await stagehand.page.goto('http://localhost:3003/guandi');
    await stagehand.page.waitForLoadState('networkidle');
    console.log('✅ 关帝签页面加载完成');

    // 2. 测试页面基础功能
    console.log('📄 检查页面标题...');
    const title = await stagehand.page.title();
    console.log(`📋 页面标题: ${title}`);
    
    // 截图测试
    console.log('📸 保存关帝签页面截图...');
    await stagehand.page.screenshot({ 
      path: 'guandi-page-test.png',
      fullPage: true
    });
    console.log('✅ 页面截图已保存');

    if (hasValidApiKey) {
      // 2. 测试随机摇签功能（需要 AI）
      console.log('🎲 测试随机摇签功能...');
      
      // 使用 AI 点击摇签筒
      await stagehand.page.act({
        action: 'click on the fortune drawing container or tube image to draw a random fortune slip'
      });

      // 等待摇签动画和结果
      console.log('⏳ 等待摇签结果...');
      await stagehand.page.waitForTimeout(3000);
    } else {
      console.log('⏭️  跳过 AI 功能测试（需要有效的 OpenAI API key）');
    }

    if (hasValidApiKey) {
      // 3. 测试筊杯确认功能（需要 AI）
      console.log('🎯 查找筊杯确认界面...');
      
      // 检查是否出现筊杯界面
      const hasJiaobei = await stagehand.page.extract({
        instruction: 'Check if there is a Jiaobei (divination blocks) confirmation interface visible',
        schema: z.object({
          visible: z.boolean(),
          description: z.string()
        })
      });

      console.log('筊杯界面状态:', hasJiaobei);

      if (hasJiaobei.visible) {
        console.log('🎲 点击筊杯进行确认...');
        await stagehand.page.act({
          action: 'click on the Jiaobei (divination blocks) image or throw button to confirm the fortune slip'
        });

        // 等待筊杯结果
        await stagehand.page.waitForTimeout(3000);

        // 提取筊杯结果
        const jiaobeiResult = await stagehand.page.extract({
          instruction: 'Extract the Jiaobei result - it should show something like 正正, 正反, or 反反',
          schema: z.object({
            result: z.string(),
            meaning: z.string()
          })
        });

        console.log('🎯 筊杯结果:', jiaobeiResult);
      }
    }

    if (hasValidApiKey) {
      // 4. 测试手动查签功能（需要 AI）
      console.log('🔍 测试手动查签功能...');
      
      // 切换到手动查签标签
      await stagehand.page.act({
        action: 'click on the manual query or search tab'
      });

      await stagehand.page.waitForTimeout(1000);

      // 输入签号
      await stagehand.page.act({
        action: 'type "88" in the slip number input field'
      });

      // 点击查询按钮
      await stagehand.page.act({
        action: 'click the query or search button to look up the fortune slip'
      });

      await stagehand.page.waitForTimeout(2000);

      // 5. 提取签文内容
      console.log('📜 提取签文详细内容...');
      
      const fortuneContent = await stagehand.page.extract({
        instruction: 'Extract the fortune slip content including slip number, title, poem, and interpretation',
        schema: z.object({
          slipNumber: z.string(),
          title: z.string(),
          content: z.string(),
          interpretation: z.string()
        })
      });

      console.log('📋 签文内容:', JSON.stringify(fortuneContent, null, 2));
    }

    if (hasValidApiKey) {
      // 6. 测试语言切换功能（需要 AI）
      console.log('🌐 测试语言切换功能...');
      
      await stagehand.page.act({
        action: 'click on the language selector and switch to English'
      });

      await stagehand.page.waitForTimeout(2000);

      // 验证语言是否切换成功
      const languageCheck = await stagehand.page.extract({
        instruction: 'Check if the page language has switched to English',
        schema: z.object({
          isEnglish: z.boolean(),
          sampleText: z.string()
        })
      });

      console.log('🌐 语言切换结果:', languageCheck);

      // 7. 测试AI解读功能（如果有）
      console.log('🤖 查找AI解读功能...');
      
      const hasAIInterpret = await stagehand.page.extract({
        instruction: 'Check if there is an AI interpretation button or feature available',
        schema: z.object({
          available: z.boolean(),
          buttonText: z.string()
        })
      });

      if (hasAIInterpret.available) {
        console.log('🧠 测试AI解读功能...');
        await stagehand.page.act({
          action: 'click on the AI interpretation button'
        });
        await stagehand.page.waitForTimeout(3000);
      }
    }

    // 8. 截图保存
    console.log('📸 保存测试截图...');
    await stagehand.page.screenshot({ 
      path: 'guandi-test-result.png',
      fullPage: true
    });

    console.log('✅ 关帝签功能测试完成！');

  } catch (error) {
    console.error('❌ 测试过程中出现错误:', error.message);
    
    // 错误截图
    try {
      await stagehand.page.screenshot({ 
        path: 'guandi-test-error.png',
        fullPage: true
      });
      console.log('📸 错误截图已保存');
    } catch (screenshotError) {
      console.error('截图失败:', screenshotError.message);
    }
  } finally {
    await stagehand.close();
    console.log('🧹 测试完成，Stagehand 已关闭');
  }
}

// 运行测试
if (require.main === module) {
  console.log('🎯 关帝签自动化测试');
  console.log('⚠️  请确保你的开发服务器正在运行 (npm run dev)\n');
  
  testGuandiFeatures().catch(console.error);
}

module.exports = { testGuandiFeatures };