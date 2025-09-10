// components/ui/themed-button.tsx - 主题化按钮组件
"use client";

import React from 'react';
import { Button, ButtonProps } from '@/components/ui/button';
import { COMPONENT_STYLES } from '@/lib/config/ui-theme-config';
import { cn } from '@/lib/utils';

interface ThemedButtonProps extends ButtonProps {
  themeVariant?: 'primary' | 'secondary' | 'ghost';
}

export function ThemedButton({ 
  themeVariant = 'primary',
  className,
  variant,
  ...props 
}: ThemedButtonProps) {
  // 获取主题样式
  const themeStyles = COMPONENT_STYLES.button[themeVariant];
  
  // 如果指定了variant，使用默认Button行为
  if (variant) {
    return <Button variant={variant} className={className} {...props} />;
  }

  return (
    <Button
      className={cn(themeStyles, className)}
      {...props}
    />
  );
}