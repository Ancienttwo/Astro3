/**
 * 毛玻璃卡片组件 - 命理排盘专用
 * 符合暗色星空主题和响应式设计
 */

import React from 'react';
import { cn } from '@/lib/ui/astro-theme';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'hover' | 'active';
  glow?: boolean;
  children: React.ReactNode;
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = 'default', glow = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          // 基础毛玻璃效果
          'backdrop-blur-xl bg-[rgba(var(--card-bg))]',
          'border border-[rgb(var(--accent-color))]/20',
          'rounded-2xl',
          // Padding - 桌面和移动端适配
          'p-4 md:p-6 lg:p-8',
          // 过渡效果
          'transition-all duration-300',
          // Variant样式
          variant === 'hover' && 'hover:border-[rgb(var(--accent-color))]/40 hover:shadow-[0_0_30px_rgba(var(--accent-color),0.15)]',
          variant === 'active' && 'border-[rgb(var(--accent-color))]/60 shadow-[0_0_30px_rgba(var(--accent-color),0.25)]',
          // 发光效果
          glow && 'shadow-[0_0_20px_rgba(var(--accent-color),0.2)]',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';

/**
 * 玻璃面板 - 用于小型UI元素
 */
export const GlassPanel = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'backdrop-blur-md bg-black/30',
          'border border-white/10',
          'rounded-xl',
          'p-3 md:p-4',
          'transition-all duration-200',
          'hover:bg-black/40 hover:border-white/20',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassPanel.displayName = 'GlassPanel';

/**
 * 玻璃输入框
 */
export const GlassInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        'backdrop-blur-sm bg-black/20',
        'border border-[rgb(var(--accent-color))]/30',
        'rounded-lg',
        'px-4 py-2.5',
        'text-[rgb(var(--secondary-text-color))]',
        'placeholder:text-[rgb(var(--secondary-text-color))]/50',
        'focus:outline-none focus:border-[rgb(var(--accent-color))]/60',
        'focus:ring-2 focus:ring-[rgb(var(--accent-color))]/20',
        'transition-all duration-200',
        className
      )}
      {...props}
    />
  );
});

GlassInput.displayName = 'GlassInput';

/**
 * 玻璃按钮
 */
export interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          // 基础样式
          'rounded-lg font-semibold transition-all duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          // 尺寸
          size === 'sm' && 'px-3 py-1.5 text-sm',
          size === 'md' && 'px-4 py-2.5 text-base',
          size === 'lg' && 'px-6 py-3 text-lg',
          // Variant样式
          variant === 'primary' && 'bg-[rgb(var(--accent-color))] text-[rgb(var(--primary-text-color))] hover:opacity-90 shadow-lg',
          variant === 'secondary' && 'bg-[rgba(var(--card-bg))] text-[rgb(var(--accent-color))] border border-[rgb(var(--accent-color))]/30 hover:border-[rgb(var(--accent-color))]/50 backdrop-blur-md',
          variant === 'ghost' && 'bg-transparent text-[rgb(var(--secondary-text-color))] hover:bg-white/10',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

GlassButton.displayName = 'GlassButton';

/**
 * 星空背景容器
 */
export const StarfieldContainer = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'min-h-screen',
        'bg-gradient-to-br from-[#1A2242] via-[#0F1629] to-[#0A0E1A]',
        'relative overflow-hidden',
        className
      )}
      {...props}
    >
      {/* 星空装饰 */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-1 h-1 bg-white rounded-full animate-pulse" />
        <div className="absolute top-20 right-20 w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-20 left-1/4 w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-white rounded-full animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-0.5 h-0.5 bg-white rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* 内容 */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
});

StarfieldContainer.displayName = 'StarfieldContainer';
