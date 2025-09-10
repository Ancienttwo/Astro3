# 互助系统认证API文档

## 概述

互助系统认证API基于现有的成熟WalletConnect + Supabase认证基础设施，通过适配器模式无缝集成到互助系统。本API提供完整的Web3身份认证、权限管理和用户配置文件同步功能。

## 架构设计

### 认证流程
```
客户端 → WalletConnect/邮箱认证 → Supabase Auth → 互助系统适配器 → 权限验证 → API访问
```

### 核心组件
- **认证适配器** (`lib/mutual-aid-auth-adapter.ts`): 桥接现有认证到互助系统
- **中间件系统** (`lib/mutual-aid-middleware.ts`): API保护和权限检查
- **用户配置文件同步**: 自动创建和同步互助系统配置文件

## API端点

### 1. 用户配置文件管理

#### GET /api/mutual-aid/auth/profile
获取当前用户的互助系统配置文件

**认证要求**: 需要有效的认证令牌
**权限**: 无特殊要求

**请求头**:
```http
Authorization: Bearer <your_auth_token>
Content-Type: application/json
```

**响应示例**:
```json
{
  "success": true,
  "data": {
    "profile": {
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "wallet_address": "0x742d35Cc6634C0532925a3b8D58F22c11D5E8B7d",
      "email": "user@example.com",
      "display_name": "Web3User634C05",
      "reputation_score": 2.5,
      "role": "user",
      "is_active_validator": true,
      "verification_status": "email_verified",
      "total_validations": 15,
      "total_contributions": 120.5
    },
    "permissions": {
      "can_submit_requests": true,
      "can_validate": true,
      "can_moderate": false,
      "can_admin": false,
      "request_limit": 3
    },
    "limits": {
      "dailyRequestLimit": 2,
      "monthlyRequestLimit": 5,
      "maxRequestAmount": 200,
      "dailyValidationLimit": 20
    },
    "today_usage": {
      "requestsToday": 0,
      "validationsToday": 3
    }
  }
}
```

**错误响应**:
```json
{
  "success": false,
  "error": "需要认证才能访问互助系统",
  "code": "UNAUTHORIZED"
}
```

### 2. 互助请求管理

#### GET /api/mutual-aid/requests
获取互助请求列表

**认证要求**: 需要有效的认证令牌  
**权限**: 基础用户权限

**查询参数**:
- `page` (number, 可选): 页码，默认为1
- `limit` (number, 可选): 每页条数，默认10，最大50  
- `status` (string, 可选): 状态过滤 (`pending`, `under_review`, `approved`, `rejected`, `completed`, `expired`)
- `category` (string, 可选): 类别过滤 (`financial`, `medical`, `education`, `family`, `disaster`, `other`)
- `urgency` (string, 可选): 紧急程度 (`low`, `medium`, `high`, `critical`)
- `sortBy` (string, 可选): 排序字段 (`created_at`, `amount`, `urgency`, `validation_count`)，默认`created_at`
- `sortOrder` (string, 可选): 排序方向 (`asc`, `desc`)，默认`desc`

**请求示例**:
```http
GET /api/mutual-aid/requests?page=1&limit=20&status=pending&category=medical&urgency=high
Authorization: Bearer <your_auth_token>
```

**响应示例**:
```json
{
  "success": true,
  "data": [
    {
      "id": "req_123e4567-e89b-12d3",
      "requester_id": "user_456",
      "amount": "500.00",
      "reason": "紧急医疗费用，需要进行手术治疗，家庭经济困难无法承担全部费用。已联系医院确认治疗方案和费用明细。",
      "category": "medical",
      "severity_level": 8,
      "urgency": "high",
      "public_message": "感谢社区的帮助，我会在康复后积极参与社区互助活动。",
      "status": "pending",
      "validation_summary": {
        "total_validations": 3,
        "approval_count": 2,
        "rejection_count": 1,
        "approval_rate": "66.7%"
      },
      "requester": {
        "display_name": "匿名用户456",
        "reputation_score": 1.5,
        "verification_status": "email_verified"
      },
      "ai_analysis": {
        "severity_level": 8,
        "confidence_score": 0.85,
        "category": "medical",
        "recommendations": ["需要提供医院诊断证明", "建议联系当地慈善机构"]
      },
      "timestamps": {
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T14:20:00Z",
        "expires_at": "2024-02-14T10:30:00Z",
        "validation_completed_at": null
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  },
  "filters": {
    "status": "pending",
    "category": "medical",
    "urgency": "high",
    "sortBy": "created_at",
    "sortOrder": "desc"
  }
}
```

