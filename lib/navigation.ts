import { BookOpen, FileText, Target, Bot, User } from 'lucide-react'

// 统一的顶部导航栏样式
export const UNIFIED_HEADER_STYLE = "bg-white px-4 py-1 flex items-center justify-between border-b border-gray-100 relative"

// 统一的底部导航配置
export const BOTTOM_NAV_ITEMS = [
  { id: 'wiki', label: '百科', icon: BookOpen, route: '/wiki' },
  { id: 'records', label: '命书', icon: FileText, route: '/charts' },
  { id: 'charts', label: '排盘', icon: Target, route: '/create-chart' },
  { id: 'ai', label: 'AI', icon: Bot, route: '/chatbot' },
  { id: 'profile', label: '设定', icon: User, route: '/settings' }
]

// 向后兼容的别名（已弃用，使用 BOTTOM_NAV_ITEMS）
export const MOBILE_APP_BOTTOM_NAV_ITEMS = BOTTOM_NAV_ITEMS.map(item => ({
  ...item,
  href: item.route,
  activeColor: 'text-blue-600'
})) 