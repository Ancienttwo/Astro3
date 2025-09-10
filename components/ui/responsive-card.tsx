'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useResponsiveDesign } from '@/lib/utils/responsive';
import { cn } from '@/lib/utils';

interface ResponsiveCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'gradient' | 'glass' | 'border';
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  stackOnMobile?: boolean;
  elevation?: number;
}

const cardVariants = {
  default: 'bg-card border border-border',
  gradient: 'bg-gradient-to-br from-primary/5 via-background to-primary/10 border border-primary/20',
  glass: 'bg-background/80 backdrop-blur-sm border border-white/20',
  border: 'bg-transparent border-2 border-primary/30'
};

const cardSizes = {
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8'
};

export default function ResponsiveCard({
  title,
  children,
  className,
  variant = 'default',
  size = 'md',
  interactive = false,
  stackOnMobile = true,
  elevation = 1
}: ResponsiveCardProps) {
  const { isMobile, isTablet, shouldReduceAnimations, currentBreakpoint } = useResponsiveDesign();

  // 响应式尺寸调整
  const responsiveSize = isMobile ? 'sm' : isTablet ? 'md' : size;
  
  // 响应式动画配置
  const animationConfig = shouldReduceAnimations ? {} : {
    whileHover: interactive ? { scale: 1.02, y: -4 } : undefined,
    whileTap: interactive ? { scale: 0.98 } : undefined,
    transition: { type: 'spring', stiffness: 300, damping: 20 }
  };

  // 响应式阴影
  const shadowClass = `shadow-${Math.min(elevation, 3)} hover:shadow-${Math.min(elevation + 1, 4)}`;

  return (
    <motion.div
      className={cn(
        'w-full transition-all duration-300',
        interactive && 'cursor-pointer',
        stackOnMobile && isMobile && 'mb-4'
      )}
      {...animationConfig}
    >
      <Card 
        className={cn(
          cardVariants[variant],
          shadowClass,
          'transition-all duration-300',
          interactive && 'hover:border-primary/40',
          className
        )}
      >
        <CardHeader className={cn(
          cardSizes[responsiveSize],
          'pb-4',
          isMobile && 'px-4 py-3'
        )}>
          <CardTitle className={cn(
            'font-semibold',
            isMobile ? 'text-lg' : isTablet ? 'text-xl' : 'text-2xl'
          )}>
            {title}
          </CardTitle>
        </CardHeader>
        
        <CardContent className={cn(
          cardSizes[responsiveSize],
          'pt-0',
          isMobile && 'px-4 pb-4'
        )}>
          {children}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// 响应式网格布局组件
interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  gap?: number;
  className?: string;
}

export function ResponsiveGrid({ 
  children, 
  columns = { xs: 1, sm: 2, md: 3, lg: 4 }, 
  gap = 4,
  className 
}: ResponsiveGridProps) {
  const { currentBreakpoint } = useResponsiveDesign();

  // 根据当前断点确定列数
  const getColumnCount = () => {
    if (columns[currentBreakpoint]) return columns[currentBreakpoint];
    
    // 回退逻辑
    const fallbackOrder = ['xl', 'lg', 'md', 'sm', 'xs'];
    const currentIndex = fallbackOrder.indexOf(currentBreakpoint);
    
    for (let i = currentIndex + 1; i < fallbackOrder.length; i++) {
      const bp = fallbackOrder[i] as keyof typeof columns;
      if (columns[bp]) return columns[bp];
    }
    
    return 1; // 最终回退
  };

  const columnCount = getColumnCount();

  return (
    <div 
      className={cn(
        'grid',
        `grid-cols-${columnCount}`,
        `gap-${gap}`,
        // 添加响应式类
        columns.xs && 'grid-cols-1',
        columns.sm && 'sm:grid-cols-2',
        columns.md && 'md:grid-cols-3',
        columns.lg && 'lg:grid-cols-4',
        columns.xl && 'xl:grid-cols-5',
        columns['2xl'] && '2xl:grid-cols-6',
        className
      )}
      style={{
        gap: `${gap * 0.25}rem`
      }}
    >
      {children}
    </div>
  );
}

// 移动端优化的操作按钮
interface MobileActionButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function MobileActionButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  loading = false,
  disabled = false,
  className
}: MobileActionButtonProps) {
  const { isMobile, isTouch } = useResponsiveDesign();

  // 移动端增大触摸目标
  const mobileSize = isMobile ? 'lg' : size;
  
  // 触摸设备增加视觉反馈
  const touchClass = isTouch ? 'active:scale-95 transition-transform' : '';

  return (
    <motion.button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium',
        'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        
        // 尺寸
        mobileSize === 'sm' && 'px-3 py-2 text-sm min-h-[36px]',
        mobileSize === 'md' && 'px-4 py-2.5 text-base min-h-[44px]',
        mobileSize === 'lg' && 'px-6 py-3 text-lg min-h-[48px]',
        
        // 变体
        variant === 'primary' && 'bg-primary text-primary-foreground hover:bg-primary/90',
        variant === 'secondary' && 'bg-secondary text-secondary-foreground hover:bg-secondary/90',
        variant === 'ghost' && 'hover:bg-accent hover:text-accent-foreground',
        
        // 移动端全宽
        fullWidth && isMobile && 'w-full',
        
        // 触摸反馈
        touchClass,
        
        className
      )}
      onClick={onClick}
      disabled={disabled || loading}
      whileTap={isTouch ? { scale: 0.95 } : undefined}
      transition={{ duration: 0.1 }}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      
      {!loading && icon && (
        <span className="flex-shrink-0">
          {icon}
        </span>
      )}
      
      <span className={cn(
        isMobile && 'text-center flex-1'
      )}>
        {children}
      </span>
    </motion.button>
  );
}

