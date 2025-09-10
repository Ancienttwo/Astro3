# 📧 阿里云邮箱配置指南

## 🎯 基本信息
- 邮箱域名：astrozi.ai
- 管理员账号：postmaster@astrozi.ai
- 邮箱访问地址：https://qiye.aliyun.com

## 📋 SMTP配置信息

### 阿里云邮箱SMTP设置
```
SMTP服务器：smtp.mxhichina.com
SMTP端口：465 (SSL加密)
用户名：noreply@astrozi.ai
密码：[需要设置noreply邮箱密码]
```

## 🔧 配置步骤

### 第一步：激活邮箱服务
1. 登录阿里云邮箱：https://qiye.aliyun.com
2. 使用管理员账号：postmaster@astrozi.ai
3. 首次登录需要初始化密码

### 第二步：设置应用专用密码
1. 进入邮箱设置 → 安全设置
2. 启用"应用专用密码"
3. 生成用于SMTP的专用密码
4. 记录此密码用于Supabase配置

### 第三步：配置Supabase邮箱服务

#### 生产环境配置
- 项目ID: typnmjypwxjdpmalsbyj
- 链接: https://supabase.com/dashboard/project/typnmjypwxjdpmalsbyj

#### 测试环境配置  
- 项目ID: innqoumlqctqnryhyasw
- 链接: https://supabase.com/dashboard/project/innqoumlqctqnryhyasw

#### SMTP设置
```
Enable custom SMTP: ✅
SMTP Host: smtp.mxhichina.com
SMTP Port: 465
SMTP User: noreply@astrozi.ai
SMTP Pass: [noreply邮箱密码]
SMTP Admin Email: noreply@astrozi.ai
Enable SSL: ✅
```

### 第四步：DNS配置 (Cloudflare)

#### 1. SPF记录
```
类型: TXT
名称: @
内容: v=spf1 include:spf.mxhichina.com ~all
TTL: Auto
```

#### 2. DKIM记录
```
类型: TXT
名称: default._domainkey
内容: [从阿里云邮箱获取]
TTL: Auto
```

#### 3. DMARC记录
```
类型: TXT
名称: _dmarc
内容: v=DMARC1; p=quarantine; rua=mailto:postmaster@astrozi.ai
TTL: Auto
```

#### 4. MX记录 (如果需要接收邮件)
```
类型: MX
名称: @
内容: mxn.mxhichina.com
优先级: 5
TTL: Auto
```

## 📧 邮箱账号规划

### 系统邮箱
- `postmaster@astrozi.ai` - 管理员邮箱
- `noreply@astrozi.ai` - 系统通知邮箱 ✅ **已配置**
- `support@astrozi.ai` - 客服邮箱

### 功能用途
- 用户注册验证邮件
- 密码重置邮件
- 系统通知邮件
- 营销邮件

## 🧪 测试邮件发送

### 测试步骤
1. 在Supabase中配置SMTP
2. 创建测试用户账号
3. 触发邮箱验证流程
4. 检查邮件是否正常发送和接收

### 测试命令
```bash
# 测试SMTP连接
curl -X POST https://[your-supabase-url]/auth/v1/signup \
  -H "Content-Type: application/json" \
  -H "apikey: [your-anon-key]" \
  -d '{"email": "test@example.com", "password": "testpassword"}'
```

## ⚠️ 注意事项

### 安全设置
- 使用应用专用密码，不要使用登录密码
- 定期更换SMTP密码
- 启用二次验证

### 发送限制
- 阿里云邮箱有日发送量限制
- 避免批量发送被标记为垃圾邮件
- 监控邮件发送状态

### 域名信誉
- 保持良好的发送记录
- 避免发送垃圾邮件
- 及时处理退信和投诉

## 🔍 故障排除

### 常见问题
1. **SMTP认证失败**
   - 检查用户名是否为完整邮箱地址
   - 确认使用应用专用密码
   - 验证SMTP服务器和端口

2. **邮件被标记为垃圾邮件**
   - 检查SPF、DKIM、DMARC记录
   - 确保发件人地址合法
   - 避免触发垃圾邮件关键词

3. **邮件发送失败**
   - 检查网络连接
   - 验证SSL证书
   - 查看Supabase日志

### 调试工具
- MX Toolbox: https://mxtoolbox.com/
- Mail Tester: https://www.mail-tester.com/
- DKIM Validator: https://dkimvalidator.com/

## 📊 监控和维护

### 定期检查
- 邮件发送成功率
- 垃圾邮件投诉率
- DNS记录状态
- SSL证书有效期

### 性能优化
- 使用邮件模板
- 异步发送队列
- 错误重试机制
- 发送频率控制 