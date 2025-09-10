"use client"

import ZoomableLayout from '@/components/ZoomableLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function TestZoomPage() {
  return (
    <ZoomableLayout
      showZoomControl={true}
      zoomControlPosition="bottom-right"
      enableKeyboardShortcuts={true}
      onlyDesktop={true}
    >
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* 页面标题 */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              桌面端缩放功能测试
            </h1>
            <p className="text-gray-300 text-lg">
              使用右下角的缩放控制器测试缩放功能，或使用键盘快捷键 Ctrl + Plus/Minus
            </p>
          </div>

          {/* 测试卡片网格 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="bg-white/10 backdrop-blur-md border-white/20 text-white">
                <CardHeader>
                  <CardTitle>测试卡片 {i}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4">
                    这是一个测试卡片，用于验证缩放功能是否正常工作。
                    当你调整缩放比例时，这些内容应该会相应地放大或缩小。
                  </p>
                  <Button variant="outline" className="w-full">
                    测试按钮 {i}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 功能说明 */}
          <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
            <CardHeader>
              <CardTitle>缩放功能说明</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-yellow-400 mb-2">自动缩放</h3>
                <p className="text-gray-300">
                  当浏览器窗口宽度小于1200px时，页面会自动缩放以适应屏幕。
                  最小缩放比例为70%，确保内容始终可见。
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-yellow-400 mb-2">手动控制</h3>
                <ul className="text-gray-300 space-y-1 list-disc list-inside">
                  <li>点击右下角的缩放控制器</li>
                  <li>使用 + / - 按钮调整缩放</li>
                  <li>点击设置按钮查看更多选项</li>
                  <li>可以在自动缩放和手动缩放之间切换</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-yellow-400 mb-2">键盘快捷键</h3>
                <ul className="text-gray-300 space-y-1 list-disc list-inside">
                  <li>Ctrl + Plus: 放大</li>
                  <li>Ctrl + Minus: 缩小</li>
                  <li>Ctrl + 0: 重置缩放</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-yellow-400 mb-2">预设缩放比例</h3>
                <p className="text-gray-300">
                  70%, 85%, 100% 三个预设比例，可以快速切换。
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 测试区域 */}
          <Card className="bg-yellow-400/20 border-yellow-400/40">
            <CardHeader>
              <CardTitle className="text-yellow-400">测试区域</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['小', '中', '大', '特大'].map((size, i) => (
                  <div 
                    key={size}
                    className={`
                      bg-white/20 rounded-lg p-4 text-center
                      ${i === 0 ? 'text-sm' : ''}
                      ${i === 1 ? 'text-base' : ''}
                      ${i === 2 ? 'text-lg' : ''}
                      ${i === 3 ? 'text-xl font-bold' : ''}
                    `}
                  >
                    <div className="text-white">{size}文字</div>
                    <div className="text-gray-300 text-xs mt-2">
                      {i === 0 && '12px'}
                      {i === 1 && '14px'}
                      {i === 2 && '16px'}
                      {i === 3 && '18px'}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ZoomableLayout>
  )
}