// 移动端优化的列表项
interface MobileListItemProps {
  title: string;
  subtitle?: string;
  value?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClick?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  className?: string;
}

export function MobileListItem({
  title,
  subtitle,
  value,
  icon,
  rightIcon,
  onClick,
  onSwipeLeft,
  onSwipeRight,
  className
}: MobileListItemProps) {
  const { isMobile, isTouch } = useResponsiveDesign();

  return (
    <motion.div
      className={cn(
        'flex items-center gap-3 p-4 bg-card rounded-lg border border-border',
        'hover:bg-accent hover:border-accent-foreground/20 transition-colors',
        onClick && 'cursor-pointer',
        isMobile && 'min-h-[56px]', // 符合移动端最小触摸目标
        className
      )}
      onClick={onClick}
      drag={isTouch && (onSwipeLeft || onSwipeRight) ? 'x' : false}
      dragConstraints={{ left: -100, right: 100 }}
      dragElastic={0.2}
      onDragEnd={(_, info) => {
        if (info.offset.x > 50 && onSwipeRight) {
          onSwipeRight();
        } else if (info.offset.x < -50 && onSwipeLeft) {
          onSwipeLeft();
        }
      }}
      whileTap={isTouch ? { scale: 0.98 } : undefined}
    >
      {icon && (
        <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-primary/10">
          {icon}
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <h4 className={cn(
          'font-medium truncate',
          isMobile ? 'text-base' : 'text-lg'
        )}>
          {title}
        </h4>
        {subtitle && (
          <p className={cn(
            'text-muted-foreground truncate',
            isMobile ? 'text-sm' : 'text-base'
          )}>
            {subtitle}
          </p>
        )}
      </div>
      
      {value && (
        <div className="flex-shrink-0 text-right">
          <span className={cn(
            'font-medium',
            isMobile ? 'text-base' : 'text-lg'
          )}>
            {value}
          </span>
        </div>
      )}
      
      {rightIcon && (
        <div className="flex-shrink-0">
          {rightIcon}
        </div>
      )}
    </motion.div>
  );
}