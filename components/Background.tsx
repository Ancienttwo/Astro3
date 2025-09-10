"use client"

import { useRef, useEffect } from 'react';

interface Star {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  brightness: number;
  baseBrightness: number;
  twinkleSpeed: number;
  twinklePhase: number;
  color: string;
  temperature: number;
  age: number;
  maxAge: number;
  driftSpeed: number;
  pulsePhase: number;
}

interface Meteor {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  opacity: number;
  life: number;
  maxLife: number;
}

export default function Background() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return
        
        const resizeCanvas = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
        }
        
        resizeCanvas()

        // 星星数组
        const stars: Star[] = []
        const numStars = 80 // 减少星星数量，营造更自然的星空
        
        // 流星数组
        const meteors: Meteor[] = []
        let meteorTimer = 0
        
        // 金黄色星星配色 - 与深紫蓝背景形成对比
        const getStarColor = (temperature: number) => {
            if (temperature < 0.2) return '#FFD700' // 纯金色
            if (temperature < 0.4) return '#FFA500' // 橙金色
            if (temperature < 0.6) return '#FFFF00' // 亮黄色
            if (temperature < 0.8) return '#FFFFFF' // 纯白色
            return '#F0E68C' // 卡其金色
        }
        
        // 创建星星
        for (let i = 0; i < numStars; i++) {
            const temperature = Math.random()
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.08,
                vy: (Math.random() - 0.5) * 0.08,
                size: Math.random() * 2 + 1,
                brightness: Math.random() * 0.8 + 0.2,
                baseBrightness: Math.random() * 0.6 + 0.4,
                twinkleSpeed: Math.random() * 0.01 + 0.005,
                twinklePhase: Math.random() * Math.PI * 2,
                color: getStarColor(temperature),
                temperature,
                age: 0,
                maxAge: 5000 + Math.random() * 8000,
                driftSpeed: Math.random() * 0.02 + 0.01,
                pulsePhase: Math.random() * Math.PI * 2
            })
        }

        // 创建新星星
        const createStar = () => {
            const side = Math.floor(Math.random() * 4)
            let x, y
            
            switch(side) {
                case 0: x = Math.random() * canvas.width; y = -20; break
                case 1: x = canvas.width + 20; y = Math.random() * canvas.height; break
                case 2: x = Math.random() * canvas.width; y = canvas.height + 20; break
                default: x = -20; y = Math.random() * canvas.height
            }
            
            const temperature = Math.random()
            return {
                x, y,
                vx: (Math.random() - 0.5) * 0.08,
                vy: (Math.random() - 0.5) * 0.08,
                size: Math.random() * 2 + 1,
                brightness: Math.random() * 0.8 + 0.2,
                baseBrightness: Math.random() * 0.6 + 0.4,
                twinkleSpeed: Math.random() * 0.01 + 0.005,
                twinklePhase: Math.random() * Math.PI * 2,
                color: getStarColor(temperature),
                temperature,
                age: 0,
                maxAge: 5000 + Math.random() * 8000,
                driftSpeed: Math.random() * 0.02 + 0.01,
                pulsePhase: Math.random() * Math.PI * 2
            }
        }

        // 创建流星
        const createMeteor = () => {
            meteors.push({
                x: Math.random() * canvas.width + 100,
                y: -10,
                vx: -(Math.random() * 2 + 1),
                vy: Math.random() * 1.5 + 0.5,
                length: Math.random() * 60 + 30,
                opacity: 1,
                life: 0,
                maxLife: 200 + Math.random() * 150
            })
        }

        // 绘制星星
        const drawStars = (time: number) => {
            stars.forEach((star, index) => {
                star.age++
                
                // 更明显的移动，营造斗转星移的感觉
                star.x += star.vx * 0.8 + Math.sin(time * star.driftSpeed * 0.3) * 0.02
                star.y += star.vy * 0.8 + Math.cos(time * star.driftSpeed * 0.3) * 0.02
                
                // 边界检查
                if (star.x < -30 || star.x > canvas.width + 30 || 
                    star.y < -30 || star.y > canvas.height + 30 ||
                    star.age >= star.maxAge) {
                    stars[index] = createStar()
                    return
                }
                
                // 更明显的闪烁效果
                const slowTwinkle = Math.sin(time * star.twinkleSpeed * 0.8 + star.twinklePhase) * 0.6 + 0.4
                const breathe = Math.sin(time * star.twinkleSpeed * 0.4 + star.pulsePhase) * 0.4 + 0.6
                const fadeIn = Math.sin(time * star.twinkleSpeed * 0.2) * 0.3 + 0.7
                
                const ageRatio = 1 - (star.age / star.maxAge)
                const currentBrightness = star.baseBrightness * slowTwinkle * breathe * fadeIn * ageRatio
                
                // 降低最小亮度阈值，让更多星星可见
                if (currentBrightness < 0.05) return
                
                ctx.save()
                ctx.globalAlpha = currentBrightness * 0.9
                
                // 简单的萤火虫光点效果
                const drawFireflyGlow = (x: number, y: number, size: number, intensity: number) => {
                    // 外层光晕
                    const outerGlow = ctx.createRadialGradient(x, y, 0, x, y, size * 6)
                    outerGlow.addColorStop(0, star.color)
                    outerGlow.addColorStop(0.3, star.color + '80') // 50% 透明
                    outerGlow.addColorStop(0.6, star.color + '40') // 25% 透明
                    outerGlow.addColorStop(1, 'transparent')
                    
                    ctx.globalAlpha = intensity * 0.4
                    ctx.fillStyle = outerGlow
                    ctx.beginPath()
                    ctx.arc(x, y, size * 6, 0, Math.PI * 2)
                    ctx.fill()
                    
                    // 中层光晕
                    const middleGlow = ctx.createRadialGradient(x, y, 0, x, y, size * 3)
                    middleGlow.addColorStop(0, star.color)
                    middleGlow.addColorStop(0.5, star.color + '60') // 37% 透明
                    middleGlow.addColorStop(1, 'transparent')
                    
                    ctx.globalAlpha = intensity * 0.7
                    ctx.fillStyle = middleGlow
                    ctx.beginPath()
                    ctx.arc(x, y, size * 3, 0, Math.PI * 2)
                    ctx.fill()
                    
                    // 核心光点
                    ctx.globalAlpha = intensity * 0.9
                    ctx.fillStyle = star.color
                    ctx.beginPath()
                    ctx.arc(x, y, size * 0.8, 0, Math.PI * 2)
                    ctx.fill()
                    
                    // 最亮的中心点
                    if (intensity > 0.6) {
                        ctx.globalAlpha = intensity
                        ctx.fillStyle = '#FFFFFF'
                        ctx.beginPath()
                        ctx.arc(x, y, size * 0.3, 0, Math.PI * 2)
                        ctx.fill()
                    }
                }
                
                // 绘制萤火虫光点
                drawFireflyGlow(star.x, star.y, star.size, currentBrightness)
                
                ctx.restore()
            })
        }

        // 绘制流星
        const drawMeteors = () => {
            meteors.forEach((meteor, index) => {
                meteor.life++
                meteor.x += meteor.vx
                meteor.y += meteor.vy
                
                const lifeRatio = meteor.life / meteor.maxLife
                meteor.opacity = 1 - lifeRatio
                
                if (meteor.life >= meteor.maxLife || meteor.x < -150 || meteor.y > canvas.height + 100) {
                    meteors.splice(index, 1)
                    return
                }
                
                ctx.save()
                ctx.globalAlpha = meteor.opacity * 0.7
                
                // 金色流星尾迹
                const gradient = ctx.createLinearGradient(
                    meteor.x, meteor.y,
                    meteor.x - meteor.vx * meteor.length, meteor.y - meteor.vy * meteor.length
                )
                gradient.addColorStop(0, '#FFD700') // 金色头部
                gradient.addColorStop(0.3, '#FFA500') // 橙金色
                gradient.addColorStop(0.6, '#FFFF00') // 亮黄色
                gradient.addColorStop(0.8, '#F0E68C') // 卡其金色
                gradient.addColorStop(1, 'transparent')
                
                ctx.strokeStyle = gradient
                ctx.lineWidth = 3
                ctx.lineCap = 'round'
                
                ctx.beginPath()
                ctx.moveTo(meteor.x, meteor.y)
                ctx.lineTo(
                    meteor.x - meteor.vx * meteor.length, 
                    meteor.y - meteor.vy * meteor.length
                )
                ctx.stroke()
                
                // 流星头部
                ctx.fillStyle = '#FFD700'
                ctx.shadowColor = '#FFA500'
                ctx.shadowBlur = 10
                ctx.beginPath()
                ctx.arc(meteor.x, meteor.y, 2, 0, Math.PI * 2)
                ctx.fill()
                ctx.shadowBlur = 0
                
                ctx.restore()
            })
        }

        // 绘制星座连线
        const drawConstellations = () => {
            ctx.save()
            ctx.globalAlpha = 0.06
            ctx.strokeStyle = '#4169E1' // 皇家蓝连线
            ctx.lineWidth = 0.4
            
            const brightStars = stars.filter(star => star.baseBrightness > 0.6)
            
            for (let i = 0; i < brightStars.length; i++) {
                for (let j = i + 1; j < brightStars.length; j++) {
                    const dx = brightStars[i].x - brightStars[j].x
                    const dy = brightStars[i].y - brightStars[j].y
                    const distance = Math.sqrt(dx * dx + dy * dy)
                    
                    if (distance < 100 && Math.random() < 0.005) {
                        ctx.beginPath()
                        ctx.moveTo(brightStars[i].x, brightStars[i].y)
                        ctx.lineTo(brightStars[j].x, brightStars[j].y)
                        ctx.stroke()
                    }
                }
            }
            
            ctx.restore()
        }

        // 动画循环
        let animationId: number
        let time = 0
        
        const animate = () => {
            time += 0.016
            
            // 清除画布
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            
            // 绘制星座连线
            drawConstellations()
            
            // 绘制星星
            drawStars(time)
            
            // 绘制流星
            drawMeteors()
            
            // 随机创建流星
            meteorTimer++
            if (meteorTimer > 400 && Math.random() < 0.003) {
                createMeteor()
                meteorTimer = 0
            }
            
            // 保持星星数量
            if (stars.length < numStars && Math.random() < 0.01) {
                stars.push(createStar())
            }
            
            animationId = requestAnimationFrame(animate)
        }
        
        animate()

        // 窗口大小改变时重新调整
        const handleResize = () => {
            resizeCanvas()
            stars.forEach(star => {
                if (star.x > canvas.width + 30) star.x = -30
                if (star.y > canvas.height + 30) star.y = -30
                if (star.x < -30) star.x = canvas.width + 30
                if (star.y < -30) star.y = canvas.height + 30
            })
        }
        
        window.addEventListener("resize", handleResize)
        
        return () => {
            window.removeEventListener("resize", handleResize)
            cancelAnimationFrame(animationId)
        }
    }, [])

    return (
        <div className="fixed inset-0 z-0 pointer-events-none">
            {/* 紫偏蓝的深宇宙渐变背景 - 更深邃的宇宙感 */}
            <div 
                className="absolute inset-0" 
                style={{
                    background: 'linear-gradient(135deg, #1A0F3A 0%, #241540 25%, #0F0A1E 50%, #1C1444 75%, #050208 100%)'
                }}
            />
            
            {/* Canvas星空效果层 */}
            <canvas ref={canvasRef} className="absolute inset-0" style={{ zIndex: 1 }} />
        </div>
    )
} 