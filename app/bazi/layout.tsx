"use client";

import { FateBookProvider } from '@/contexts/FateBookContext';
import { ReactNode } from 'react';

export default function AnalysisAppLayout({ children }: { children: ReactNode }) {
  return (
    <FateBookProvider>
      {children}
    </FateBookProvider>
  );
} 