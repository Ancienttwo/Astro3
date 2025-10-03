"use client"

import * as React from "react"
import { useTranslations } from "next-intl"
import { Calendar, Swords, Leaf, Star } from "lucide-react"
import { EducationalCard } from "./EducationalCard"
import YiJiCalendar from "@/components/YiJiCalendar"

export function EducationalSection() {
  const t = useTranslations('dashboard')

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        {t('educational.title')}
      </h2>

      {/* Perpetual Calendar */}
      <EducationalCard
        id="perpetual-calendar"
        title="万年历"
        icon={Calendar}
        previewContent={
          <p>
            查看农历日期、节气、宜忌等传统历法信息。万年历是命理学习的基础工具，帮助您了解每日的天干地支、五行属性等重要信息。
          </p>
        }
      >
        <YiJiCalendar />
      </EducationalCard>

      {/* Ziwei vs Bazi Comparison */}
      <EducationalCard
        id="ziwei-vs-bazi"
        title="紫微斗数 vs 八字"
        icon={Swords}
        previewContent={
          <p>
            了解紫微斗数和八字两大命理体系的区别与联系。紫微斗数注重空间性、结构性分析，八字则强调时间性、能量流转。
          </p>
        }
        expandText="查看详细对比"
      >
        <div className="space-y-6">
          <ComparisonPoint
            title="核心理念"
            ziwei="将人生模拟为微缩的宇宙或社会结构。"
            bazi="将人生看作由五行构成的能量生态系统。"
          />
          <ComparisonPoint
            title="分析侧重"
            ziwei="空间性、结构性分析，精于细节描述，富有\"画面感\"。"
            bazi="时间性、能量流转分析，善于判断格局高低与时机。"
          />
          <ComparisonPoint
            title="好比是"
            ziwei="一张详尽的人生CT扫描报告，看各领域具体状况。"
            bazi="一份体能分析报告和未来天气预报，看宏观趋势与起伏。"
          />
        </div>
      </EducationalCard>

      {/* Five Elements Overview */}
      <EducationalCard
        id="wuxing-overview"
        title="五行基础"
        icon={Leaf}
        previewContent={
          <p>
            五行（木、火、土、金、水）是中国传统哲学的核心概念，代表宇宙万物的五种基本属性和运行规律。了解五行理论是学习命理的第一步。
          </p>
        }
        expandText="学习五行详解"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ElementCard
            name="木"
            color="text-green-600"
            bgColor="bg-green-50 dark:bg-green-900/20"
            description="主仁，其性直，其质和。具有生长、升发、条达性质。"
            examples="甲木如大树，乙木如花草"
          />
          <ElementCard
            name="火"
            color="text-red-600"
            bgColor="bg-red-50 dark:bg-red-900/20"
            description="主礼，其性急，其质恭。具有温热、升腾性质。"
            examples="丙火如太阳，丁火如灯火"
          />
          <ElementCard
            name="土"
            color="text-amber-700"
            bgColor="bg-amber-50 dark:bg-amber-900/20"
            description="主信，其性重，其质厚。具有承载、生化性质。"
            examples="戊土如堤坝，己土如田园"
          />
          <ElementCard
            name="金"
            color="text-yellow-600"
            bgColor="bg-yellow-50 dark:bg-yellow-900/20"
            description="主义，其性刚，其质烈。具有清洁、肃杀性质。"
            examples="庚金如刀剑，辛金如珠玉"
          />
          <ElementCard
            name="水"
            color="text-blue-600"
            bgColor="bg-blue-50 dark:bg-blue-900/20"
            description="主智，其性聪，其质善。具有寒凉、滋润性质。"
            examples="壬水如江河，癸水如雨露"
          />
        </div>
      </EducationalCard>

      {/* Ziwei Stars Overview */}
      <EducationalCard
        id="ziwei-stars-overview"
        title="紫微十四主星简介"
        icon={Star}
        previewContent={
          <p>
            紫微斗数中的十四颗主星，每颗星都代表不同的性格特质和人生使命。了解主星特质，可以更好地认识自己的命盘格局。
          </p>
        }
        expandText="查看十四主星详解"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            紫微斗数将天上的星宿分为北斗、南斗、中天三大星系，共有十四颗主星。每颗主星都有其独特的性格特质、代表人物和象征意义。
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {["紫微", "天机", "太阳", "武曲", "天同", "廉贞", "天府", "太阴", "贪狼", "巨门", "天相", "天梁", "七杀", "破军"].map((star) => (
              <div
                key={star}
                className="p-3 rounded-lg border border-gray-200 dark:border-slate-700 bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-700 hover:shadow-md transition-shadow"
              >
                <p className="text-sm font-semibold text-[#3D0B5B] dark:text-purple-400">
                  {star}星
                </p>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-500 text-center pt-2">
            点击主星名称可查看详细解释（功能开发中）
          </p>
        </div>
      </EducationalCard>
    </div>
  )
}

// Helper Components
function ComparisonPoint({
  title,
  ziwei,
  bazi,
}: {
  title: string
  ziwei: string
  bazi: string
}) {
  return (
    <div>
      <h3 className="font-semibold text-[#3D0B5B] dark:text-amber-400 text-base mb-3">
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-slate-700/60 p-4 rounded-md border border-gray-200 dark:border-slate-600">
          <p className="font-bold text-[#3D0B5B] dark:text-amber-400 text-sm mb-2">
            紫微
          </p>
          <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">
            {ziwei}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-slate-700/60 p-4 rounded-md border border-gray-200 dark:border-slate-600">
          <p className="font-bold text-[#3D0B5B] dark:text-amber-400 text-sm mb-2">
            八字
          </p>
          <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">
            {bazi}
          </p>
        </div>
      </div>
    </div>
  )
}

function ElementCard({
  name,
  color,
  bgColor,
  description,
  examples,
}: {
  name: string
  color: string
  bgColor: string
  description: string
  examples: string
}) {
  return (
    <div className={`p-4 rounded-lg border border-gray-200 dark:border-slate-600 ${bgColor}`}>
      <h4 className={`text-xl font-bold ${color} dark:text-amber-400 mb-2`}>
        {name}
      </h4>
      <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed mb-2">
        {description}
      </p>
      <p className="text-xs text-gray-600 dark:text-slate-400 italic">
        {examples}
      </p>
    </div>
  )
}
