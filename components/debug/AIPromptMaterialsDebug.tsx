'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Code, 
  Database, 
  FileText, 
  Sparkles,
  BookOpen,
  Star,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface AIPromptMaterialsDebugProps {
  slipData: any;
}

const AIPromptMaterialsDebug: React.FC<AIPromptMaterialsDebugProps> = ({ slipData }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  if (!slipData?.complete_data?.ai_prompt_materials) {
    return null;
  }

  const materials = slipData.complete_data.ai_prompt_materials;

  return (
    <Card className="border-2 border-yellow-300 bg-yellow-50 shadow-lg mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2 text-yellow-800">
            <Code className="w-6 h-6" />
            <span className="text-xl">【AI Prompt 工程素材】</span>
            <Badge variant="secondary" className="bg-yellow-200 text-yellow-800">
              开发调试
            </Badge>
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="border-yellow-400 text-yellow-700 hover:bg-yellow-100"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {isExpanded ? '收起' : '展开'}
          </Button>
        </div>
        <p className="text-sm text-yellow-700">
          为AI解读功能准备的所有故事和智慧素材
        </p>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="space-y-4">
          {/* 数据库原有故事 */}
          <div className="bg-white p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center space-x-2 mb-3">
              <Database className="w-5 h-5 text-blue-600" />
              <h4 className="font-semibold text-blue-800">数据库原有故事</h4>
              <Badge variant={materials.database_story ? "default" : "secondary"}>
                {materials.database_story ? '有数据' : '无数据'}
              </Badge>
            </div>
            <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
              <p className="text-blue-900 text-sm">
                {materials.database_story || '数据库中暂无故事内容'}
              </p>
            </div>
          </div>

          {/* 数据库象征意义 */}
          <div className="bg-white p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center space-x-2 mb-3">
              <Database className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold text-green-800">数据库象征意义</h4>
              <Badge variant={materials.database_symbolism ? "default" : "secondary"}>
                {materials.database_symbolism ? '有数据' : '无数据'}
              </Badge>
            </div>
            <div className="bg-green-50 p-3 rounded border-l-4 border-green-400">
              <p className="text-green-900 text-sm">
                {materials.database_symbolism || '数据库中暂无象征意义'}
              </p>
            </div>
          </div>

          {/* DOCX历史典故 */}
          <div className="bg-white p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center space-x-2 mb-3">
              <FileText className="w-5 h-5 text-purple-600" />
              <h4 className="font-semibold text-purple-800">DOCX历史典故</h4>
              <Badge variant="default">完整数据</Badge>
            </div>
            <div className="bg-purple-50 p-3 rounded border-l-4 border-purple-400">
              <p className="text-purple-900 text-sm">
                {materials.docx_story}
              </p>
            </div>
          </div>

          {/* 古典智慧概述 */}
          <div className="bg-white p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center space-x-2 mb-3">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <h4 className="font-semibold text-indigo-800">古典智慧概述</h4>
              <Badge variant="default">传统要义</Badge>
            </div>
            <div className="bg-indigo-50 p-3 rounded border-l-4 border-indigo-400">
              <p className="text-indigo-900 text-sm">
                {materials.classical_wisdom}
              </p>
            </div>
          </div>

          {/* 现代实例解说 */}
          <div className="bg-white p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center space-x-2 mb-3">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <h4 className="font-semibold text-emerald-800">现代实例解说</h4>
              <Badge variant="default">含故事实例</Badge>
            </div>
            <div className="bg-emerald-50 p-3 rounded border-l-4 border-emerald-400 max-h-40 overflow-y-auto">
              <div className="text-emerald-900 text-sm whitespace-pre-wrap">
                {materials.modern_examples}
              </div>
            </div>
          </div>

          {/* 12类吉凶判断 */}
          <div className="bg-white p-4 rounded-lg border border-yellow-200">
            <div className="flex items-center space-x-2 mb-3">
              <Star className="w-5 h-5 text-orange-600" />
              <h4 className="font-semibold text-orange-800">12类吉凶判断</h4>
              <Badge variant="default">具体指引</Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {Object.entries(materials.fortune_predictions).map(([category, prediction], index) => (
                <div key={category} className="bg-orange-50 p-2 rounded border border-orange-200">
                  <div className="font-medium text-orange-800 text-xs mb-1">{category}</div>
                  <div className="text-orange-700 text-xs">{prediction as string}</div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Prompt 建议 */}
          <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-lg border-2 border-purple-300">
            <h4 className="font-semibold text-purple-800 mb-2">🤖 AI Prompt工程建议</h4>
            <div className="text-purple-700 text-sm space-y-2">
              <p><strong>故事素材：</strong>优先使用数据库故事，补充DOCX典故</p>
              <p><strong>智慧指引：</strong>结合古典概述和现代实例</p>
              <p><strong>个性化：</strong>根据用户选择的所求之事，引用对应的吉凶判断</p>
              <p><strong>讲故事方式：</strong>以历史典故引入，用现代语言解释，给出实用建议</p>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default AIPromptMaterialsDebug;