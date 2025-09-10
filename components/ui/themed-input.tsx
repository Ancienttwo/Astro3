// components/ui/themed-input.tsx - 主题化输入框组件
"use client";

import React from 'react';
import { Input, InputProps } from '@/components/ui/input';
import { COMPONENT_STYLES } from '@/lib/config/ui-theme-config';
import { cn } from '@/lib/utils';

interface ThemedInputProps extends InputProps {
  error?: boolean;
}

export function ThemedInput({ 
  error = false,
  className,
  ...props 
}: ThemedInputProps) {
  const baseStyles = COMPONENT_STYLES.input.base;
  const focusStyles = COMPONENT_STYLES.input.focused;
  const errorStyles = error ? COMPONENT_STYLES.input.error : '';
  
  return (
    <Input
      className={cn(
        baseStyles,
        'focus:' + focusStyles.replace(/^border-|ring-/, ''),
        error && errorStyles,
        className
      )}
      {...props}
    />
  );
}