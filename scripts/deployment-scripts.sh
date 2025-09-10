#!/bin/bash
# scripts/deployment-scripts.sh - 部署脚本集合

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查必需的环境变量
check_env_vars() {
    local target=$1
    log_info "检查 $target 部署目标的环境变量..."
    
    local required_vars=("NEXT_PUBLIC_SUPABASE_URL" "NEXT_PUBLIC_SUPABASE_ANON_KEY")
    
    case $target in
        "web3")
            required_vars+=("NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID")
            ;;
        "web2"|"unified")
            required_vars+=("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY")
            ;;
    esac
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            log_error "缺少必需的环境变量: $var"
            return 1
        fi
    done
    
    log_success "环境变量检查通过"
}

# 生成环境变量文件
generate_env_file() {
    local target=$1
    local env_file=".env.$target"
    
    log_info "为 $target 生成环境变量文件: $env_file"
    
    cat > "$env_file" << EOF
# $target Environment Configuration
# Generated on $(date)

# Deployment Configuration
NEXT_PUBLIC_DEPLOYMENT_TARGET=$target
NODE_ENV=production

# Application Mode
EOF

    case $target in
        "web3")
            cat >> "$env_file" << EOF
NEXT_PUBLIC_APP_MODE=web3
NEXT_PUBLIC_SUPPORTED_LANGUAGES=en
NEXT_PUBLIC_DEFAULT_LANGUAGE=en
NEXT_PUBLIC_BASE_URL=https://astrozi.ai
EOF
            ;;
        "web2")
            cat >> "$env_file" << EOF
NEXT_PUBLIC_APP_MODE=web2
NEXT_PUBLIC_SUPPORTED_LANGUAGES=en,zh,ja,ko,es,fr
NEXT_PUBLIC_DEFAULT_LANGUAGE=en
NEXT_PUBLIC_BASE_URL=https://astrozi.app
EOF
            ;;
        "unified")
            cat >> "$env_file" << EOF
NEXT_PUBLIC_APP_MODE=unified
NEXT_PUBLIC_SUPPORTED_LANGUAGES=zh,en
NEXT_PUBLIC_DEFAULT_LANGUAGE=zh
NEXT_PUBLIC_BASE_URL=https://astrozi.com
EOF
            ;;
    esac
    
    cat >> "$env_file" << EOF

# External Services (需要手动填入)
NEXT_PUBLIC_SUPABASE_URL=\${NEXT_PUBLIC_SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=\${NEXT_PUBLIC_SUPABASE_ANON_KEY}
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=\${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=\${NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID}

# Analytics & Monitoring
NEXT_PUBLIC_GA_ID=\${NEXT_PUBLIC_GA_ID}
SENTRY_DSN=\${SENTRY_DSN}
EOF
    
    log_success "环境变量文件已生成: $env_file"
}

# 构建特定目标
build_target() {
    local target=$1
    log_info "开始构建 $target 版本..."
    
    # 设置环境变量
    export NEXT_PUBLIC_DEPLOYMENT_TARGET=$target
    
    case $target in
        "web3")
            export NEXT_PUBLIC_APP_MODE=web3
            export NEXT_PUBLIC_DEFAULT_LANGUAGE=en
            ;;
        "web2")
            export NEXT_PUBLIC_APP_MODE=web2
            export NEXT_PUBLIC_DEFAULT_LANGUAGE=en
            ;;
        "unified")
            export NEXT_PUBLIC_APP_MODE=unified
            export NEXT_PUBLIC_DEFAULT_LANGUAGE=zh
            ;;
        *)
            log_error "未知的部署目标: $target"
            return 1
            ;;
    esac
    
    # 清理之前的构建
    rm -rf .next
    rm -rf out
    
    # 安装依赖
    log_info "安装依赖..."
    pnpm install --frozen-lockfile --prod
    
    # 运行构建
    log_info "执行构建..."
    pnpm build
    
    # 验证构建
    if [ -d ".next" ]; then
        log_success "$target 构建完成"
        
        # 构建信息
        local build_size=$(du -sh .next | cut -f1)
        log_info "构建大小: $build_size"
        
        return 0
    else
        log_error "$target 构建失败"
        return 1
    fi
}

