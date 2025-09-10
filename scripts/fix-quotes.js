#!/usr/bin/env node
/**
 * 快速修复 React 中的字符转义问题
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// 查找所有 React 组件文件
const files = glob.sync('**/*.{tsx,jsx}', {
  ignore: ['node_modules/**', '.next/**', 'dist/**']
});

console.log(`🔍 找到 ${files.length} 个 React 文件`);

let totalFixed = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let fixed = 0;
  
  // 修复常见的字符转义问题
  const fixes = [
    // 单引号
    { regex: /(\w)'(\w)/g, replacement: "$1&apos;$2" },
    { regex: /(\s)'(\w)/g, replacement: "$1&apos;$2" },
    { regex: /(\w)'(\s)/g, replacement: "$1&apos;$2" },
    
    // 双引号
    { regex: /(\w)"(\w)/g, replacement: "$1&quot;$2" },
    { regex: /(\s)"(\w)/g, replacement: "$1&quot;$2" },
    { regex: /(\w)"(\s)/g, replacement: "$1&quot;$2" },
  ];
  
  const originalContent = content;
  
  fixes.forEach(fix => {
    const matches = content.match(fix.regex);
    if (matches) {
      content = content.replace(fix.regex, fix.replacement);
      fixed += matches.length;
    }
  });
  
  if (fixed > 0) {
    fs.writeFileSync(file, content);
    console.log(`✅ ${file}: 修复了 ${fixed} 个字符转义问题`);
    totalFixed += fixed;
  }
});

console.log(`\n🎉 总共修复了 ${totalFixed} 个字符转义问题`);

if (totalFixed > 0) {
  console.log('\n⚠️  建议检查修复结果，确保没有误修复的内容');
}