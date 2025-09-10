// Stagehand 使用示例
// 需要先安装：pnpm add @browserbasehq/stagehand

const { Stagehand } = require('@browserbasehq/stagehand');
const { z } = require('zod');

async function demoStagehand() {
  console.log('🎭 开始 Stagehand 演示...\n');

  try {
    // 初始化 Stagehand
    const stagehand = new Stagehand({
      env: 'LOCAL', // 或 'BROWSERBASE' 如果使用 BrowserBase
      verbose: 1,
      debugDom: true,
      headless: false, // 设为 true 可以无头模式运行
    });

    // 启动浏览器
    await stagehand.init();
    console.log('✅ Stagehand 初始化成功');

    // 导航到页面
    console.log('🌐 导航到 AstroZi 首页...');
    await stagehand.page.goto('http://localhost:3003');

    // 等待页面加载
    await stagehand.page.waitForLoadState('networkidle');
    console.log('✅ 页面加载完成');

    // 使用 Stagehand 的 AI 功能点击元素
    console.log('🤖 使用 AI 寻找并点击登录按钮...');
    
    // Stagehand 可以通过自然语言描述来操作页面
    await stagehand.page.act({
      action: 'click on the login or sign in button'
    });

    // 等待一会儿
    await stagehand.page.waitForTimeout(2000);

    // 提取页面信息
    console.log('📄 提取页面标题...');
    const title = await stagehand.page.extract({
      instruction: 'Get the page title',
      schema: z.object({
        title: z.string()
      })
    });

    console.log('页面标题:', title);

    // 截图
    console.log('📸 保存截图...');
    await stagehand.page.screenshot({ 
      path: 'stagehand-demo-screenshot.png' 
    });

    console.log('✅ 演示完成！');

  } catch (error) {
    console.error('❌ 演示过程中出现错误:', error.message);
  } finally {
    // 清理资源
    if (stagehand) {
      await stagehand.close();
      console.log('🧹 Stagehand 已关闭');
    }
  }
}

// 如果直接运行此文件
if (require.main === module) {
  console.log('⚠️  注意：请确保你的开发服务器正在运行 (npm run dev)');
  console.log('📍 你可以修改 URL 来测试不同的页面\n');
  
  // 运行演示
  demoStagehand().catch(console.error);
}

module.exports = { demoStagehand };