#### POST /api/mutual-aid/requests
提交新的互助请求

**认证要求**: 需要有效的认证令牌
**权限**: 提交请求权限 (`submit_requests`)
**限制检查**: 每日请求限制、金额限制

**请求体**:
```json
{
  "analysisId": "analysis_123e4567-e89b-12d3-a456-426614174000", // 可选，AI分析ID
  "amount": "500.00",
  "reason": "紧急医疗费用，需要进行手术治疗，家庭经济困难无法承担全部费用。医院已确认治疗方案，预计总费用为800美元，其中保险覆盖300美元，需要社区帮助剩余500美元。",
  "severityLevel": 8,
  "urgency": "high",
  "category": "medical",
  "supportingDocuments": [
    "https://storage.example.com/documents/medical-report-123.pdf",
    "https://storage.example.com/documents/hospital-bill-123.pdf"
  ],
  "publicMessage": "感谢社区的关爱和支持，我承诺康复后积极回馈社区。"
}
```

**字段验证规则**:
- `amount`: 必须是有效的数字格式，最多18位小数
- `reason`: 必须50-1000字符
- `severityLevel`: 整数，1-10范围
- `urgency`: 枚举值 `['low', 'medium', 'high', 'critical']`
- `category`: 枚举值 `['financial', 'medical', 'education', 'family', 'disaster', 'other']`
- `supportingDocuments`: 可选，URL数组
- `publicMessage`: 可选，最多300字符

**成功响应**:
```json
{
  "success": true,
  "data": {
    "request": {
      "id": "req_123e4567-e89b-12d3",
      "requester_id": "user_456",
      "amount": "500.00",
      "reason": "紧急医疗费用...",
      "category": "medical",
      "severity_level": 8,
      "urgency": "high",
      "status": "pending",
      "timestamps": {
        "created_at": "2024-01-15T10:30:00Z",
        "expires_at": "2024-02-14T10:30:00Z"
      }
    },
    "message": "互助请求已成功提交，等待社区验证"
  }
}
```

**错误响应示例**:
```json
{
  "success": false,
  "error": "请求金额超过限制，当前最大限额：100",
  "code": "AMOUNT_LIMIT_EXCEEDED",
  "max_amount": 100
}
```

## 认证机制

### 认证令牌来源

系统支持多种认证令牌来源，优先级如下：

1. **互助系统专用令牌** (`localStorage: mutual_aid_auth`)
2. **WalletConnect令牌** (`localStorage: walletconnect_auth`)  
3. **Web3认证令牌** (`localStorage: web3_auth`)
4. **自定义邮箱会话** (`localStorage: custom_email_session`)
5. **Supabase会话令牌** (`localStorage: sb-*-auth-token`)

### 令牌格式

#### 标准格式
```json
{
  "auth_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "wallet_address": "0x742d35Cc6634C0532925a3b8D58F22c11D5E8B7d",
  "expires_at": "2024-01-16T10:30:00Z"
}
```

