/**
 * 暗色星空主题配置 - 命理排盘专用
 * 基于 BRANDKIT.md 暗色模式规范扩展
 */

export const ASTRO_THEME = {
  // 星空背景
  background: {
    starfield: 'bg-[#0A0E1A]', // 深空背景
    nebula: 'bg-gradient-to-br from-[#1A2242] via-[#0F1629] to-[#0A0E1A]', // 星云渐变
    overlay: 'bg-black/40', // 遮罩层
  },

  // 毛玻璃效果
  glass: {
    card: 'backdrop-blur-xl bg-[rgba(var(--card-bg))] border border-[rgb(var(--accent-color))]/20',
    cardHover: 'hover:border-[rgb(var(--accent-color))]/40 hover:shadow-[0_0_30px_rgba(var(--accent-color),0.15)]',
    panel: 'backdrop-blur-md bg-black/30 border border-white/10',
    panelHover: 'hover:bg-black/40 hover:border-white/20',
    input: 'backdrop-blur-sm bg-black/20 border border-[rgb(var(--accent-color))]/30',
    modal: 'backdrop-blur-2xl bg-[rgba(var(--bg-color))]/90 border border-[rgb(var(--accent-color))]/30',
  },

  // 文本颜色
  text: {
    primary: 'text-[rgb(var(--accent-color))]', // 金黄色主文本
    secondary: 'text-[rgb(var(--secondary-text-color))]', // 淡灰色副文本
    muted: 'text-[rgb(var(--secondary-text-color))]/70', // 更淡的文本
    highlight: 'text-[rgb(var(--accent-color))] font-semibold', // 高亮文本
  },

  // 五行颜色（命理专用）
  elements: {
    wood: 'text-emerald-400', // 木 - 翠绿
    fire: 'text-rose-400', // 火 - 玫红
    earth: 'text-amber-400', // 土 - 琥珀
    metal: 'text-slate-300', // 金 - 银灰
    water: 'text-cyan-400', // 水 - 青色
  },

  // 宫位颜色（紫微斗数）
  palaces: {
    life: 'border-[rgb(var(--accent-color))]/50 bg-[rgb(var(--accent-color))]/5',
    career: 'border-purple-400/50 bg-purple-400/5',
    wealth: 'border-amber-400/50 bg-amber-400/5',
    health: 'border-cyan-400/50 bg-cyan-400/5',
    marriage: 'border-rose-400/50 bg-rose-400/5',
    default: 'border-white/20 bg-white/5',
  },

  // 星曜颜色（紫微斗数）
  stars: {
    bright: 'text-[rgb(var(--accent-color))]', // 亮星
    medium: 'text-[rgb(var(--secondary-text-color))]', // 中等
    dim: 'text-[rgb(var(--secondary-text-color))]/50', // 暗星
    sihua: 'text-purple-400', // 四化
  },

  // 按钮样式
  buttons: {
    primary: 'bg-[rgb(var(--accent-color))] text-[rgb(var(--primary-text-color))] hover:opacity-90',
    secondary: 'bg-[rgba(var(--card-bg))] text-[rgb(var(--accent-color))] border border-[rgb(var(--accent-color))]/30 hover:border-[rgb(var(--accent-color))]/50',
    ghost: 'bg-transparent text-[rgb(var(--secondary-text-color))] hover:bg-white/10',
  },

  // 边框
  borders: {
    default: 'border-[rgb(var(--accent-color))]/20',
    hover: 'hover:border-[rgb(var(--accent-color))]/40',
    active: 'border-[rgb(var(--accent-color))]/60',
    subtle: 'border-white/10',
  },

  // 阴影效果
  shadows: {
    glow: 'shadow-[0_0_20px_rgba(var(--accent-color),0.2)]',
    glowHover: 'hover:shadow-[0_0_30px_rgba(var(--accent-color),0.3)]',
    soft: 'shadow-lg shadow-black/50',
  },

  // 响应式断点
  breakpoints: {
    mobile: '640px', // sm
    tablet: '768px', // md
    desktop: '1024px', // lg
    wide: '1280px', // xl
  },
} as const;

/**
 * 工具函数：组合className
 */
export const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
};

/**
 * 获取五行颜色
 */
export const getElementColor = (element: '木' | '火' | '土' | '金' | '水'): string => {
  return ASTRO_THEME.elements[
    { '木': 'wood', '火': 'fire', '土': 'earth', '金': 'metal', '水': 'water' }[element] as keyof typeof ASTRO_THEME.elements
  ];
};

/**
 * 获取宫位样式
 */
export const getPalaceStyle = (palaceName: string): string => {
  const palaceMap: Record<string, keyof typeof ASTRO_THEME.palaces> = {
    '命宫': 'life',
    'Life': 'life',
    '官禄宫': 'career',
    'Career': 'career',
    '财帛宫': 'wealth',
    'Wealth': 'wealth',
    '疾厄宫': 'health',
    'Health': 'health',
    '夫妻宫': 'marriage',
    'Marriage': 'marriage',
  };

  return ASTRO_THEME.palaces[palaceMap[palaceName] || 'default'];
};
