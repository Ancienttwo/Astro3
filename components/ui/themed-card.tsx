// components/ui/themed-card.tsx - 主题化卡片组件
"use client";

import React from 'react';
import { Card, CardProps } from '@/components/ui/card';
import { COMPONENT_STYLES } from '@/lib/config/ui-theme-config';
import { cn } from '@/lib/utils';

interface ThemedCardProps extends CardProps {
  themeVariant?: 'base' | 'elevated';
}

export function ThemedCard({ 
  themeVariant = 'base',
  className,
  ...props 
}: ThemedCardProps) {
  const themeStyles = COMPONENT_STYLES.card[themeVariant];
  
  return (
    <Card
      className={cn(themeStyles, className)}
      {...props}
    />
  );
}