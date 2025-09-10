// lib/config/ui-theme-config.ts - UI主题和组件差异化配置
import { APP_CONFIG } from './app-config';
import { DEPLOYMENT_CONFIG } from './deployment-config';

// 主题类型定义
export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: {
      primary: string;
      secondary: string;
      accent: string;
    };
    border: string;
    gradient: {
      primary: string;
      secondary: string;
    };
  };
  typography: {
    fontFamily: {
      sans: string[];
      serif: string[];
      mono: string[];
    };
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

// Web3主题配置
const WEB3_THEME: ThemeConfig = {
  colors: {
    primary: '#6366f1', // 现代紫色
    secondary: '#8b5cf6', // 科技紫
    accent: '#06b6d4', // 青色
    background: '#0f172a', // 深色背景
    surface: '#1e293b',
    text: {
      primary: '#f8fafc',
      secondary: '#cbd5e1',
      accent: '#06b6d4'
    },
    border: '#334155',
    gradient: {
      primary: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
      secondary: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)'
    }
  },
  typography: {
    fontFamily: {
      sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      serif: ['ui-serif', 'Georgia'],
      mono: ['ui-monospace', 'SFMono-Regular']
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem'
    }
  },
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem'
  },
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem'
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
  }
};

// 传统主题配置
const TRADITIONAL_THEME: ThemeConfig = {
  colors: {
    primary: '#dc2626', // 中国红
    secondary: '#ca8a04', // 金黄色
    accent: '#059669', // 翡翠绿
    background: '#fef7ed', // 温暖米色
    surface: '#ffffff',
    text: {
      primary: '#1f2937',
      secondary: '#6b7280',
      accent: '#dc2626'
    },
    border: '#d1d5db',
    gradient: {
      primary: 'linear-gradient(135deg, #dc2626 0%, #ca8a04 100%)',
      secondary: 'linear-gradient(135deg, #ca8a04 0%, #059669 100%)'
    }
  },
  typography: {
    fontFamily: {
      sans: ['Noto Sans SC', 'ui-sans-serif', 'system-ui'],
      serif: ['Noto Serif SC', 'ui-serif', 'Georgia'],
      mono: ['ui-monospace', 'SFMono-Regular']
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem', 
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem'
    }
  },
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem'
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem'
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(255, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(255, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(255, 0, 0, 0.1)'
  }
};

// 通用主题配置
const UNIVERSAL_THEME: ThemeConfig = {
  colors: {
    primary: '#3b82f6', // 现代蓝色
    secondary: '#6366f1', // 紫色
    accent: '#10b981', // 绿色
    background: '#ffffff',
    surface: '#f9fafb',
    text: {
      primary: '#111827',
      secondary: '#6b7280',
      accent: '#3b82f6'
    },
    border: '#e5e7eb',
    gradient: {
      primary: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
      secondary: 'linear-gradient(135deg, #10b981 0%, #3b82f6 100%)'
    }
  },
  typography: {
    fontFamily: {
      sans: ['system-ui', 'ui-sans-serif'],
      serif: ['ui-serif', 'Georgia'],
      mono: ['ui-monospace', 'SFMono-Regular']
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem'
    }
  },
  spacing: {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem'
  },
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem'
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
  }
};

// 主题映射
const THEME_MAP = {
  web3: WEB3_THEME,
  traditional: TRADITIONAL_THEME,
  universal: UNIVERSAL_THEME
} as const;

// 获取当前主题
export function getCurrentTheme(): ThemeConfig {
  return THEME_MAP[APP_CONFIG.ui.theme];
}

// 组件样式配置
export interface ComponentStyleConfig {
  button: {
    primary: string;
    secondary: string;
    ghost: string;
  };
  card: {
    base: string;
    elevated: string;
  };
  input: {
    base: string;
    focused: string;
    error: string;
  };
  navigation: {
    active: string;
    inactive: string;
    hover: string;
  };
}

