# 🚀 Supabase Edge Function 部署指南

## 📋 概述

本指南将帮助您将 Web3 认证功能从 Next.js API 路由迁移到 Supabase Edge Functions。

## 🎯 迁移优势

- ✅ **无缝集成**: 直接访问 Supabase Auth 和数据库
- ✅ **全球边缘**: 低延迟，高性能
- ✅ **无服务器**: 无需维护服务器基础设施
- ✅ **原生JWT**: 生成真正的 Supabase JWT token
- ✅ **成本效益**: 免费层支持 500,000 次调用/月

## 🔧 部署步骤

### 1. 安装 Supabase CLI

```bash
npm install -g supabase
```

### 2. 登录 Supabase

```bash
supabase login
```

### 3. 初始化项目（如果尚未初始化）

```bash
supabase init
```

### 4. 部署 Edge Function

使用提供的脚本：

```bash
./deploy-edge-function.sh
```

或手动部署：

```bash
supabase functions deploy web3-auth
```

### 5. 设置环境变量

在 Supabase Dashboard 中：

1. 转到 **Functions** > **web3-auth** > **Settings**
2. 添加以下环境变量：

| 变量名 | 值 | 描述 |
|--------|-----|------|
| `SUPABASE_URL` | `https://your-project.supabase.co` | 你的 Supabase 项目 URL |
| `SUPABASE_SERVICE_ROLE_KEY` | `your-service-role-key` | 服务角色密钥（管理员权限）|
| `SITE_URL` | `http://localhost:3001` | 你的网站 URL |

⚠️ **重要**: 使用 Service Role Key，不是 Anon Key！

## 📁 文件结构

迁移后的文件结构：

```
├── supabase/
│   ├── functions/
│   │   └── web3-auth/
│   │       └── index.ts          # Edge Function 代码
│   ├── config.toml                # Supabase 配置
│   └── migrations/                # 数据库迁移
├── components/
│   └── WalletConnectAuth.tsx      # 更新的前端调用
├── deploy-edge-function.sh        # 部署脚本
└── EDGE_FUNCTION_DEPLOYMENT.md    # 本文档
```

## 🔄 API 变更

### 旧的调用方式（Next.js API）
```typescript
const authResponse = await apiClient.post('/api/auth/web3/authenticate', {
  walletAddress: address,
  signature,
  message: siweMessage
})
```

### 新的调用方式（Edge Function）
```typescript
const edgeFunctionUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/web3-auth`
const response = await fetch(edgeFunctionUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
  },
  body: JSON.stringify({
    walletAddress: address,
    signature,
    message: siweMessage
  })
})
```

## 🧪 测试

### 本地测试

1. 启动本地 Supabase 环境：
```bash
supabase start
```

2. 本地部署函数：
```bash
supabase functions serve web3-auth
```

3. Edge Function 将在以下地址可用：
```
http://localhost:54321/functions/v1/web3-auth
```

### 生产测试

部署后，Edge Function 地址为：
```
https://your-project-id.supabase.co/functions/v1/web3-auth
```

## 🐛 故障排除

### 常见问题

#### 1. "User with this email not found" 错误
- **原因**: 用户未正确创建或邮箱未确认
- **解决**: Edge Function 会自动处理用户创建和邮箱确认

#### 2. "Invalid JWT structure" 错误
- **原因**: 使用了自定义 token 而非真正的 JWT
- **解决**: Edge Function 使用 `generateLink` 生成真正的 JWT

#### 3. CORS 错误
- **原因**: 跨域配置问题
- **解决**: Edge Function 已包含正确的 CORS 头

#### 4. 环境变量未设置
- **原因**: 在 Supabase Dashboard 中未配置环境变量
- **解决**: 确保设置了所有必需的环境变量

### 调试日志

在 Supabase Dashboard 中查看函数日志：
1. 转到 **Functions** > **web3-auth** > **Logs**
2. 查看实时日志和错误信息

## 🔒 安全考虑

- ✅ Edge Function 使用 Service Role Key，拥有管理员权限
- ✅ 签名验证确保钱包地址真实性
- ✅ JWT token 由 Supabase 原生生成，安全可靠
- ✅ CORS 配置允许来自你的域名的请求

## 📊 性能优化

- **冷启动**: Edge Functions 可能有冷启动延迟
- **缓存**: Supabase 会自动缓存函数代码
- **监控**: 在 Dashboard 中监控函数性能和使用情况

## 🔄 回滚计划

如果需要回滚到 Next.js API 路由：

1. 恢复 `WalletConnectAuth.tsx` 中的旧调用代码
2. 确保 Next.js API 路由 `/api/auth/web3/authenticate` 仍然存在
3. 前端会自动使用旧的认证流程

## ✅ 验证清单

部署完成后，请验证：

- [ ] Edge Function 部署成功
- [ ] 环境变量已设置
- [ ] Web3 认证流程工作正常
- [ ] JWT token 生成成功
- [ ] Supabase session 设置成功
- [ ] RLS 权限正常工作

## 🆘 获取帮助

如果遇到问题：

1. 检查 Supabase Dashboard 中的函数日志
2. 验证环境变量配置
3. 确认数据库表和 RLS 策略正确
4. 查看浏览器开发者工具中的网络请求

---

🎉 **恭喜！您已成功迁移到 Supabase Edge Functions！**