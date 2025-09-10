export interface TianganPersonalityEn {
  emoji: string;
  title: string;
  description: string;
  advice: string;
  symbol: string;
  traits: string[];
  humanImage: string;
  ditiansuiVerse: string;
}

export const tianganPersonalitiesEn: Record<string, TianganPersonalityEn> = {
  '甲': {
    emoji: '🌳',
    title: 'Jia Wood · Forest Backbone',
    description: 'I am like a towering tree, deeply rooted yet reaching for the sky. Others call me stubborn, but I simply have strong principles—I would rather break than bend. Friends know that when I make a promise, it becomes a mountain that neither wind nor rain can shake.',
    advice: 'Don\'t try to change their core values; supporting their wood nature is more effective.',
    symbol: 'Towering Tree',
    traits: ['Resilient', 'Leadership', 'Responsible', 'Idealistic'],
    humanImage: 'Like a pillar in the forest, supporting others while needing soil nourishment.',
    ditiansuiVerse: '甲木参天，脱胎要火，春不容金，秋不容土，火炽乘龙，水宕骑虎，地润天和，植立千古。'
  },
  '乙': {
    emoji: '🌿',
    title: 'Yi Wood · Vine Flexibility',
    description: 'I am flexible wood, like a vine that bends gracefully. When facing obstacles, I don\'t clash head-on but elegantly find a way around, eventually reaching my destination. Friends say I\'m changeable, but I\'m actually highly adaptable.',
    advice: 'Don\'t be fooled by their quiet exterior; take initiative to open their heart.',
    symbol: 'Vines and Flowers',
    traits: ['Flexible', 'Aesthetic', 'Understanding', 'Sensitive'],
    humanImage: 'Like garden plants, beautiful yet needing support (metal trimming) to take shape.',
    ditiansuiVerse: '乙木虽柔，刲羊解牛，怀丁抱丙，跨凤乘猴，虚湿之地，骑马亦忧，藤罗系甲，可春可秋。'
  },
  '丙': {
    emoji: '☀️',
    title: 'Bing Fire · Sun\'s Enthusiasm',
    description: 'I am a walking little sun, bringing light and warmth wherever I go. At gatherings, I\'m the mood maker; at work, I\'m the "no problem, I\'ll handle it" person. Sometimes my enthusiasm is overwhelming and I\'m called meddlesome, but seeing everyone happy makes me content.',
    advice: 'Give them a stage to shine and express themselves, but remind them to mind their boundaries.',
    symbol: 'Sun and Fire',
    traits: ['Enthusiastic', 'Proactive', 'Helpful', 'Impulsive'],
    humanImage: 'Like the noon sun, illuminating all while needing clouds (water) for balance.',
    ditiansuiVerse: '丙火猛烈，欺霜侮雪，能锻庚金，逢辛反怯，土众成慈，水猖显节，虎马犬乡，甲来成灭。'
  },
  '丁': {
    emoji: '🕯️',
    title: 'Ding Fire · Candle\'s Warmth',
    description: 'I am like a candle in the night, not flashy but very warm. Friends call me their confidant, always providing just the right care when they need it. My warmth is gentle and lasting, like a slow-cooked soup.',
    advice: 'Cherish their delicate emotional expressions; that\'s genuine thoughtfulness.',
    symbol: 'Candle Light',
    traits: ['Gentle', 'Emotionally Rich', 'Good Listener', 'Melancholic'],
    humanImage: 'Like a night lamp, lighting others while needing oil (wood) for sustenance.',
    ditiansuiVerse: '丁火柔中，内性昭融，抱乙而孝，合壬而忠，旺而不烈，衰而不穷，如有嫡母，可秋可冬。'
  },
  '戊': {
    emoji: '🏔️',
    title: 'Wu Earth · Mountain\'s Stability',
    description: 'I am the mountain that gives people security. Friends always rely on me—for loans, for listening, for moving help. I\'m not good with words but strong in action; keeping promises is my motto.',
    advice: 'Don\'t rush their decisions; given time, they\'ll provide the most stable solution.',
    symbol: 'High Mountains',
    traits: ['Stable', 'Tolerant', 'Reliable', 'Not Expressive'],
    humanImage: 'Like a solid mountain, supporting all while needing rain (water) for nourishment.',
    ditiansuiVerse: '戊土固重，既中且正，静翕动辟，万物司命，水润物生，火燥物病，若在艮坤，怕冲宜静。'
  },
  '己': {
    emoji: '🌱',
    title: 'Ji Earth · Garden\'s Tolerance',
    description: 'I am like fertile soil where any seed can sprout. Friends\' secrets, troubles, and joys—I silently absorb and share them all. Sometimes I feel like an emotional trash can, but seeing everyone well makes me satisfied.',
    advice: 'Pay attention to their emotional needs; give timely affirmation and praise.',
    symbol: 'Fertile Soil',
    traits: ['Gentle', 'Understanding', 'Self-sacrificing', 'Indecisive'],
    humanImage: 'Like fertile farmland, nurturing all while needing sunlight (fire) for illumination.',
    ditiansuiVerse: '己土卑湿，中正蓄藏，不愁木盛，不畏水狂，火少火晦，金多金光，若要物旺，宜助宜帮。'
  },
  '庚': {
    emoji: '⚔️',
    title: 'Geng Metal · Blade\'s Directness',
    description: 'My words are like an unsheathed sword—they may hurt but never deceive. I prefer confronting issues head-on; beating around the bush is more painful than killing me. Though often called stubborn, I\'m most reliable in crises—like a fire axe, breaking doors to save lives efficiently.',
    advice: 'Accept their thorny sincerity; that\'s their unique form of tenderness.',
    symbol: 'Sword and Metal',
    traits: ['Resolute', 'Principled', 'Decisive', 'Seemingly Cold'],
    humanImage: 'Like a sharp blade, cutting through chaos while needing a sheath (water) for containment.',
    ditiansuiVerse: '庚金带煞，刚健为最，得水而清，得火而锐，土润则生，土干则脆，能赢甲兄，输于乙妹。'
  },
  '辛': {
    emoji: '💎',
    title: 'Xin Metal · Jade\'s Pride',
    description: 'I am like porcelain in an antique shop—smooth from afar but with visible cracks up close. I\'m harsh on myself; if my work has even a thread out of place, I\'ll tear it apart and start over. I appear humble and proper on the surface, but harbor a "better broken than bent" stubbornness inside.',
    advice: 'Praise should be specific to details; they can distinguish between courtesy and sincerity.',
    symbol: 'Precious Gems',
    traits: ['Perfectionist', 'Elegant', 'Perceptive', 'Self-critical'],
    humanImage: 'Like finely crafted jewelry, brilliant yet needing soil for foundation.',
    ditiansuiVerse: '辛金软弱，温润而清，畏土之叠，乐水之盈，能扶社稷，能救生灵，热则喜母，寒则喜丁。'
  },
  '壬': {
    emoji: '🌊',
    title: 'Ren Water · River\'s Adaptability',
    description: 'Today I want to climb mountains, tomorrow I want to sail seas—like a stream that flows around rocks. Friends say I\'m changeable, but I just hate being boxed in. I can seamlessly switch between philosophy and gossip in conversation, like river water that can both carry boats and brew tea.',
    advice: 'Don\'t try to plan their trajectory; going with the flow together is more fun.',
    symbol: 'Rivers and Seas',
    traits: ['Tolerant', 'Adaptable', 'Wise', 'Drifting'],
    humanImage: 'Like flowing water, nourishing all while needing banks (earth) for guidance.',
    ditiansuiVerse: '壬水通河，能泄金气，逢甲则从，得龙而运，化则有情，从则相济。'
  },
  '癸': {
    emoji: '💧',
    title: 'Gui Water · Deep Pool\'s Intuition',
    description: 'I am like a night owl, always noticing details others miss. When I suddenly go quiet during conversation, I might be savoring contradictions in your words. I appear calm and compliant, but inside I\'ve already drawn a roadmap.',
    advice: 'Allow them to occasionally drift in thought; that\'s their mind diving deep for pearls.',
    symbol: 'Rain and Dew',
    traits: ['Gentle', 'Intuitive', 'Understanding', 'Melancholic'],
    humanImage: 'Like morning dew reflecting sunlight, gentle yet capable of wearing down stone.',
    ditiansuiVerse: '癸水至弱，达于天津，得龙而运，功化斯神，不愁火土，不论庚辛，合戊见火，化象斯真。'
  }
}; 