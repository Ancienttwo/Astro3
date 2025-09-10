import React, { useState, useEffect } from 'react';
import { calculateZiwei } from '@/lib/ziwei-calculator';
import ZiweiChartWithConnections from './ZiweiChartWithConnections';
import DecadeSelector from '@/components/ziwei/DecadeSelector';
import YearlyLuckSelector from '@/components/ziwei/YearlyLuckSelector';

export default function ZiweiChartComponent({ birthData }) {
  const [ziweiResult, setZiweiResult] = useState(null);
  const [selectedDecadeIndex, setSelectedDecadeIndex] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);

  useEffect(() => {
    const result = calculateZiwei(birthData);
    setZiweiResult(result);
  }, [birthData]);

  if (!ziweiResult) return <div>加载中...</div>;

  return (
    <div className="w-full">
      <ZiweiChartWithConnections result={ziweiResult} />
      <DecadeSelector 
        decades={ziweiResult.decadePalaces}
        selectedIndex={selectedDecadeIndex}
        onSelect={setSelectedDecadeIndex}
      />
      {selectedDecadeIndex !== null && (
        <YearlyLuckSelector
          selectedDecade={ziweiResult.decadePalaces[selectedDecadeIndex]}
          selectedYear={selectedYear}
          onSelect={setSelectedYear}
        />
      )}
    </div>
  );
} 