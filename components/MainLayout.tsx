"use client"

import { useState } from "react"
import { Menu, X, Link as LinkIcon } from "lucide-react"
import { Button } from "./ui/button"
import Link from "next/link"
import Logo from "./Logo"
import Background from "./Background"
import ZoomableLayout from "./ZoomableLayout"
import { FaTwitter, FaDiscord } from 'react-icons/fa'

const NavLinks = ({ t, setMobileMenuOpen }: { t: any, setMobileMenuOpen?: (open: boolean) => void }) => (
    <>
        {Object.entries(t.nav)
            .filter(([key]) => key !== 'login') // 排除login项，只在右边按钮显示
            .map(([key, value]) => {
                // docs链接指向外部GitBook
                if (key === 'docs') {
                    return (
                        <a
                            key={key}
                            href="https://metaport.gitbook.io/astrozi-whitepaper/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-slate-200 hover:text-yellow-400 transition-all duration-200 relative group font-medium hover:transform hover:-translate-y-0.5"
                            onClick={() => setMobileMenuOpen && setMobileMenuOpen(false)}
                        >
                            {value as string}
                            <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-400 transition-all duration-300 group-hover:w-full"></div>
                        </a>
                    )
                }
                // 其他链接使用锚点
                return (
                    <a
                        key={key}
                        href={`#${key}`}
                        className="text-slate-200 hover:text-yellow-400 transition-all duration-200 relative group font-medium hover:transform hover:-translate-y-0.5"
                        onClick={() => setMobileMenuOpen && setMobileMenuOpen(false)}
                    >
                        {value as string}
                        <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-yellow-400 transition-all duration-300 group-hover:w-full"></div>
                    </a>
                )
            })}

    </>
)

interface MainLayoutProps {
  children: React.ReactNode;
  language: "zh" | "ja" | "en";
  setLanguage: (language: "zh" | "ja" | "en") => void;
  t: any;
}