// Web3组件样式
const WEB3_COMPONENTS: ComponentStyleConfig = {
  button: {
    primary: 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-lg',
    secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600',
    ghost: 'hover:bg-slate-800/50 text-slate-300 hover:text-white border-0'
  },
  card: {
    base: 'bg-slate-800/50 border border-slate-700 backdrop-blur-sm',
    elevated: 'bg-slate-800/80 border border-slate-600 shadow-xl backdrop-blur-md'
  },
  input: {
    base: 'bg-slate-800 border-slate-600 text-slate-200 placeholder-slate-400',
    focused: 'border-indigo-500 ring-2 ring-indigo-500/20',
    error: 'border-red-500 ring-2 ring-red-500/20'
  },
  navigation: {
    active: 'bg-indigo-600 text-white',
    inactive: 'text-slate-400 hover:text-slate-200',
    hover: 'bg-slate-800/50'
  }
};

// 传统组件样式
const TRADITIONAL_COMPONENTS: ComponentStyleConfig = {
  button: {
    primary: 'bg-gradient-to-r from-red-600 to-yellow-600 hover:from-red-700 hover:to-yellow-700 text-white border-0 shadow-md',
    secondary: 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300',
    ghost: 'hover:bg-red-50 text-red-600 hover:text-red-700 border-0'
  },
  card: {
    base: 'bg-white border border-amber-200 shadow-sm',
    elevated: 'bg-white border border-amber-300 shadow-lg'
  },
  input: {
    base: 'bg-white border-gray-300 text-gray-900 placeholder-gray-400',
    focused: 'border-red-500 ring-2 ring-red-500/20',
    error: 'border-red-500 ring-2 ring-red-500/20'
  },
  navigation: {
    active: 'bg-red-600 text-white',
    inactive: 'text-gray-600 hover:text-gray-900',
    hover: 'bg-red-50'
  }
};

// 通用组件样式
const UNIVERSAL_COMPONENTS: ComponentStyleConfig = {
  button: {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-sm',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300',
    ghost: 'hover:bg-gray-100 text-gray-600 hover:text-gray-900 border-0'
  },
  card: {
    base: 'bg-white border border-gray-200 shadow-sm',
    elevated: 'bg-white border border-gray-300 shadow-md'
  },
  input: {
    base: 'bg-white border-gray-300 text-gray-900 placeholder-gray-400',
    focused: 'border-blue-500 ring-2 ring-blue-500/20',
    error: 'border-red-500 ring-2 ring-red-500/20'
  },
  navigation: {
    active: 'bg-blue-600 text-white',
    inactive: 'text-gray-600 hover:text-gray-900',
    hover: 'bg-blue-50'
  }
};

// 组件样式映射
const COMPONENT_MAP = {
  web3: WEB3_COMPONENTS,
  traditional: TRADITIONAL_COMPONENTS,
  universal: UNIVERSAL_COMPONENTS
} as const;

// 获取当前组件样式
export function getCurrentComponentStyles(): ComponentStyleConfig {
  return COMPONENT_MAP[APP_CONFIG.ui.theme];
}

// 工具函数：生成CSS变量
export function generateCSSVariables(theme: ThemeConfig): Record<string, string> {
  return {
    '--color-primary': theme.colors.primary,
    '--color-secondary': theme.colors.secondary,
    '--color-accent': theme.colors.accent,
    '--color-background': theme.colors.background,
    '--color-surface': theme.colors.surface,
    '--color-text-primary': theme.colors.text.primary,
    '--color-text-secondary': theme.colors.text.secondary,
    '--color-text-accent': theme.colors.text.accent,
    '--color-border': theme.colors.border,
    '--gradient-primary': theme.colors.gradient.primary,
    '--gradient-secondary': theme.colors.gradient.secondary,
    '--border-radius-sm': theme.borderRadius.sm,
    '--border-radius-md': theme.borderRadius.md,
    '--border-radius-lg': theme.borderRadius.lg,
    '--border-radius-xl': theme.borderRadius.xl,
    '--shadow-sm': theme.shadows.sm,
    '--shadow-md': theme.shadows.md,
    '--shadow-lg': theme.shadows.lg,
    '--shadow-xl': theme.shadows.xl
  };
}

// 导出配置实例
export const UI_THEME = getCurrentTheme();
export const COMPONENT_STYLES = getCurrentComponentStyles();
export const CSS_VARIABLES = generateCSSVariables(UI_THEME);