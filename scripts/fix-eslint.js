#!/usr/bin/env node
/**
 * ESLint 快速修复脚本
 * 自动修复常见的 ESLint 警告
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 开始修复 ESLint 问题...\n');

// 1. 自动修复可修复的问题
console.log('📝 自动修复可修复的问题...');
try {
  execSync('npm run lint -- --fix', { stdio: 'inherit' });
  console.log('✅ 自动修复完成\n');
} catch (error) {
  console.log('⚠️ 部分问题需要手动修复\n');
}

// 2. 生成未使用变量的清理建议
console.log('🧹 生成清理建议...');

const commonFixes = {
  '未使用的导入': [
    'import { useState } from "react" -> 删除或使用',
    'import { Button } from "@/components/ui/button" -> 删除或使用'
  ],
  '转义字符问题': [
    "使用 &apos; 替代 '",
    "使用 &quot; 替代 \"",
    "或者使用 {'} 和 {\"} 包装"
  ],
  'any 类型': [
    '尽量指定具体类型',
    '使用 unknown 替代 any',
    '添加类型注解'
  ]
};

console.log('\n📋 常见修复方案:');
Object.entries(commonFixes).forEach(([category, fixes]) => {
  console.log(`\n${category}:`);
  fixes.forEach(fix => console.log(`  • ${fix}`));
});

console.log('\n🎯 建议执行:');
console.log('1. npm run lint -- --fix  (自动修复)');
console.log('2. 手动处理未使用的导入');
console.log('3. 修复字符转义问题');
console.log('4. 逐步替换 any 类型\n');