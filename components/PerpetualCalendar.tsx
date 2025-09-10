"use client";

import { useState } from 'react';
import { Solar } from 'lunar-typescript';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PerpetualCalendar() {
    const [currentDate, setCurrentDate] = useState(new Date());

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const startDayOfWeek = firstDayOfMonth.getDay();
    const totalDays = lastDayOfMonth.getDate();

    const days = [];
    for (let i = 0; i < startDayOfWeek; i++) {
        days.push(<div key={`empty-${i}`} className="border-r border-b border-primary/10"></div>);
    }

    for (let i = 1; i <= totalDays; i++) {
        const date = new Date(year, month, i);
        const solar = Solar.fromDate(date);
        const lunar = solar.getLunar();
        const isToday = new Date().toDateString() === date.toDateString();

        days.push(
            <div key={i} className={`p-2 border-r border-b border-primary/10 relative flex flex-col justify-between h-32 transition-colors duration-200 hover:bg-primary/5 ${isToday ? 'bg-yellow-400/10 border-yellow-400/30' : ''}`}>
                <div className={`text-lg font-semibold ${isToday ? 'text-yellow-600' : 'text-foreground'}`}>{i}</div>
                <div className="text-xs space-y-1 text-right">
                    <p className="text-foreground/70">{lunar.getDayInChinese()}</p>
                    <p className="text-yellow-600 font-medium">{lunar.getJieQi() || solar.getFestivals().join(' ') || solar.getOtherFestivals().join(' ')}</p>
                </div>
            </div>
        );
    }
    
    const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

    return (
        <div className="bg-card rounded-lg border border-border p-6 shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="flex justify-between items-center mb-6">
                <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="text-primary hover:bg-primary/10 hover:text-primary">
                    <ChevronLeft />
                </Button>
                <h2 className="text-2xl font-bold text-primary font-noto">
                    {`${year}年 ${month + 1}月`}
                </h2>
                <Button variant="ghost" size="icon" onClick={handleNextMonth} className="text-primary hover:bg-primary/10 hover:text-primary">
                    <ChevronRight />
                </Button>
            </div>
            <div className="grid grid-cols-7 border-t border-l border-primary/10 rounded-lg overflow-hidden shadow-inner">
                {weekDays.map(day => (
                    <div key={day} className="p-3 text-center font-semibold text-foreground border-r border-b border-primary/10 bg-primary/5 backdrop-blur-sm">
                        {day}
                    </div>
                ))}
                {days}
            </div>
        </div>
    );
} 