#### Supabase会话格式
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_at": 1705483800,
  "user": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com"
  }
}
```

### 权限系统

#### 角色层级
1. **user** (普通用户): 基础权限
2. **validator** (验证者): 可验证请求
3. **moderator** (版主): 可管理内容  
4. **admin** (管理员): 全部权限

#### 权限检查
- `submit_requests`: 提交互助请求
- `validate_requests`: 验证他人请求
- `moderate_content`: 管理社区内容
- `admin_access`: 系统管理权限

#### 限制规则
- **声誉积分影响**: 声誉越高，限制越宽松
- **每日限制**: 申请和验证次数限制
- **金额限制**: 根据用户级别设定最大申请金额
- **管理员豁免**: 管理员和版主不受大部分限制

## 中间件和装饰器

### 可用中间件

#### 1. `withMutualAidAuthOnly`
仅检查认证，不验证权限
```typescript
export const GET = withMutualAidAuthOnly(handleGetProfile)
```

#### 2. `withRequestorAuth`  
申请者权限中间件，包含每日限制检查
```typescript
export const POST = withRequestorAuth(handleSubmitRequest, {
  minimumReputation: 0,
  requireVerification: false
})
```

#### 3. `withValidatorAuth`
验证者权限中间件
```typescript
export const POST = withValidatorAuth(handleValidateRequest, {
  minimumValidations: 5
})
```

#### 4. `withAdminAuth`
管理员权限中间件
```typescript
export const DELETE = withAdminAuth(handleDeleteRequest)
```

#### 5. `withModeratorAuth`
版主权限中间件
```typescript
export const PUT = withModeratorAuth(handleModerateContent)
```

### 自定义中间件选项

```typescript
interface MutualAidMiddlewareOptions {
  requiredPermission?: 'submit_requests' | 'validate_requests' | 'moderate_content' | 'admin_access'
  minimumReputation?: number
  minimumValidations?: number  
  requireVerification?: boolean
  checkDailyLimits?: 'requests' | 'validations' | 'both'
  bypassLimitsForRoles?: ('admin' | 'moderator')[]
}
```

## 错误代码和处理

### HTTP状态码
- `200`: 成功
- `201`: 创建成功  
- `400`: 请求参数错误
- `401`: 未认证
- `403`: 权限不足
- `404`: 资源未找到
- `429`: 超出限制
- `500`: 服务器内部错误

### 错误代码
- `UNAUTHORIZED`: 未认证
- `FORBIDDEN`: 权限不足  
- `VALIDATION_ERROR`: 数据验证错误
- `AMOUNT_LIMIT_EXCEEDED`: 金额超出限制
- `DAILY_LIMIT_EXCEEDED`: 每日限制超出
- `NOT_FOUND`: 资源未找到
- `INTERNAL_ERROR`: 服务器内部错误

### 错误响应格式
```json
{
  "success": false,
  "error": "错误描述",
  "code": "ERROR_CODE",
  "details": "详细信息或字段验证错误",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 使用示例

### 前端React Hook使用

```typescript
import { useMutualAidAuth, useMutualAidPermissions } from '@/hooks/useMutualAidAuth'

function MutualAidComponent() {
  const { 
    isAuthenticated, 
    user, 
    profile, 
    isLoading, 
    authMethod, 
    error 
  } = useMutualAidAuth()
  
  const {
    canSubmitRequests,
    canValidate,
    requestLimit,
    reputation,
    role
  } = useMutualAidPermissions()
  
  if (isLoading) return <div>加载中...</div>
  if (error) return <div>认证错误: {error}</div>
  if (!isAuthenticated) return <div>请先登录</div>
  
  return (
    <div>
      <h1>欢迎, {profile?.display_name}</h1>
      <p>声誉积分: {reputation}</p>
      <p>角色: {role}</p>
      
      {canSubmitRequests && (
        <button>提交互助请求 (剩余{requestLimit}次)</button>
      )}
      
      {canValidate && (
        <button>验证他人请求</button>
      )}
    </div>
  )
}
```

### API调用示例

```typescript
// 获取互助请求列表
async function fetchMutualAidRequests(filters = {}) {
  const authToken = getStoredAuthToken() // 从localStorage获取token
  
  const queryParams = new URLSearchParams({
    page: '1',
    limit: '20',
    status: 'pending',
    ...filters
  }).toString()
  
  try {
    const response = await fetch(`/api/mutual-aid/requests?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || '获取请求列表失败')
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('获取互助请求失败:', error)
    throw error
  }
}

// 提交新的互助请求
async function submitMutualAidRequest(requestData) {
  const authToken = getStoredAuthToken()
  
  try {
    const response = await fetch('/api/mutual-aid/requests', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      if (errorData.code === 'DAILY_LIMIT_EXCEEDED') {
        alert(`今日申请次数已达上限，明天再试吧！重置时间: ${new Date(errorData.reset_time).toLocaleString()}`)
        return null
      }
      throw new Error(errorData.error || '提交申请失败')
    }
    
    const data = await response.json()
    return data
  } catch (error) {
    console.error('提交互助请求失败:', error)
    throw error  
  }
}
```

## 安全考虑

### 认证安全
- JWT令牌有效期限制（24小时）
- 支持令牌自动刷新机制
- 多层认证验证（Supabase + 自定义逻辑）

### 权限安全  
- 基于角色的访问控制(RBAC)
- 细粒度权限检查
- 操作级别的权限验证

### 数据安全
- 敏感数据不在日志中暴露
- 钱包地址和邮箱地址规范化处理
- 用户输入严格验证和清理

### 速率限制
- 每日请求和验证次数限制
- 基于用户声誉的动态限制
- 管理员可配置的限制参数

## 监控和日志

### 关键日志事件
- 用户认证成功/失败
- 权限检查结果  
- 每日限制触发
- API调用频次和错误

### 监控指标
- 认证成功率
- API响应时间
- 错误率分布
- 用户活跃度

---

*文档版本: v1.0.0*  
*最后更新: 2025-01-08*  
*维护者: AstroZi开发团队*