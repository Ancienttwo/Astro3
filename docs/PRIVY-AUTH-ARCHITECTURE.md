# Privy + Supabase 认证架构

## 概述

本项目使用双层认证架构：
- **Privy**: Web3 钱包认证 + 社交登录
- **Supabase**: 用户数据持久化 + JWT session 管理

## 认证流程

### 1. 用户登录 (Privy)

```
用户点击登录
    ↓
Privy Modal 打开 (钱包/社交登录)
    ↓
用户完成认证
    ↓
获得 Privy Token (短期有效)
    ↓
Privy User Object (包含 DID, wallet, email 等)
```

### 2. 同步到 Supabase

```typescript
// 客户端: PrivyContext.tsx
const privyToken = await getAccessToken()  // 获取 Privy Token

// 发送到后端
POST /api/auth/privy
{
  privyToken: "eyJhbG...",  // Privy 颁发的 JWT
  userId: "did:privy:xxx",
  walletAddress: "0x123...",
  linkedAccounts: [...]
}
```

### 3. 后端验证 & 创建 Supabase 用户

```typescript
// 服务端: app/api/auth/privy/route.ts

// 1️⃣ 验证 Privy Token
const privy = new PrivyClient(appId, appSecret)
const verification = await privy.verifyAuthToken(privyToken)
const privyUser = verification.user

// 2️⃣ 创建稳定的 email (用于 Supabase Auth)
const effectiveEmail = email || `${privyId.replace(':', '_')}@privy.astrozi.app`

// 3️⃣ 在 Supabase Auth 创建用户 (生成 UUID)
const { data: created } = await supabaseAdmin.auth.admin.createUser({
  email: effectiveEmail,
  email_confirm: true,
  user_metadata: {
    auth_type: 'web3',
    auth_provider: 'privy',
    privy_id: privyId,           // ← 存储 Privy DID
    wallet_address: walletAddress,
  },
})

const supabaseUserId = created.user.id  // ← Supabase UUID

// 4️⃣ 在 users 表存储映射
await supabaseAdmin.from('users').insert({
  email: effectiveEmail,
  wallet_address: walletAddress,
  privy_did: privyId,            // ← Privy DID → Supabase 映射
})

// 5️⃣ 生成 Supabase JWT (magic link)
const { data: linkData } = await supabaseAdmin.auth.admin.generateLink({
  type: 'magiclink',
  email: effectiveEmail,
})

const accessToken = linkData.action_link.searchParams.get('access_token')
const refreshToken = linkData.action_link.searchParams.get('refresh_token')

// 6️⃣ 返回 Supabase Session
return {
  session: {
    access_token: accessToken,   // ← Supabase JWT
    refresh_token: refreshToken,
    user: {
      id: supabaseUserId,        // ← Supabase UUID
      email: effectiveEmail,
    }
  }
}
```

### 4. 客户端持久化

```typescript
// 客户端: PrivyContext.tsx

// 接收 Supabase Session
const data = await response.json()

// 存储到 localStorage
localStorage.setItem('supabase_jwt', data.session.access_token)
localStorage.setItem('current_user', JSON.stringify({
  id: data.session.user.id,      // Supabase UUID
  email: data.session.user.email,
  wallet_address: walletAddress,
  auth_method: 'privy',
}))

// 设置 Supabase 客户端 session
await supabase.auth.setSession({
  access_token: data.session.access_token,
  refresh_token: data.session.refresh_token,
})
```

## Token 类型对比

### Privy Token
- **颁发者**: Privy 服务
- **用途**: 一次性验证用户身份
- **生命周期**: 短期（几分钟）
- **存储**: 不存储，仅用于同步
- **格式**: JWT (Privy 专有 claims)

### Supabase JWT
- **颁发者**: Supabase Auth (通过我们的后端)
- **用途**: 后续所有 API 请求认证
- **生命周期**: 长期（1小时，可刷新）
- **存储**: localStorage + Supabase 客户端
- **格式**: JWT (Supabase 标准 claims)

## 数据模型

### Supabase Auth Users
```sql
auth.users (
  id UUID PRIMARY KEY,              -- Supabase 生成的 UUID
  email TEXT,                       -- 真实 email 或生成的 email
  email_confirmed_at TIMESTAMP,
  user_metadata JSONB {
    auth_type: 'web3',
    auth_provider: 'privy',
    privy_id: 'did:privy:xxx',     -- Privy DID
    wallet_address: '0x123...',
  }
)
```

### Application Users Table
```sql
public.users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE,
  wallet_address TEXT,
  privy_did TEXT UNIQUE,            -- Privy DID
  auth_type TEXT,                   -- 'web3'
  auth_provider TEXT,               -- 'privy'
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

## 关键映射关系

```
Privy DID (did:privy:xxx)
    ↓
Email (did_privy_xxx@privy.astrozi.app)
    ↓
Supabase Auth User (UUID: 550e8400-...)
    ↓
Application User (id: 123, privy_did: did:privy:xxx)
```

## RLS 策略

```sql
-- 用户只能访问自己的数据
CREATE POLICY "Users can view own data"
ON public.users
FOR SELECT
USING (
  auth.uid() = (
    SELECT id FROM auth.users
    WHERE user_metadata->>'privy_id' = users.privy_did
  )
);
```

## 后续 API 调用

```typescript
// 所有后续请求使用 Supabase JWT
const { data } = await supabase
  .from('charts')
  .select('*')
  .eq('user_id', session.user.id)  // ← 使用 Supabase UUID

// 自动携带 Authorization header
// Authorization: Bearer <supabase_jwt>
```

## 调试步骤

### 1. 测试 Privy 配置
```bash
curl http://localhost:3002/api/auth/privy-test
```

### 2. 查看客户端日志
浏览器控制台会显示：
```
🔑 Attempt 1: Got token: { hasToken: true, tokenLength: 1234 }
📤 Sending sync request to /api/auth/privy
```

### 3. 查看服务器日志
终端会显示：
```
🔐 Privy auth request: { hasToken: true, tokenLength: 1234 }
✅ Privy client created
🔍 Attempting to verify token...
✅ Token verified successfully: { userId: 'did:privy:xxx' }
```

### 4. 常见错误

#### 401 - Invalid Privy token
- **原因**: Privy App Secret 不匹配或 token 已过期
- **解决**: 检查 `.env.local` 中的 `PRIVY_APP_SECRET`

#### 500 - Failed to create Supabase user
- **原因**: Supabase Admin API 权限不足
- **解决**: 检查 `SUPABASE_SERVICE_ROLE_KEY`

## 安全考虑

1. ✅ Privy Token 仅用于一次性验证，不存储
2. ✅ Supabase JWT 自动过期和刷新
3. ✅ RLS 策略保护用户数据
4. ✅ Service Role Key 仅在服务器端使用
5. ✅ 钱包地址归一化 (lowercase)

## 总结

- **Privy**: 负责 Web3 认证 (一次性)
- **Supabase**: 负责持久化和 session 管理 (长期)
- **映射**: Privy DID ↔ Supabase UUID
- **Token**: Privy Token (临时) → Supabase JWT (持久)
