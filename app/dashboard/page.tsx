"use client";

import { useState } from "react";
import YiJiCalendar from "@/components/YiJiCalendar";
import AdaptiveLayout from "@/components/AdaptiveLayout";
import { Swords, Leaf, ChevronDown, ChevronUp, Star } from "lucide-react";
import { MAIN_STARS_INTERPRETATIONS } from "@/lib/data/main-stars";

const comparisonData = {
    title: "紫微斗数 vs 八字",
    icon: Swords,
    points: [
        {
            title: "核心理念",
            ziwei: "将人生模拟为微缩的宇宙或社会结构。",
            bazi: "将人生看作由五行构成的能量生态系统。",
        },
        {
            title: "分析侧重",
            ziwei: "空间性、结构性分析，精于细节描述，富有\"画面感\"。",
            bazi: "时间性、能量流转分析，善于判断格局高低与时机。",
        },
        {
            title: "好比是",
            ziwei: "一张详尽的人生CT扫描报告，看各领域具体状况。",
            bazi: "一份体能分析报告和未来天气预报，看宏观趋势与起伏。",
        },
    ]
}

const wuxingData = {
    title: "五行百科",
    icon: Leaf,
    elements: [
        {
            name: "木",
            color: "text-green-600",
            bgColor: "bg-green-50",
            borderColor: "border-green-200",
            nature: "木主仁，其性直，其质和。具有生长、升发、条达性质的事物均可归属于木。木曰「曲直」，曲为屈，直为伸，所以木有能屈能伸的特征，伸舒其条达之性，屈则还其柔和之质，木可纳水之气，树木的主干挺直向上生长，树枝曲折向外舒展，生长繁茂，随风招摇。",
            items: [
                {
                    type: "甲木",
                    description: "甲木为阳木，就像一棵大树雄壮坚硬，稳定可靠。甲木的人有惻隐之心，具向上学习心，做事有毅力，不屈不挠，正直不敷衍有责任感，有情有义愿意助人，也能体谅人。但较主观缺乏应变能力，欠缺敏捷及变通性，容易生气。",
                    verse: "《滴天髓》：甲木参天，脱胎要火，春不容金，秋不容土，火炽乘龙，水宕骑虎，地润天和，植立千古。"
                },
                {
                    type: "乙木",
                    description: "乙木为阴木，如同花草之木，柔韧曲折，富有同情心，性情和蔼，有美感，生存适应能力强，懂得灵活变通、顺势攀附而上，不会坚持己见，韧性超强。但易见风转舵较为现实，内心占有欲强，有心机，容易为了自身的利益伤害别人。",
                    verse: "《滴天髓》：乙木虽柔，刲羊解牛，怀丁抱丙，跨凤乘猴，虚湿之地，骑马亦忧，藤罗系甲，可春可秋。"
                }
            ]
        },
        {
            name: "火",
            color: "text-red-600",
            bgColor: "bg-red-50",
            borderColor: "border-red-200",
            nature: "火主礼，其性急，其质恭。具有温热、升腾性质的事物均可归属于火。火曰「炎上」，炎为热，上为向上。火在燃烧时能发光放热，火焰飘浮于上，光热四散于外，所以火有发热、向上的性质，有驱寒保温之功，锻炼金属之能。",
            items: [
                {
                    type: "丙火",
                    description: "丙火为阳火，如同太阳之火，充满向外放射的热能，心地光明、热情开朗、朝气蓬勃，积极进取，不会拘泥于琐事，豁达大气，善于社交，易得人好感。但做事容易急躁、冲动，缺乏耐性、喜怒无常，思考处理事情也比较欠缺智慧。",
                    verse: "《滴天髓》：丙火猛烈，欺霜侮雪。能锻庚金，逢辛反怯。土众成慈。水猖显节，虎马犬乡，甲来成灭。"
                },
                {
                    type: "丁火",
                    description: "丁火为阴火，就像灯火、炉火等人间之火，温暖体贴，内敛细腻，富有同情心，喜欢关注别人，情感丰富，思虑深远，富有创造力，好奇心也强烈，善于感受事物，对新事物很有浓厚兴趣，极富进取精神，善于沟通。但不善拒绝别人，凡事考虑犹豫不决而失去良机，易猜忌怀疑别人。",
                    verse: "《滴天髓》：丁火柔中，内性昭融，抱乙而孝，合壬而忠，旺而不烈，衰而不穷，如有嫡母，可秋可冬。"
                }
            ]
        },
        {
            name: "土",
            color: "text-amber-700",
            bgColor: "bg-amber-50",
            borderColor: "border-amber-200",
            nature: "土主信，其性重，其质厚。具有承载、生化、受纳性质的事物，均可归属于土。土曰「稼穡」，播种为稼，收获为穡，土有播种庄稼、收获五谷、生长万物的作用。引申为具有生长、承载、化生长养的特性。所以土载四方为万物之母。",
            items: [
                {
                    type: "戊土",
                    description: "戊土为阳土，如同堤坝、大地之土，为人诚实，坚定稳重，个性耿直豁达，乐天不擅修饰，有极强的忍耐力，乐于助人且谦逊低调，容易获得信任。不管做什么事，都将在巩固基础之后，才会慢慢花时间去进行，然后贯彻信念坚持到底。缺点就是容易任性、顽固，以自我为中心，欠缺通融性，不够积极主动。",
                    verse: "《滴天髓》：戊土固重，既中且正，静翕动辟，万物司命，水润物生，火燥物病，若在艮坤，怕冲宜静。"
                },
                {
                    type: "己土",
                    description: "己土为阴土，如同田园土，理解能力强，吸收快，行事循规蹈矩，重视内涵，多才多艺，细心周到勤奋努力，包容性强且做事有弹性，愿意为旁人付出，敦厚有爱心。缺点是内心较复杂矛盾、心思较不易集中且过于保守，没有主见，容易心软、耳根软、心软，容易被他人左右利用。",
                    verse: "《滴天髓》：己土卑湿，中正蓄藏，不愁木盛，不畏水狂，火少火晦，金多金光，若要物旺，宜助宜帮。"
                }
            ]
        },
        {
            name: "金",
            color: "text-yellow-600",
            bgColor: "bg-yellow-50",
            borderColor: "border-yellow-200",
            nature: "金主义，其性刚，其质烈。具有清洁、肃杀、收敛性质的事物均可归属于金。金曰「从革」，从为顺从、服从，是金的「柔和」特性的体现；革为变革、改革，是金的「刚强」之性的表达。",
            items: [
                {
                    type: "庚金",
                    description: "庚金为阳金，如同刀剑矿石，性质坚硬。精神粗犷豪爽、轻躁，性情刚烈而重义气，积极果断，富有正义感，不虚伪、善于表现，口才善辩，热心亲切人缘佳，容易相处。但其个性好胜，刚毅不服输，具有破坏性，率直易得罪人，易与人冲突，自我表现欲强，粗率不细心。",
                    verse: "《滴天髓》：庚金带煞，刚健为最，得水而清，得火而锐，土润则生，土干则脆，能赢甲兄，输于乙妹。"
                },
                {
                    type: "辛金",
                    description: "辛金为阴金，如同珠玉宝石，辛金人个性较阴沉，温润秀气，自带优雅贵气，很重视外表，自我要求高。重感情，对事很敏感细腻，为人亲切有同情心，人际关系好但善恶分明。缺点是虚荣心强，爱面子，任性娇气，有强烈的自尊心，但缺乏坚强的意志，重视物质欲望，容易被金钱物质所引诱。",
                    verse: "《滴天髓》：辛金软弱，温润而清，畏土之叠，乐水之盈，能扶社稷，能救生灵，热则喜母，寒则喜丁。"
                }
            ]
        },
        {
            name: "水",
            color: "text-blue-600",
            bgColor: "bg-blue-50",
            borderColor: "border-blue-200",
            nature: "水主智，其性聪，其质善。具有寒凉、滋润、向下的性质的事物均可属于水。水曰「润下」，润为湿润，下为向下，所以水具有滋润寒凉、性质柔顺、流动趋下的特性。",
            items: [
                {
                    type: "壬水",
                    description: "壬水为阳水，就像江河之水，奔天涛地，势不可挡。率性自由，悠闲而乐观，能潜伏和包容，有勇气、聪明才智和领导力，且具备洞察力和理解能力。因水为流动不息，这代表了壬水的多变和适应性，他们能适应各种环境和变化，不易被困在固定的模式中。虽圆融但稍有任性，易偷懒怠惰而生懈怠，对事不易坚持而虎头蛇尾，依赖性强，容易漫不经心。",
                    verse: "《滴天髓》：壬水通河，能泄金气，则中之德，周流不滞，通根透癸，冲天奔地，化则有情，从则相济。"
                },
                {
                    type: "癸水",
                    description: "癸水为阴水，如同雨露之水。具有深思熟虑和灵活变通的能力。他们对周遭环境敏感细腻，能捕捉到微细的变化并对美有独特的欣赏力，注重生活情绪和感觉。面对困难，他们能保持冷静理智，以事实和逻辑引导行为。他们的风格低调谦和，友善待人且乐于助人，不炫耀而内心充实。但有不务实际，内心常蓄不平，敏感易悲观，喜钻牛角尖的倾向。",
                    verse: "《滴天髓》：癸水至弱，达于天津，得龙而运，功化斯神，不愁火土，不论庚辛，合戊见火，化象斯真。"
                }
            ]
        }
    ]
}

