import { PALACE_ORDER } from './wealth';
export const PALACE_INDEX_TO_NAME = PALACE_ORDER.reduce((acc, palace, idx) => {
    acc[idx + 1] = palace;
    return acc;
}, {});
export const MARRIAGE_KEY_PALACES = [
    '命宫',
    '夫妻宫',
    '子女宫',
    '财帛宫',
    '疾厄宫',
    '交友宫',
    '迁移宫',
    '田宅宫',
    '福德宫',
];
export const MARRIAGE_INNER_PALACES = [
    '命宫',
    '夫妻宫',
    '财帛宫',
    '疾厄宫',
    '交友宫',
    '田宅宫',
];
export const MARRIAGE_PALACE_ROLES = [
    { index: 1, palace: '命宫', summary: '命太极之主体，统摄婚缘与一切生命现象，是姻缘判断的起点。' },
    { index: 3, palace: '夫妻宫', summary: '异性姻缘位，反映婚姻观念、缘分厚薄与配偶条件。' },
    { index: 4, palace: '子女宫', summary: '短期情缘与合伙触发点，也映射情感表达与亲密互动方式。' },
    { index: 5, palace: '财帛宫', summary: '婚后夫妻对待位，观察婚后互动与经济往来。' },
    { index: 6, palace: '疾厄宫', summary: '自身身体位，也是河图一六共宗，象征个人精力与健康。' },
    {
        index: 8,
        palace: '交友宫',
        aka: '奴仆/配偶身体位',
        summary: '对婚姻来说代表配偶的身体与助力，也是河图一六共宗的另一端。',
    },
    {
        index: 7,
        palace: '迁移宫',
        summary: '外在魅力与社交磁场的舞台，象征对外曝光与际遇对关系的影响。',
    },
    { index: 10, palace: '田宅宫', summary: '成家位，亦为夫妻宫立太极的奴仆位，婚姻破败或成家的关键指示宫。' },
    { index: 11, palace: '福德宫', summary: '自身享福与价值观，并为配偶官禄宫，反映婚后事业与运势。' },
];
export const MARRIAGE_LETTER_MEANINGS = {
    A: '缘起：象征缘分启动、热情浓烈、迅速拉近距离。',
    B: '缘变：代表占有与掌控，易出现争执或磨合。',
    C: '缘续：情感延绵浪漫，强调眷念与维系。',
    D: '缘灭：提示冷却、疏离或纷争，是婚姻的不顺讯号。',
};
export const MARRIAGE_COMBINATION_MEANINGS = {
    AB: {
        key: 'AB',
        label: '禄权组合',
        summary: '对象常为两人以上，泛水桃花，表面热情却难长久，提醒聚焦承诺。',
    },
    AC: {
        key: 'AC',
        label: '禄科组合',
        summary: '有缘有情的良性桃花，虽多对象，但能相对和谐与善终。',
    },
    BC: {
        key: 'BC',
        label: '权科组合',
        summary: '象征一显一隐或先后更替的关系，常有地下恋情或情感轮替。',
    },
    AD: {
        key: 'AD',
        label: '禄忌组合',
        summary: '感情投入与收束起伏极大，属于双忌现象，婚姻波动需加倍注意。',
    },
    BD: {
        key: 'BD',
        label: '权忌组合',
        summary: '善变型婚缘，容易来去匆匆，需校准观念避免一拍两散。',
    },
    CD: {
        key: 'CD',
        label: '科忌组合',
        summary: '情感易陷入纠缠或藕断丝连，是非唠叨较多，需理性切割。',
    },
};
export const PEACH_BLOSSOM_STARS = new Set(['贪狼', '廉贞', '文昌', '文曲', '化科', '化禄']);
export const NOBLE_STARS = new Set(['左辅', '右弼', '文昌', '文曲', '化科']);
export const MARRIAGE_STAR_NOTES = {
    peach: '桃花星过多，婚缘转折频仍，命宫或夫妻宫多桃花则情路坎坷。',
    noble: '贵人星对婚姻的冲击较大，尤以左辅、右弼、化科显现时，容易二度婚姻或外缘干扰。',
    nobleRepetition: '左辅、右弼象征再一次或二度缘分，落夫妻宫时常见婚前抉择难或二婚、小三课题。',
};
export const MARRIAGE_TIMELINE_GUIDELINES = [
    '先天以命、夫妻、福德三宫为核心，检测生年四化与自化是否形成双象，双象即含应期。',
    '夫妻宫无生年、自化时，需依飞宫四化落于婚姻六内宫判断后天姻缘显现。',
    '生年四化需与飞宫平衡象呼应，若平衡位有自化，则应期可能反映到对宫。',
    '第一次婚姻以本夫、大夫并看；二婚以后注重大夫线即可。',
];
export const MARRIAGE_CHILD_PALACE_GUIDE = '子女宫行戊干飞 AC 入命（或子田线）时，代表后天桃花触发，为有缘又有情的良性桃花走势。';
export const MARRIAGE_EXAMPLE_NOTES = [
    '本命辛巳右弼+贪狼+廉贞：贵人星叠加桃花主，风情多变，需节制情感能量。',
    '飞宫 AC 自子女宫入命：象征大运走子田线时桃花显现，A 为缘、C 为情，属于良性桃花。',
    '大子叠本兄并见自化科与生年忌：符合洛书二四为肩法，引动桃花事件必然发生。',
];
//# sourceMappingURL=marriage-rules.js.map