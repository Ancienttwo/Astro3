import React, { useState } from 'react';
import { ChevronDown, Lightbulb, Sparkles } from 'lucide-react';
import SimpleAsyncAnalysis from '@/components/SimpleAsyncAnalysis';
import { getSihuaInterpretationEn, translateStarName, translatePalaceName } from '@/lib/data/sihua-interpretations-complete-en';
import { SIHUA_MAP } from '@/lib/zodiac/sihua';
import type { ZiweiResult, BirthData } from '@/lib/ziwei-calculator';

export default function BirthYearSihua({ ziweiResult, birthData }: { ziweiResult: ZiweiResult, birthData: BirthData }) {
  const [showSihuaScience, setShowSihuaScience] = useState(false);
  // ... 移动的代码 ...
  return (
    <div id="birth-year-sihua" className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-lg mt-4">
      // ... existing content ...
    </div>
  );
} 