const ziweiStarsData = {
    title: "紫微十四星",
    icon: Star,
    description: "紫微斗数中的十四颗主星，每颗星都有其独特的性格特质和人生使命，代表着不同的人格原型和命运走向。",
    stars: Object.entries(MAIN_STARS_INTERPRETATIONS).map(([key, star]) => ({
        name: star.name,
        character: star.character,
        title: star.title,
        description: star.description,
        element: getStarElement(key),
        category: getStarCategory(key)
    }))
}

// 获取星曜五行属性的辅助函数
function getStarElement(starName: string): string {
    const elementMap: Record<string, string> = {
        '紫微': '土',
        '天机': '木', 
        '太阳': '火',
        '武曲': '金',
        '天同': '水',
        '廉贞': '火',
        '天府': '土',
        '太阴': '水',
        '贪狼': '木',
        '巨门': '水',
        '天相': '水',
        '天梁': '土',
        '七杀': '金',
        '破军': '水'
    };
    return elementMap[starName] || '未知';
}

// 获取星曜类别的辅助函数
function getStarCategory(starName: string): string {
    const categoryMap: Record<string, string> = {
        '紫微': '北斗',
        '贪狼': '北斗',
        '武曲': '北斗',
        '巨门': '北斗',
        '廉贞': '北斗',
        '破军': '北斗',
        '天府': '南斗',
        '天机': '南斗',
        '天相': '南斗',
        '天梁': '南斗',
        '天同': '南斗',
        '七杀': '南斗',
        '太阳': '中天',
        '太阴': '中天'
    };
    return categoryMap[starName] || '未知';
}