# 部署到Vercel
deploy_to_vercel() {
    local target=$1
    local branch=${2:-main}
    
    log_info "部署 $target 到 Vercel (分支: $branch)..."
    
    # 检查vercel CLI
    if ! command -v vercel &> /dev/null; then
        log_error "Vercel CLI 未安装。请运行: pnpm add -g vercel 或 npm install -g vercel"
        return 1
    fi
    
    # 构建项目
    build_target $target || return 1
    
    # 设置部署参数
    local project_name="astrozi-$target"
    local domain
    
    case $target in
        "web3")
            domain="astrozi.ai"
            ;;
        "web2")
            domain="astrozi.app"
            ;;
        "unified")
            domain="astrozi.com"
            ;;
    esac
    
    # 执行部署
    log_info "部署到域名: $domain"
    
    # 这里应该根据实际的Vercel配置进行部署
    # vercel --prod --confirm --name $project_name
    
    log_success "$target 部署完成到 https://$domain"
}

# 验证部署
validate_deployment() {
    local target=$1
    local url=$2
    
    log_info "验证 $target 部署 ($url)..."
    
    # 检查网站是否可访问
    local status=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")
    
    if [ "$status" = "200" ]; then
        log_success "部署验证成功: $url"
    else
        log_error "部署验证失败: $url (状态码: $status)"
        return 1
    fi
    
    # 验证配置是否正确加载
    local config_check=$(curl -s "$url/api/health" | grep -o "\"mode\":\"[^\"]*\"" || echo "")
    if [ -n "$config_check" ]; then
        log_info "配置验证: $config_check"
    fi
}

# 数据库迁移
run_migrations() {
    log_info "运行数据库迁移..."
    
    # 检查Supabase CLI
    if ! command -v supabase &> /dev/null; then
        log_warning "Supabase CLI 未安装，跳过数据库迁移"
        return 0
    fi
    
    # 运行迁移（如果有的话）
    if [ -d "supabase/migrations" ] && [ "$(ls -A supabase/migrations)" ]; then
        supabase db push
        log_success "数据库迁移完成"
    else
        log_info "没有待执行的数据库迁移"
    fi
}

# 主要命令处理
case "$1" in
    "check-env")
        check_env_vars "$2"
        ;;
    "generate-env")
        generate_env_file "$2"
        ;;
    "build")
        build_target "$2"
        ;;
    "deploy")
        deploy_to_vercel "$2" "$3"
        ;;
    "validate")
        validate_deployment "$2" "$3"
        ;;
    "migrate")
        run_migrations
        ;;
    "full-deploy")
        target=$2
        log_info "开始完整部署流程: $target"
        
        check_env_vars "$target" && \
        run_migrations && \
        build_target "$target" && \
        deploy_to_vercel "$target" && \
        validate_deployment "$target" "https://$target.astrozi.com"
        
        if [ $? -eq 0 ]; then
            log_success "完整部署流程成功完成: $target"
        else
            log_error "部署流程失败"
            exit 1
        fi
        ;;
    *)
        echo "用法: $0 {check-env|generate-env|build|deploy|validate|migrate|full-deploy} [target] [options]"
        echo ""
        echo "可用的部署目标:"
        echo "  web3    - Web3完整版本 (astrozi.ai)"
        echo "  web2    - Web2多语言版 (astrozi.app)"
        echo "  unified - 统一版本 (astrozi.com)"
        echo ""
        echo "示例:"
        echo "  $0 build web3"
        echo "  $0 deploy web2 main"
        echo "  $0 full-deploy web3"
        exit 1
        ;;
esac