export const PALACE_ORDER = [
    '命宫',
    '兄弟宫',
    '夫妻宫',
    '子女宫',
    '财帛宫',
    '疾厄宫',
    '迁移宫',
    '交友宫',
    '官禄宫',
    '田宅宫',
    '福德宫',
    '父母宫',
];
const ROLE_MATRIX = {
    内宫: [1, 5, 6, 9, 10, 11],
    外宫: [2, 3, 4, 7, 8, 12],
    阳宫: [1, 3, 5, 7, 9, 11],
    阴宫: [2, 4, 6, 8, 10, 12],
    体宫: [1, 3, 6, 10, 11, 12],
    用宫: [2, 4, 5, 7, 8, 9],
};
const FOUNDATION_COMBINATIONS = {
    AB: '禄权忌结构，象征扩张之后的掌控与转折，要关注资金与权责平衡。',
    AC: '禄科忌结构，强调投入与声誉并进，适合资产升值与品牌打造。',
    BC: '权科忌结构，权力与制度并存，忌象提醒权责界限，宜稳健。',
    AD: '禄忌组合，投入换取成果，常见于创业或激进投资。',
    BD: '权忌组合，代表升迁后的压力与转折点，需审慎调度资源。',
    CD: '科忌组合，名誉或学业的考验，提醒守住专业与信誉。',
};
export const PALACE_NAME_ALIASES = {
    命宫: '命宫',
    命: '命宫',
    兄弟宫: '兄弟宫',
    兄弟: '兄弟宫',
    夫妻宫: '夫妻宫',
    夫妻: '夫妻宫',
    子女宫: '子女宫',
    子女: '子女宫',
    财帛宫: '财帛宫',
    财帛: '财帛宫',
    疾厄宫: '疾厄宫',
    疾厄: '疾厄宫',
    迁移宫: '迁移宫',
    迁移: '迁移宫',
    交友宫: '交友宫',
    交友: '交友宫',
    仆役宫: '交友宫',
    仆役: '交友宫',
    奴仆宫: '交友宫',
    奴仆: '交友宫',
    官禄宫: '官禄宫',
    官禄: '官禄宫',
    田宅宫: '田宅宫',
    田宅: '田宅宫',
    福德宫: '福德宫',
    福德: '福德宫',
    父母宫: '父母宫',
    父母: '父母宫',
};
function normalizePalaceName(name) {
    if (!name)
        return null;
    const trimmed = name.trim();
    if (!trimmed)
        return null;
    const normalized = trimmed.endsWith('宫') ? trimmed : `${trimmed}宫`;
    return PALACE_NAME_ALIASES[normalized] ?? null;
}
function collectMarkers(stars) {
    const result = {
        base: new Set(),
        inward: new Set(),
        outward: new Set(),
    };
    if (!stars)
        return result;
    stars.forEach((star) => {
        star.markers.forEach((marker) => {
            if (!marker)
                return;
            if (marker.startsWith('i')) {
                const code = marker.slice(1);
                if (code === 'A' || code === 'B' || code === 'C' || code === 'D') {
                    result.inward.add(code);
                }
                return;
            }
            if (marker.startsWith('x')) {
                const code = marker.slice(1);
                if (code === 'A' || code === 'B' || code === 'C' || code === 'D') {
                    result.outward.add(code);
                }
                return;
            }
            if (marker === 'A' || marker === 'B' || marker === 'C' || marker === 'D') {
                result.base.add(marker);
            }
        });
    });
    return result;
}
function detectCombinations(markers) {
    const combos = [];
    const base = markers.base;
    const has = (code) => base.has(code) || markers.inward.has(code) || markers.outward.has(code);
    const combinations = [
        ['AB', ['A', 'B']],
        ['AC', ['A', 'C']],
        ['BC', ['B', 'C']],
        ['AD', ['A', 'D']],
        ['BD', ['B', 'D']],
        ['CD', ['C', 'D']],
    ];
    combinations.forEach(([key, codes]) => {
        if (codes.every((code) => has(code))) {
            const description = FOUNDATION_COMBINATIONS[key];
            combos.push(description ? `${key}: ${description}` : key);
        }
    });
    return combos;
}
export function analyzeWealthStructure(input) {
    const palaceRoles = [];
    const palaceCombinations = [];
    input.palaces.forEach((palace) => {
        const tags = [];
        const combos = [];
        const markers = collectMarkers(palace.stars);
        const index = palace.index;
        Object.entries(ROLE_MATRIX).forEach(([tag, indexes]) => {
            if (indexes.includes(index)) {
                tags.push(tag);
            }
        });
        if (tags.length) {
            palaceRoles.push({
                palace: palace.name,
                index,
                tags,
                description: `${palace.name} 属于 ${tags.join('、')} 分类`,
            });
        }
        const detectedCombos = detectCombinations(markers);
        if (detectedCombos.length) {
            combos.push(...detectedCombos);
        }
        if (combos.length) {
            const markerList = Array.from(new Set([
                ...Array.from(markers.base),
                ...Array.from(markers.inward).map((code) => `i${code}`),
                ...Array.from(markers.outward).map((code) => `x${code}`),
            ]));
            palaceCombinations.push({
                palace: palace.name,
                index,
                combinations: combos,
                markers: markerList,
            });
        }
    });
    return { palaceRoles, palaceCombinations };
}
export function buildWealthInputFromHook(chart) {
    const palaces = [];
    PALACE_ORDER.forEach((palaceName, idx) => {
        const branchKey = getBranchByIndex(idx);
        const palaceInfo = chart[branchKey];
        if (!isHookPalaceInfo(palaceInfo))
            return;
        const stars = [];
        const collectStar = (star) => {
            const markers = [];
            if (Array.isArray(star.type)) {
                star.type.forEach((marker) => {
                    if (typeof marker === 'string')
                        markers.push(marker);
                });
            }
            stars.push({ name: star.name, markers });
        };
        const mainStars = palaceInfo['mainStars&sihuaStars'];
        const auxiliaryStars = palaceInfo['auxiliaryStars&sihuaStars'];
        const minorStars = palaceInfo.minorStars;
        mainStars?.forEach((star) => collectStar(star));
        auxiliaryStars?.forEach((star) => collectStar(star));
        minorStars?.forEach((star) => collectStar(star));
        const palaceEntry = {
            index: idx + 1,
            name: palaceName,
            branch: palaceInfo.branch ?? '',
            stars,
        };
        if (palaceInfo.stem) {
            palaceEntry.stem = palaceInfo.stem;
        }
        palaces.push(palaceEntry);
    });
    return { palaces };
}
function getBranchByIndex(index) {
    const branches = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];
    return branches[index] ?? '子';
}
function isHookPalaceInfo(value) {
    return Boolean(value && typeof value === 'object' && 'palaceName' in value);
}
export function buildWealthInputFromChartData(chart) {
    const palaces = [];
    chart.palaces.forEach((palace) => {
        const normalizedName = normalizePalaceName(palace.name);
        if (!normalizedName)
            return;
        const index = PALACE_ORDER.indexOf(normalizedName);
        if (index < 0)
            return;
        const stars = [];
        palace.stars?.forEach((star) => {
            const markers = [];
            if (star.sihuaOrigin)
                markers.push(star.sihuaOrigin);
            if (star.sihuaInward)
                markers.push(`i${star.sihuaInward}`);
            if (star.sihuaOutward)
                markers.push(`x${star.sihuaOutward}`);
            stars.push({ name: star.name, markers });
        });
        const palaceEntry = {
            index: index + 1,
            name: normalizedName,
            branch: palace.branch ?? '',
            stars,
        };
        if (palace.stem) {
            palaceEntry.stem = palace.stem;
        }
        palaces.push(palaceEntry);
    });
    return { palaces };
}
//# sourceMappingURL=wealth.js.map