#!/usr/bin/env python3
"""
验证 Python Stagehand 安装
"""

import asyncio
from stagehand import Stagehand, StagehandConfig

async def test_installation():
    """测试 Stagehand 安装是否成功"""
    print("🔍 验证 Python Stagehand 安装...")
    
    try:
        # 创建配置
        config = StagehandConfig(
            env="LOCAL",
            verbose=1,
            headless=True,  # 无头模式快速测试
        )
        
        # 初始化 Stagehand
        stagehand = Stagehand(config=config)
        await stagehand.init()
        print("✅ Stagehand 初始化成功")
        
        # 获取页面对象
        page = stagehand.page
        
        # 简单的页面测试
        await page.goto("https://example.com")
        await page.wait_for_load_state("networkidle")
        print("✅ 页面导航成功")
        
        # 简单功能测试
        title = await page.title()
        print(f"✅ 页面标题获取成功: {title}")
        
        print("✅ 页面操作功能正常")
        
        await stagehand.close()
        print("✅ Stagehand 关闭成功")
        
        print("\n🎉 Python Stagehand 安装验证完成！")
        print("📝 现在你可以运行: python examples/stagehand_demo.py")
        
    except Exception as error:
        print(f"❌ 安装验证失败: {error}")
        print("💡 请检查:")
        print("   1. 虚拟环境是否激活: source .venv/bin/activate")
        print("   2. 依赖是否安装: uv pip install stagehand python-dotenv")
        print("   3. Playwright 浏览器是否安装: python -m playwright install chromium")

def main():
    print("🐍 Python Stagehand 安装验证")
    asyncio.run(test_installation())

if __name__ == "__main__":
    main()