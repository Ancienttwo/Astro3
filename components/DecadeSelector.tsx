"use client";

import { useState } from 'react';
import { PalaceData } from '@/app/ziwei/page';
import { Button } from './ui/button';

interface DecadeSelectorProps {
    decades: PalaceData[];
    selectedIndex: number | null;
    onSelect: (index: number | null) => void;
}

export default function DecadeSelector({ decades, selectedIndex, onSelect }: DecadeSelectorProps) {
    if (!decades?.length) {
        return null;
    }

    const handleSelect = (index: number) => {
        onSelect(selectedIndex === index ? null : index);
    };

    return (
        <div className="w-full overflow-x-auto scrollbar-hide">
            <div className="flex gap-1 p-2 xl:gap-2 xl:justify-between" style={{ minWidth: 'max-content' }}>
                {decades.map((palace, index) => (
                    <Button
                        key={palace.id}
                        onClick={() => handleSelect(index)}
                        variant={selectedIndex === index ? 'default' : 'outline'}
                        className={`h-auto text-xs p-2 flex flex-col items-center justify-center transition-colors duration-200 border-0 
                            xl:flex-1 xl:max-w-[60px] xl:min-w-[50px] xl:text-xs ${
                            selectedIndex === index 
                            ? 'bg-purple-600 hover:bg-purple-700 text-white font-bold' 
                            : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                        }`}
                        style={{ 
                            minWidth: '60px', 
                            minHeight: '45px'
                        }}
                    >
                        <div className="flex flex-col text-center leading-tight">
                            {palace.name.split('').map((char, i) => (
                                <span key={i} className="text-xs xl:text-[10px]">{char}</span>
                            ))}
                        </div>
                    </Button>
                ))}
            </div>
        </div>
    );
} 