export default function MainLayout({ children, language, setLanguage, t }: MainLayoutProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const loginHref = language === "en" ? "/en/login" : language === "ja" ? "/ja/login" : "/login"

    return (
        <div className="relative min-h-screen">
            {/* 紫金宇宙星空背景 */}
            <Background />
            
            {/* 缩放容器包装整个内容 */}
            <ZoomableLayout 
                className="relative z-10 min-h-screen bg-transparent"
                showZoomControl={true}
                zoomControlPosition="bottom-right"
                enableKeyboardShortcuts={true}
                onlyDesktop={true}
            >
                {/* 内容容器 */}
                <div className="min-h-screen bg-transparent">
                <nav className="relative z-50 p-6 flex justify-between items-center bg-white/5 backdrop-blur-md border-b border-white/10 shadow-lg">
                    <div className="flex items-center space-x-3">
                        <Logo size={64} variant="landing" />
                        <span className="text-2xl font-bold text-yellow-400 tracking-wider font-rajdhani">ASTROZI</span>
                    </div>

                    <div className="hidden md:flex items-center space-x-8 absolute left-1/2 transform -translate-x-1/2">
                       <NavLinks t={t} />
                    </div>

                    <div className="hidden md:flex items-center space-x-4">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => {
                                if (language === "zh") {
                                    setLanguage("ja");
                                } else if (language === "ja") {
                                    setLanguage("en");
                                } else {
                                    setLanguage("zh");
                                }
                            }} 
                            className="border-white/30 text-slate-200 hover:bg-white/10 hover:text-yellow-400 bg-transparent"
                        >
                            {language === "zh" ? "日本語" : language === "ja" ? "EN" : "中文"}
                        </Button>
                        {language === "en" ? (
                            <Link href="/en/login">
                                <Button className="relative px-6 py-2 bg-gradient-to-r from-[#FBCB0A] to-yellow-500 hover:from-yellow-400 hover:to-[#FBCB0A] text-[#3D0B5B] font-semibold rounded-xl border border-[#FBCB0A]/30 hover:border-[#FBCB0A] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(251,203,10,0.4)] overflow-hidden group">
                                    <span className="relative z-10 flex items-center gap-2">
                                        <LinkIcon className="w-4 h-4" />
                                        {t.nav.login}
                                    </span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#FBCB0A]/20 to-yellow-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </Button>
                            </Link>
                        ) : (
                            <Link href={loginHref}>
                                <Button className="relative px-6 py-2 bg-gradient-to-r from-[#FBCB0A] to-yellow-500 hover:from-yellow-400 hover:to-[#FBCB0A] text-[#3D0B5B] font-semibold rounded-xl border border-[#FBCB0A]/30 hover:border-[#FBCB0A] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(251,203,10,0.4)] overflow-hidden group">
                                    <span className="relative z-10">{t.nav.login}</span>
                                    <div className="absolute inset-0 bg-gradient-to-r from-[#FBCB0A]/20 to-yellow-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </Button>
                            </Link>
                        )}
                    </div>

                    <div className="md:hidden">
                        <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-200">
                            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </Button>
                    </div>
                </nav>

                {mobileMenuOpen && (
                    <div className="fixed inset-0 z-40 md:hidden">
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)}></div>
                        <div className="fixed top-0 right-0 w-64 h-full bg-white/10 backdrop-blur-md p-6 shadow-2xl border-l border-white/20">
                            <div className="flex flex-col space-y-6 mt-16">
                               <NavLinks t={t} setMobileMenuOpen={setMobileMenuOpen} />
                                <Button variant="outline" onClick={() => { setLanguage(language === "zh" ? "en" : "zh"); setMobileMenuOpen(false); }} className="border-white/30 text-slate-200 hover:bg-white/10 bg-transparent">
                                    {language === "zh" ? "English" : "中文"}
                                </Button>
                                {language === "en" ? (
                                    <Link href="/en/login">
                                        <Button className="relative w-full px-6 py-3 bg-gradient-to-r from-[#FBCB0A] to-yellow-500 hover:from-yellow-400 hover:to-[#FBCB0A] text-[#3D0B5B] font-semibold rounded-xl border border-[#FBCB0A]/30 hover:border-[#FBCB0A] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(251,203,10,0.4)] overflow-hidden group" onClick={() => setMobileMenuOpen(false)}>
                                            <span className="relative z-10 flex items-center justify-center gap-2">
                                                <LinkIcon className="w-4 h-4" />
                                                {t.nav.login}
                                            </span>
                                            <div className="absolute inset-0 bg-gradient-to-r from-[#FBCB0A]/20 to-yellow-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        </Button>
                                    </Link>
                                ) : (
                                    <Link href={loginHref}>
                                        <Button className="relative w-full px-6 py-3 bg-gradient-to-r from-[#FBCB0A] to-yellow-500 hover:from-yellow-400 hover:to-[#FBCB0A] text-[#3D0B5B] font-semibold rounded-xl border border-[#FBCB0A]/30 hover:border-[#FBCB0A] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(251,203,10,0.4)] overflow-hidden group" onClick={() => setMobileMenuOpen(false)}>
                                            <span className="relative z-10">{t.nav.login}</span>
                                            <div className="absolute inset-0 bg-gradient-to-r from-[#FBCB0A]/20 to-yellow-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <main className="relative bg-transparent">{children}</main>

                <footer className="relative z-20 py-12 px-6 border-t border-white/10 bg-white/5 backdrop-blur-md">
                    <div className="max-w-6xl mx-auto">
                        {/* Supabase-style navigation: Logo left, Links right */}
                        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-12">
                            {/* Left: Logo and Tagline */}
                            <div className="flex items-center space-x-3">
                                <Logo size={48} variant="landing" />
                                <div>
                                    <span className="text-xl font-bold text-yellow-400 tracking-wider font-rajdhani block">ASTROZI</span>
                                    <p className="text-sm text-gray-300 mt-1">
                                        {language === "zh" ? "科技赋能命理，智慧照亮未来" : "Technology Empowers Destiny, Wisdom Illuminates Future"}
                                    </p>
                                </div>
                            </div>

                            {/* Right: Navigation Links */}
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
                                {/* Products */}
                                <div>
                                    <h3 className="text-yellow-400 font-semibold font-rajdhani mb-4">
                                        {language === "zh" ? "产品" : "Products"}
                                    </h3>
                                    <ul className="space-y-2">
                                        <li>
                                            <Link href={language === "zh" ? "/bazi" : "/en/bazi"} className="text-slate-300 hover:text-yellow-400 transition-colors duration-200 text-sm">
                                                {language === "zh" ? "八字分析" : "BaZi Analysis"}
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href={language === "zh" ? "/ziwei" : "/en/ziwei"} className="text-slate-300 hover:text-yellow-400 transition-colors duration-200 text-sm">
                                                {language === "zh" ? "紫微斗数" : "ZiWei Analysis"}
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href={language === "zh" ? "/home" : "/en/home"} className="text-slate-300 hover:text-yellow-400 transition-colors duration-200 text-sm">
                                                {language === "zh" ? "每日签到" : "Daily Check-in"}
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href={language === "zh" ? "/wiki" : "/en/wiki"} className="text-slate-300 hover:text-yellow-400 transition-colors duration-200 text-sm">
                                                {language === "zh" ? "知识库" : "Wiki"}
                                            </Link>
                                        </li>
                                    </ul>
                                </div>

                                {/* Support */}
                                <div>
                                    <h3 className="text-yellow-400 font-semibold font-rajdhani mb-4">
                                        {language === "zh" ? "支持" : "Support"}
                                    </h3>
                                    <ul className="space-y-2">
                                        <li>
                                            <Link href={language === "zh" ? "/subscription" : "/en/subscription"} className="text-slate-300 hover:text-yellow-400 transition-colors duration-200 text-sm">
                                                {language === "zh" ? "价格" : "Pricing"}
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href={language === "zh" ? "/faq" : "/en/faq"} className="text-slate-300 hover:text-yellow-400 transition-colors duration-200 text-sm">
                                                {language === "zh" ? "常见问题" : "FAQ"}
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href={language === "zh" ? "/guide" : "/en/wallet-guide"} className="text-slate-300 hover:text-yellow-400 transition-colors duration-200 text-sm">
                                                {language === "zh" ? "使用指南" : "Wallet Guide"}
                                            </Link>
                                        </li>
                                    </ul>
                                </div>

                                {/* Company */}
                                <div>
                                    <h3 className="text-yellow-400 font-semibold font-rajdhani mb-4">
                                        {language === "zh" ? "公司" : "Company"}
                                    </h3>
                                    <ul className="space-y-2">
                                        <li>
                                            <Link href="/about" className="text-slate-300 hover:text-yellow-400 transition-colors duration-200 text-sm">
                                                {language === "zh" ? "关于我们" : "About"}
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="/contact" className="text-slate-300 hover:text-yellow-400 transition-colors duration-200 text-sm">
                                                {language === "zh" ? "联系我们" : "Contact"}
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="/blog" className="text-slate-300 hover:text-yellow-400 transition-colors duration-200 text-sm">
                                                {language === "zh" ? "博客" : "Blog"}
                                            </Link>
                                        </li>
                                    </ul>
                                </div>

                                {/* Docs */}
                                <div>
                                    <h3 className="text-yellow-400 font-semibold font-rajdhani mb-4">
                                        {language === "zh" ? "文档" : "Docs"}
                                    </h3>
                                    <ul className="space-y-2">
                                        <li>
                                            <a 
                                                href="https://metaport.gitbook.io/astrozi-whitepaper/" 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-slate-300 hover:text-yellow-400 transition-colors duration-200 text-sm"
                                            >
                                                {language === "zh" ? "白皮书" : "Whitepaper"}
                                            </a>
                                        </li>
                                        <li>
                                            <Link href={language === "zh" ? "/wiki" : "/en/wiki"} className="text-slate-300 hover:text-yellow-400 transition-colors duration-200 text-sm">
                                                {language === "zh" ? "技术文档" : "Technical Docs"}
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href={language === "zh" ? "/faq" : "/en/faq"} className="text-slate-300 hover:text-yellow-400 transition-colors duration-200 text-sm">
                                                {language === "zh" ? "开发者指南" : "Developer Guide"}
                                            </Link>
                                        </li>
                                    </ul>
                                </div>

                                {/* Legal */}
                                <div>
                                    <h3 className="text-yellow-400 font-semibold font-rajdhani mb-4">
                                        {language === "zh" ? "法律" : "Legal"}
                                    </h3>
                                    <ul className="space-y-2">
                                        <li>
                                            <Link href={language === "zh" ? "/landing-privacy-policy" : "/en/landing-privacy-policy"} className="text-slate-300 hover:text-yellow-400 transition-colors duration-200 text-sm">
                                                {language === "zh" ? "隐私政策" : "Privacy Policy"}
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href={language === "zh" ? "/landing-service-agreement" : "/en/landing-service-agreement"} className="text-slate-300 hover:text-yellow-400 transition-colors duration-200 text-sm">
                                                {language === "zh" ? "服务协议" : "Terms of Service"}
                                            </Link>
                                        </li>
                                        <li>
                                            <Link href="/cookies" className="text-slate-300 hover:text-yellow-400 transition-colors duration-200 text-sm">
                                                {language === "zh" ? "Cookie政策" : "Cookies"}
                                            </Link>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Disclaimer Section */}
                        <div className="border-t border-white/10 pt-8 mb-6">
                            <div className="bg-amber-50/5 dark:bg-amber-900/10 border border-amber-200/20 dark:border-amber-800/20 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <div className="text-amber-400 mt-0.5">⚠️</div>
                                    <div>
                                        <h4 className="font-semibold text-amber-300 mb-2 text-sm">
                                            {language === "zh" ? "免责声明" : "Disclaimer"}
                                        </h4>
                                        <p className="text-amber-200/80 text-xs leading-relaxed">
                                            {language === "zh" ? 
                                                "本网站仅为学习和娱乐目的分享信息。此处的任何建议仅为建议，不应成为您决策的唯一指导。您的未来掌握在您手中，是您的选择和行动塑造了它。请明智地运用您的判断力，并就重大决定咨询专家。" :
                                                "This website shares information for learning and entertainment purposes only. Any advice here is just a suggestion and shouldn't be your sole guide for decisions. Your future rests in your hands, and it is your choices and actions that sculpt it. Use your judgment wisely and consult experts for major decisions."
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Social Media and Copyright */}
                        <div className="border-t border-white/10 pt-6">
                            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                                {/* Social Media Links */}
                                <div className="flex items-center space-x-4">
                                    <a href="https://twitter.com/astrozi" target="_blank" rel="noopener noreferrer" 
                                       className="text-slate-400 hover:text-yellow-400 transition-colors duration-200">
                                        <FaTwitter size={20} />
                                    </a>
                                    <a href="https://discord.gg/astrozi" target="_blank" rel="noopener noreferrer"
                                       className="text-slate-400 hover:text-yellow-400 transition-colors duration-200">
                                        <FaDiscord size={20} />
                                    </a>
                                </div>

                                {/* Copyright */}
                                <div className="text-center md:text-right">
                                    <p className="text-slate-400 text-sm">
                                        © 2024 ASTROZI. {language === "zh" ? "保留所有权利" : "All rights reserved"}.
                                    </p>
                                    <p className="text-yellow-400/60 text-xs mt-1">Since 2024</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </footer>
                </div>
            </ZoomableLayout>
        </div>
    )
} 
