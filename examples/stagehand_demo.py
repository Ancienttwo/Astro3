#!/usr/bin/env python3
"""
Python Stagehand 示例 - 关帝签功能测试
使用方法：
1. 确保开发服务器运行：npm run dev
2. 激活虚拟环境：source .venv/bin/activate
3. 运行脚本：python examples/stagehand_demo.py
"""

import asyncio
import os
from dotenv import load_dotenv
from stagehand import Stagehand, StagehandConfig

# 加载环境变量
load_dotenv()

async def test_guandi_features():
    """测试关帝签的主要功能"""
    print("🎭 开始 Python Stagehand 关帝签测试...\n")
    
    # 初始化 Stagehand
    config = StagehandConfig(
        env="LOCAL",  # 使用本地环境
        verbose=1,    # 启用详细日志
        headless=False,  # 显示浏览器窗口
    )
    
    stagehand = Stagehand(config=config)
    
    try:
        # 启动 Stagehand
        await stagehand.init()
        print("✅ Stagehand 初始化成功")
        
        # 1. 导航到关帝签页面
        print("🏛️ 导航到关帝签页面...")
        page = stagehand.page
        await page.goto("http://localhost:3003/guandi")
        await page.wait_for_load_state("networkidle")
        print("✅ 关帝签页面加载完成")
        
        # 2. 测试页面基础功能
        print("📄 检查页面标题...")
        title = await page.title()
        print(f"📋 页面标题: {title}")
        
        # 3. 简单截图测试
        print("📸 保存页面截图...")
        await page.screenshot(path="guandi_python_test.png", full_page=True)
        print("✅ 截图保存成功")
        
        print("✅ Python Stagehand 关帝签测试完成！")
        
    except Exception as error:
        print(f"❌ 测试过程中出现错误: {error}")
        
        # 保存错误截图
        try:
            page = stagehand.page
            await page.screenshot(path="guandi_python_error.png", full_page=True)
            print("📸 错误截图已保存")
        except Exception as screenshot_error:
            print(f"截图失败: {screenshot_error}")
    
    finally:
        # 清理资源
        await stagehand.close()
        print("🧹 Stagehand 已关闭")

async def test_web3_features():
    """测试 Web3 相关功能（如果用户已连接钱包）"""
    print("🔗 测试 Web3 功能...")
    
    config = StagehandConfig(
        env="LOCAL",
        verbose=1,
        headless=False,
    )
    
    stagehand = Stagehand(config=config)
    
    try:
        await stagehand.init()
        page = stagehand.page
        
        # 导航到 Web3 页面
        await page.goto("http://localhost:3003/web3")
        await page.wait_for_load_state("networkidle")
        
        # 简单的页面测试
        title = await page.title()
        print(f"💳 Web3页面标题: {title}")
        
        # 保存Web3页面截图
        await page.screenshot(path="web3_python_test.png", full_page=True)
        print("📸 Web3页面截图保存成功")
        
    except Exception as error:
        print(f"❌ Web3 测试失败: {error}")
    
    finally:
        await stagehand.close()

def main():
    """主函数"""
    print("🐍 Python Stagehand 测试套件")
    print("⚠️  请确保开发服务器正在运行: npm run dev\n")
    
    # 默认运行关帝签测试
    print("🎯 自动运行关帝签功能测试...")
    asyncio.run(test_guandi_features())

if __name__ == "__main__":
    main()