// 获取五行颜色样式的辅助函数
function getElementColor(element: string): string {
    const colorMap: Record<string, string> = {
        '木': 'bg-green-100 dark:bg-emerald-900/40 text-green-700 dark:text-emerald-300',
        '火': 'bg-red-100 dark:bg-rose-900/40 text-red-700 dark:text-rose-300',
        '土': 'bg-stone-100 dark:bg-stone-900/40 text-stone-700 dark:text-stone-300',
        '金': 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300',
        '水': 'bg-blue-100 dark:bg-sky-900/40 text-blue-700 dark:text-sky-300',
        '未知': 'bg-gray-100 dark:bg-slate-600 text-gray-700 dark:text-slate-300'
    };
    return colorMap[element] || colorMap['未知'];
}

export default function DashboardPage() {
    const [calendarCollapsed, setCalendarCollapsed] = useState(false);
    const [comparisonCollapsed, setComparisonCollapsed] = useState(false);
    const [wuxingCollapsed, setWuxingCollapsed] = useState(false);
    const [ziweiStarsCollapsed, setZiweiStarsCollapsed] = useState(false);

    return (
        <AdaptiveLayout>
            <div className="p-3 lg:p-6">
                <div className="max-w-6xl mx-auto space-y-4">
                    {/* Perpetual Calendar */}
                    <div id="perpetual-calendar" className="bg-card dark:bg-slate-800/60 rounded-lg border border-border dark:border-slate-700">
                        <div 
                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent/5 dark:hover:bg-slate-700/30 transition-colors"
                            onClick={() => setCalendarCollapsed(!calendarCollapsed)}
                        >
                            <h2 className="text-xl font-bold text-primary dark:text-amber-400 font-noto">万年历</h2>
                            {calendarCollapsed ? <ChevronDown className="w-5 h-5 dark:text-slate-400" /> : <ChevronUp className="w-5 h-5 dark:text-slate-400" />}
                        </div>
                        {!calendarCollapsed && (
                            <div className="px-4 pb-4">
                                <YiJiCalendar />
                            </div>
                        )}
                    </div>

                    {/* Comparison Card */}
                    <div id="ziwei-vs-bazi" className="bg-card dark:bg-slate-800/60 rounded-lg border border-border dark:border-slate-700">
                        <div 
                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent/5 dark:hover:bg-slate-700/30 transition-colors"
                            onClick={() => setComparisonCollapsed(!comparisonCollapsed)}
                        >
                            <h2 className="text-xl font-bold text-primary dark:text-amber-400 font-noto flex items-center">
                                <comparisonData.icon className="w-5 h-5 mr-3" />
                                {comparisonData.title}
                            </h2>
                            {comparisonCollapsed ? <ChevronDown className="w-5 h-5 dark:text-slate-400" /> : <ChevronUp className="w-5 h-5 dark:text-slate-400" />}
                        </div>
                        {!comparisonCollapsed && (
                            <div className="px-4 pb-4">
                                <div className="space-y-6">
                                    {comparisonData.points.map((point, index) => (
                                        <div key={index}>
                                            {/* 标题 */}
                                            <div className="mb-3">
                                                <h3 className="font-semibold text-primary dark:text-amber-400 text-base">{point.title}</h3>
                                            </div>
                                            {/* 桌面端：横向布局 */}
                                            <div className="hidden md:grid md:grid-cols-2 gap-4">
                                                <div className="bg-background dark:bg-slate-700/60 p-4 rounded-md border border-border dark:border-slate-600">
                                                    <p className="font-bold text-primary/80 dark:text-amber-400 text-sm mb-2">紫微</p>
                                                    <p className="text-sm text-muted-foreground dark:text-slate-300 leading-relaxed">{point.ziwei}</p>
                                                </div>
                                                <div className="bg-background dark:bg-slate-700/60 p-4 rounded-md border border-border dark:border-slate-600">
                                                    <p className="font-bold text-primary/80 dark:text-amber-400 text-sm mb-2">八字</p>
                                                    <p className="text-sm text-muted-foreground dark:text-slate-300 leading-relaxed">{point.bazi}</p>
                                                </div>
                                            </div>
                                            {/* 移动端：紧凑布局 */}
                                            <div className="md:hidden grid grid-cols-2 gap-3">
                                                <div className="bg-background dark:bg-slate-700/60 p-3 rounded-md border border-border dark:border-slate-600">
                                                    <p className="font-bold text-primary/80 dark:text-amber-400 text-xs mb-1">紫微</p>
                                                    <p className="text-xs text-muted-foreground dark:text-slate-300 leading-relaxed">{point.ziwei}</p>
                                                </div>
                                                <div className="bg-background dark:bg-slate-700/60 p-3 rounded-md border border-border dark:border-slate-600">
                                                    <p className="font-bold text-primary/80 dark:text-amber-400 text-xs mb-1">八字</p>
                                                    <p className="text-xs text-muted-foreground dark:text-slate-300 leading-relaxed">{point.bazi}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Five Elements Encyclopedia */}
                    <div id="wuxing-encyclopedia" className="bg-card dark:bg-slate-800/60 rounded-lg border border-border dark:border-slate-700">
                        <div 
                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent/5 dark:hover:bg-slate-700/30 transition-colors"
                            onClick={() => setWuxingCollapsed(!wuxingCollapsed)}
                        >
                            <h2 className="text-xl font-bold text-primary dark:text-amber-400 font-noto">五行百科</h2>
                            {wuxingCollapsed ? <ChevronDown className="w-5 h-5 dark:text-slate-400" /> : <ChevronUp className="w-5 h-5 dark:text-slate-400" />}
                        </div>
                        {!wuxingCollapsed && (
                            <div className="px-4 pb-4">
                                <div className="space-y-6">
                                    {wuxingData.elements.map((element, index) => (
                                        <div key={index} className={`p-4 rounded-lg border ${element.borderColor} dark:border-slate-600 ${element.bgColor} dark:bg-slate-700/40`}>
                                            <h3 className={`text-xl font-bold ${element.color} dark:text-amber-400 mb-3`}>{element.name}</h3>
                                            <p className="text-sm text-muted-foreground dark:text-slate-300 leading-relaxed mb-4 font-medium">{element.nature}</p>
                                            
                                            {/* 阴阳天干详细解释 */}
                                            <div className="space-y-4">
                                                {element.items.map((item, idx) => (
                                                    <div key={idx} className="border-l-4 border-gray-300 dark:border-slate-500 pl-4">
                                                        <div className="mb-2">
                                                            <span className={`inline-block px-3 py-1 text-sm font-bold rounded-full ${element.color} dark:text-amber-400 ${element.bgColor} dark:bg-slate-600/60 border ${element.borderColor} dark:border-slate-500 mr-2`}>
                                                                {item.type}
                                                            </span>
                                                        </div>
                                                        <div className="mb-2">
                                                            <p className="text-xs italic text-muted-foreground dark:text-slate-400 leading-relaxed">{item.verse}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-muted-foreground dark:text-slate-300 leading-relaxed">{item.description}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Ziwei Fourteen Stars */}
                    <div id="ziwei-fourteen-stars" className="bg-card dark:bg-slate-800/60 rounded-lg border border-border dark:border-slate-700">
                        <div 
                            className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent/5 dark:hover:bg-slate-700/30 transition-colors"
                            onClick={() => setZiweiStarsCollapsed(!ziweiStarsCollapsed)}
                        >
                            <h2 className="text-xl font-bold text-primary dark:text-amber-400 font-noto flex items-center">
                                <ziweiStarsData.icon className="w-5 h-5 mr-3" />
                                {ziweiStarsData.title}
                            </h2>
                            {ziweiStarsCollapsed ? <ChevronDown className="w-5 h-5 dark:text-slate-400" /> : <ChevronUp className="w-5 h-5 dark:text-slate-400" />}
                        </div>
                        {!ziweiStarsCollapsed && (
                            <div className="px-4 pb-4">
                                {/* 描述文字 */}
                                <div className="mb-6">
                                    <p className="text-sm text-muted-foreground dark:text-slate-300 leading-relaxed">{ziweiStarsData.description}</p>
                                </div>
                                
                                {/* 星曜按类别分组 */}
                                <div className="space-y-6">
                                    {['北斗', '南斗', '中天'].map((category) => {
                                        const categoryStars = ziweiStarsData.stars.filter(star => star.category === category);
                                        return (
                                            <div key={category} className="space-y-4">
                                                <h3 className="text-lg font-semibold text-primary dark:text-amber-400 border-b border-border dark:border-slate-600 pb-2">
                                                    {category}星系
                                                </h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                    {categoryStars.map((star, index) => (
                                                        <div key={index} className="p-4 rounded-lg border border-border dark:border-slate-600 bg-background dark:bg-slate-700/40 hover:shadow-md transition-shadow">
                                                            {/* 星名和标签 */}
                                                            <div className="flex items-center justify-between mb-3">
                                                                <h4 className="text-lg font-bold text-primary dark:text-amber-400">{star.name.replace('星', '')}</h4>
                                                                <div className="flex gap-2">
                                                                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${getElementColor(star.element)}`}>
                                                                        {star.element}行
                                                                    </span>
                                                                    <span className="px-2 py-1 text-xs rounded-full font-medium bg-gray-100 dark:bg-slate-600 text-gray-700 dark:text-slate-300">
                                                                        {star.category}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            
                                                            {/* 神职 */}
                                                            <div className="mb-3">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-2 py-1 rounded">神职</span>
                                                                    <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">{star.title}</span>
                                                                </div>
                                                            </div>
                                                            
                                                            {/* 化身人物 */}
                                                            <div className="mb-3">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">化身</span>
                                                                    <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">{star.character}</span>
                                                                </div>
                                                            </div>
                                                            
                                                            {/* 性格特质 */}
                                                            <div className="border-t border-border dark:border-slate-600 pt-3">
                                                                <div className="mb-2">
                                                                    <span className="text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 px-2 py-1 rounded">性格特质</span>
                                                                </div>
                                                                <p className="text-sm text-muted-foreground dark:text-slate-300 leading-relaxed">{star.description}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AdaptiveLayout>
    );
}