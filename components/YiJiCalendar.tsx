"use client";

import { useState } from 'react';
import { Solar } from 'lunar-typescript';
import { ChevronLeft, ChevronRight, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// 天干地支五行颜色映射
const wuxingColors = {
    // 天干
    '甲': { color: 'text-green-600 dark:text-emerald-400', bg: 'bg-green-100 dark:bg-emerald-900/40', element: '木' },
    '乙': { color: 'text-green-500 dark:text-emerald-300', bg: 'bg-green-50 dark:bg-emerald-900/20', element: '木' },
    '丙': { color: 'text-red-600 dark:text-rose-400', bg: 'bg-red-100 dark:bg-rose-900/40', element: '火' },
    '丁': { color: 'text-red-500 dark:text-rose-300', bg: 'bg-red-50 dark:bg-rose-900/20', element: '火' },
    '戊': { color: 'text-amber-700 dark:text-stone-400', bg: 'bg-amber-100 dark:bg-stone-900/40', element: '土' },
    '己': { color: 'text-amber-600 dark:text-stone-300', bg: 'bg-amber-50 dark:bg-stone-900/20', element: '土' },
    '庚': { color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/40', element: '金' },
    '辛': { color: 'text-yellow-500 dark:text-yellow-300', bg: 'bg-yellow-50 dark:bg-yellow-900/20', element: '金' },
    '壬': { color: 'text-blue-600 dark:text-sky-400', bg: 'bg-blue-100 dark:bg-sky-900/40', element: '水' },
    '癸': { color: 'text-blue-500 dark:text-sky-300', bg: 'bg-blue-50 dark:bg-sky-900/20', element: '水' },
    // 地支
    '子': { color: 'text-blue-600 dark:text-sky-400', bg: 'bg-blue-100 dark:bg-sky-900/40', element: '水' },
    '丑': { color: 'text-amber-700 dark:text-stone-400', bg: 'bg-amber-100 dark:bg-stone-900/40', element: '土' },
    '寅': { color: 'text-green-600 dark:text-emerald-400', bg: 'bg-green-100 dark:bg-emerald-900/40', element: '木' },
    '卯': { color: 'text-green-500 dark:text-emerald-300', bg: 'bg-green-50 dark:bg-emerald-900/20', element: '木' },
    '辰': { color: 'text-amber-700 dark:text-stone-400', bg: 'bg-amber-100 dark:bg-stone-900/40', element: '土' },
    '巳': { color: 'text-red-600 dark:text-rose-400', bg: 'bg-red-100 dark:bg-rose-900/40', element: '火' },
    '午': { color: 'text-red-500 dark:text-rose-300', bg: 'bg-red-50 dark:bg-rose-900/20', element: '火' },
    '未': { color: 'text-amber-700 dark:text-stone-400', bg: 'bg-amber-100 dark:bg-stone-900/40', element: '土' },
    '申': { color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/40', element: '金' },
    '酉': { color: 'text-yellow-500 dark:text-yellow-300', bg: 'bg-yellow-50 dark:bg-yellow-900/20', element: '金' },
    '戌': { color: 'text-amber-700 dark:text-stone-400', bg: 'bg-amber-100 dark:bg-stone-900/40', element: '土' },
    '亥': { color: 'text-blue-600 dark:text-sky-400', bg: 'bg-blue-100 dark:bg-sky-900/40', element: '水' },
};

// 获取字符的五行样式
const getWuxingStyle = (char: string) => {
    return wuxingColors[char as keyof typeof wuxingColors] || { color: 'text-purple-700', bg: 'bg-purple-100', element: '' };
};

export default function YiJiCalendar() {
    const [selectedDate, setSelectedDate] = useState(new Date());

    const handlePrevDay = () => {
        const prevDay = new Date(selectedDate);
        prevDay.setDate(prevDay.getDate() - 1);
        setSelectedDate(prevDay);
    };

    const handleNextDay = () => {
        const nextDay = new Date(selectedDate);
        nextDay.setDate(nextDay.getDate() + 1);
        setSelectedDate(nextDay);
    };

    const handleToday = () => {
        setSelectedDate(new Date());
    };

    const solar = Solar.fromDate(selectedDate);
    const lunar = solar.getLunar();
    const isToday = new Date().toDateString() === selectedDate.toDateString();

    // 获取宜忌信息
    const yis = lunar.getDayYi() || []; // 宜
    const jis = lunar.getDayJi() || []; // 忌

    // 格式化日期显示
    const formatDate = (date: Date) => {
        return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    };

    const formatLunarDate = () => {
        return `农历${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`;
    };

    // 获取节日信息
    const festivals = solar.getFestivals().concat(solar.getOtherFestivals());
    const jieqi = lunar.getJieQi();

    // 渲染带五行颜色的干支
    const renderGanZhi = (ganZhi: string) => {
        return ganZhi.split('').map((char, index) => {
            const style = getWuxingStyle(char);
            return (
                <div 
                    key={index} 
                    className={`${style.color} ${style.bg} rounded-lg p-2 font-bold text-lg text-center border border-opacity-20 border-current transition-all hover:scale-105 w-12 h-12 flex items-center justify-center`}
                    title={`${char} - ${style.element}行`}
                >
                    {char}
                </div>
            );
        });
    };

    return (
        <div className="space-y-4">
            {/* 日期选择器 */}
            <div className="flex items-center justify-between mb-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevDay}
                    className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700/40"
                >
                    <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <div className="text-center">
                    <div className="text-lg font-bold dark:text-slate-100">
                        {formatDate(selectedDate)}
                    </div>
                    <div className="text-sm text-muted-foreground dark:text-slate-400">
                        农历{lunar.getMonthInChinese()}{lunar.getDayInChinese()}
                    </div>
                </div>
                
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextDay}
                    className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700/40"
                >
                    <ChevronRight className="w-4 h-4" />
                </Button>
            </div>

            {/* 快速跳转到今天 */}
            {!isToday && (
                <div className="text-center mb-4">
                    <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleToday}
                        className="dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700/40"
                    >
                        <Calendar className="w-4 h-4 mr-2" />
                        回到今天
                    </Button>
                </div>
            )}

            {/* 干支信息 - 4*1竖向排列 */}
            <div className="bg-muted/50 dark:bg-slate-700/30 rounded-lg p-4">
                <div className="grid grid-cols-4 gap-4">
                    {/* 年柱 */}
                    <div className="text-center">
                        <h3 className="text-sm font-medium text-muted-foreground dark:text-slate-400 mb-2">年柱</h3>
                        <div className="flex flex-col items-center space-y-1">
                            {renderGanZhi(lunar.getYearInGanZhi())}
                        </div>
                    </div>
                    {/* 月柱 */}
                    <div className="text-center">
                        <h3 className="text-sm font-medium text-muted-foreground dark:text-slate-400 mb-2">月柱</h3>
                        <div className="flex flex-col items-center space-y-1">
                            {renderGanZhi(lunar.getMonthInGanZhi())}
                        </div>
                    </div>
                    {/* 日柱 */}
                    <div className="text-center">
                        <h3 className="text-sm font-medium text-muted-foreground dark:text-slate-400 mb-2">日柱</h3>
                        <div className="flex flex-col items-center space-y-1">
                            {renderGanZhi(lunar.getDayInGanZhi())}
                        </div>
                    </div>
                    {/* 时柱 */}
                    <div className="text-center">
                        <h3 className="text-sm font-medium text-muted-foreground dark:text-slate-400 mb-2">时柱</h3>
                        <div className="flex flex-col items-center space-y-1">
                            {renderGanZhi(lunar.getTimeInGanZhi())}
                        </div>
                    </div>
                </div>
            </div>

            {/* 节日和节气信息 */}
            {(festivals.length > 0 || jieqi) && (
                <div className="mb-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-amber-700/40">
                    <div className="flex items-center space-x-2 text-yellow-800 dark:text-amber-300">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium">
                            {jieqi && (
                                <span className="mr-2 px-2 py-1 bg-yellow-200 dark:bg-amber-800/60 dark:text-amber-200 rounded text-xs">
                                    {jieqi}
                                </span>
                            )}
                            {festivals.map((festival, index) => (
                                <span key={index} className="mr-2 px-2 py-1 bg-orange-200 dark:bg-orange-800/60 dark:text-orange-200 rounded text-xs">
                                    {festival}
                                </span>
                            ))}
                        </span>
                    </div>
                </div>
            )}

            {/* 宜忌信息 - 4*N排列 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-green-50 dark:bg-emerald-900/20 rounded-lg p-4 border border-green-200 dark:border-emerald-700/40">
                    <h3 className="text-sm font-medium text-green-800 dark:text-emerald-300 mb-3 flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        宜
                    </h3>
                    {yis.length > 0 ? (
                        <div className="grid grid-cols-4 gap-2">
                            {yis.map((item, index) => (
                                <div key={index} className="text-xs text-green-700 dark:text-emerald-200 bg-white/60 dark:bg-slate-800/40 px-2 py-2 rounded text-center">
                                    {item}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-xs text-green-600 dark:text-emerald-300 text-center py-2">诸事不宜</div>
                    )}
                </div>
                
                <div className="bg-red-50 dark:bg-rose-900/20 rounded-lg p-4 border border-red-200 dark:border-rose-700/40">
                    <h3 className="text-sm font-medium text-red-800 dark:text-rose-300 mb-3 flex items-center">
                        <XCircle className="w-4 h-4 mr-1" />
                        忌
                    </h3>
                    {jis.length > 0 ? (
                        <div className="grid grid-cols-4 gap-2">
                            {jis.map((item, index) => (
                                <div key={index} className="text-xs text-red-700 dark:text-rose-200 bg-white/60 dark:bg-slate-800/40 px-2 py-2 rounded text-center">
                                    {item}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-xs text-red-600 dark:text-rose-300 text-center py-2">百无禁忌</div>
                    )}
                </div>
            </div>

            {/* 操作提示 */}
            <div className="mt-6 text-center text-xs text-muted-foreground dark:text-slate-400">
                使用左右箭头查看前后日期的宜忌信息 · 鼠标悬停干支查看五行属性
            </div>
        </div>
    );
} 