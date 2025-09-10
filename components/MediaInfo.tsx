"use client"

import { Twitter, MessageCircle, Mail, ExternalLink, Globe, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, } from "@/components/ui/card"

export default function MediaInfo() {
  const mediaLinks = [
    {
      name: "Twitter / X",
      icon: Twitter,
      url: "https://twitter.com/astrozi_official",
      description: "关注我们获取最新动态和命理知识",
      color: "text-blue-500"
    },
    {
      name: "Discord 社区",
      icon: MessageCircle,
      url: "https://discord.gg/astrozi",
      description: "加入我们的社区，与其他用户交流",
      color: "text-indigo-500"
    },
    {
      name: "客服邮箱",
      icon: Mail,
      url: "mailto:support@astrozi.com",
      description: "遇到问题？直接联系我们的客服团队",
      color: "text-green-500"
    },
    {
      name: "返回首页",
      icon: Globe,
      url: "/",
      description: "返回AstroZi应用首页",
      color: "text-purple-500"
    }
  ]

  const handleLinkClick = (url: string) => {
    if (url.startsWith('mailto:')) {
      window.location.href = url
    } else if (url === '/') {
      window.location.href = '/'
    } else {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-primary dark:text-amber-400 mb-2">联系我们</h3>
        <p className="text-sm text-muted-foreground dark:text-slate-300">通过以下方式与我们保持联系</p>
      </div>

      <div className="grid gap-4">
        {mediaLinks.map((link, index) => {
          const Icon = link.icon
          return (
            <Card key={index} className="hover:shadow-md transition-shadow cursor-pointer group dark:bg-slate-800/60 dark:border-slate-600" onClick={() => handleLinkClick(link.url)}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-full bg-muted/50 dark:bg-slate-700/50 ${link.color} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-foreground dark:text-amber-400">{link.name}</h4>
                      <ExternalLink className="w-3 h-3 text-muted-foreground dark:text-slate-400 group-hover:text-primary dark:group-hover:text-amber-400 transition-colors" />
                    </div>
                    <p className="text-sm text-muted-foreground dark:text-slate-300 mt-1">{link.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="pt-4 border-t border-border dark:border-slate-600">
        <Card className="bg-primary/5 dark:bg-amber-400/5 border-primary/20 dark:border-amber-400/20">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <FileText className="w-5 h-5 text-primary dark:text-amber-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-primary dark:text-amber-400 mb-1">反馈建议</h4>
                <p className="text-sm text-muted-foreground dark:text-slate-300 mb-3">
                  您的意见对我们很重要！如果您有任何建议或发现了问题，请通过以上渠道告诉我们。
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleLinkClick('mailto:feedback@astrozi.com')}
                  className="text-primary dark:text-amber-400 border-primary dark:border-amber-400 hover:bg-primary dark:hover:bg-amber-600 hover:text-white"
                >
                  发送反馈
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 