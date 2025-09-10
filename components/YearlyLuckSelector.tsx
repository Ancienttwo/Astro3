"use client";

import { useState, useMemo } from 'react';
import { PalaceData } from '@/app/ziwei/page';
import { Button } from './ui/button';
import { Solar } from 'lunar-typescript';

interface YearlyLuckSelectorProps {
    birthYear: number;
    selectedDecade: PalaceData;
    selectedIndex: number | null;
    onSelect: (index: number | null) => void;
}

interface YearData {
    year: number;
    ganzhi: string;
}

export default function YearlyLuckSelector({ birthYear, selectedDecade, selectedIndex, onSelect }: YearlyLuckSelectorProps) {
    const years = useMemo(() => {
        if (!selectedDecade?.decade) return [];

        const startAge = parseInt(selectedDecade.decade.split('-')[0], 10);
        const startYear = birthYear + startAge - 1;

        const yearData: YearData[] = [];
        for (let i = 0; i < 10; i++) {
            const currentYear = startYear + i;
            const lunar = Solar.fromYmd(currentYear, 6, 30).getLunar();
            yearData.push({
                year: currentYear,
                ganzhi: lunar.getYearInGanZhi(),
            });
        }
        return yearData;
    }, [birthYear, selectedDecade]);

    if (!years.length) {
        return null;
    }
    
    const handleSelect = (index: number) => {
        const newIndex = selectedIndex === index ? null : index;
        onSelect(newIndex);
    };

    return (
        <div className="w-full overflow-x-auto scrollbar-hide">
            <div className="flex gap-1 p-2 xl:gap-2 xl:justify-between" style={{ minWidth: 'max-content' }}>
                {years.map((year, index) => (
                    <Button
                        key={index}
                        onClick={() => {
                            handleSelect(index);
                        }}
                        variant={selectedIndex === index ? 'default' : 'outline'}
                        className={`text-xs p-2 flex flex-col items-center justify-center transition-colors duration-200 border-0
                            xl:flex-1 xl:max-w-[70px] xl:min-w-[60px] xl:text-xs ${
                            selectedIndex === index 
                            ? 'bg-purple-600 hover:bg-purple-700 text-white font-bold' 
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                        }`}
                        style={{ 
                            minWidth: '70px', 
                            minHeight: '55px',
                            zIndex: 10,
                            position: 'relative'
                        }}
                    >
                        <div className="text-center leading-tight">
                            <div className="text-xs xl:text-[10px] font-medium">{year.year}</div>
                            <div className="text-xs xl:text-[10px]">{year.ganzhi}</div>
                        </div>
                    </Button>
                ))}
            </div>
        </div>
    );
} 