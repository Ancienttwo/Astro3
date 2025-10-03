import { buildWealthInputFromHook, buildWealthInputFromChartData, PALACE_ORDER, PALACE_NAME_ALIASES, analyzeWealthStructure, } from './wealth';
import { COMBINATION_RULES } from './fortune-rules';
const INNER_INDEXES = new Set([1, 5, 6, 9, 10, 11]);
const OUTER_INDEXES = new Set([2, 3, 4, 7, 8, 12]);
const YIN_INDEXES = new Set([2, 4, 6, 8, 10, 12]);
const BODY_INDEXES = new Set([1, 3, 6, 10, 11, 12]);
const USE_INDEXES = new Set([2, 4, 5, 7, 8, 9]);
const BREAKING_INDEXES = new Set([3, 7, 11]); // 夫妻、迁移、福德
const DAMAGING_INDEXES = new Set([4, 12]); // 子女、父母
const TRIAD_INDEXES = new Set([1, 5, 9]); // 命财官三合
function getPalaceNameByIndex(index) {
    if (!index || index < 1 || index > PALACE_ORDER.length)
        return null;
    const palace = PALACE_ORDER[index - 1];
    return palace ?? null;
}
function filterValidIndices(indices = []) {
    return indices.filter((value) => Number.isInteger(value) && value > 0 && value <= PALACE_ORDER.length);
}
function extractPalaceNames(indices) {
    return filterValidIndices(indices)
        .map((idx) => getPalaceNameByIndex(idx))
        .filter((name) => Boolean(name));
}
function isCombinationKey(value) {
    return value === 'AB' || value === 'AC' || value === 'BC' || value === 'AD' || value === 'BD' || value === 'CD';
}
function normalizePalaceName(raw) {
    if (!raw)
        return null;
    const trimmed = raw.trim();
    if (!trimmed)
        return null;
    const normalized = trimmed.endsWith('宫') ? trimmed : `${trimmed}宫`;
    return PALACE_NAME_ALIASES[normalized] ?? null;
}
function getPalaceIndex(name) {
    if (!name)
        return null;
    const idx = PALACE_ORDER.indexOf(name);
    return idx >= 0 ? idx + 1 : null;
}
function analyzeOrigin(originPalace) {
    const index = getPalaceIndex(originPalace);
    if (!originPalace || !index) {
        return {
            palace: null,
            index: null,
            mode: null,
            isInner: null,
            description: '来因宫信息缺失，无法判断自立或他荫。',
            knowledgeBaseKey: null,
        };
    }
    const isInner = INNER_INDEXES.has(index);
    const mode = isInner ? 'self_reliant' : 'supported';
    const classificationLabel = isInner ? '自立格' : '他荫格';
    const description = `来因宫落在 ${originPalace}（第 ${index} 宫），归属${isInner ? '六内宫' : '六外宫'}，判为${classificationLabel}。`;
    return {
        palace: originPalace,
        index,
        mode,
        isInner,
        description,
        knowledgeBaseKey: `origin:${originPalace}`,
    };
}
function collectBirthTransformPositions(input) {
    const positions = {
        A: [],
        B: [],
        C: [],
        D: [],
    };
    input.palaces.forEach((palace) => {
        palace.stars?.forEach((star) => {
            star.markers.forEach((marker) => {
                const code = marker.trim();
                if (code === 'A' || code === 'B' || code === 'C' || code === 'D') {
                    if (!positions[code].includes(palace.index)) {
                        positions[code].push(palace.index);
                    }
                }
            });
        });
    });
    return positions;
}
function analyzeInnatePattern(birthPositions) {
    const dPositions = birthPositions.D;
    if (!dPositions.length) {
        return {
            orientation: 'unknown',
            isBroken: false,
            isDamaged: false,
            recommendation: 'stabilize_first',
            notes: ['未侦测到生年忌落点，需确认命盘四化资料。'],
            referencePalace: { name: null, index: null },
        };
    }
    const primaryIndex = dPositions[0];
    if (typeof primaryIndex !== 'number') {
        return {
            orientation: 'unknown',
            isBroken: false,
            isDamaged: false,
            recommendation: 'stabilize_first',
            notes: ['生年忌落点资料不完整，暂无法建立模式推断。'],
            referencePalace: { name: null, index: null },
        };
    }
    const primaryPalace = getPalaceNameByIndex(primaryIndex);
    const orientation = YIN_INDEXES.has(primaryIndex) ? 'wealth_oriented' : 'status_oriented';
    const orientationLabel = orientation === 'wealth_oriented' ? '富格' : '贵格';
    const isBroken = BREAKING_INDEXES.has(primaryIndex);
    const isDamaged = DAMAGING_INDEXES.has(primaryIndex);
    const notes = [];
    notes.push(`生年忌落在第 ${primaryIndex} 宫（${primaryPalace ?? '未知宫'}），判为 ${orientationLabel}。`);
    if (isBroken) {
        notes.push('生年忌落于迁移 / 福德 / 夫妻轴线（三合冲），属于破格，需要额外调节。');
    }
    if (isDamaged) {
        notes.push('生年忌落于子女或父母位，对应冲克田宅 / 疾厄，属于损格，需要注意家庭或健康支出。');
    }
    const recommendation = isBroken || isDamaged
        ? 'stabilize_first'
        : orientation === 'wealth_oriented'
            ? 'focus_wealth'
            : 'focus_status';
    return {
        orientation,
        isBroken,
        isDamaged,
        recommendation,
        notes,
        referencePalace: {
            name: primaryPalace,
            index: primaryIndex,
        },
    };
}
function describeTransform(letter, indices) {
    const validIndices = filterValidIndices(indices);
    if (!validIndices.length)
        return `${letter} 未在命盘中标注生年四化。`;
    const palaceNames = extractPalaceNames(validIndices);
    const palaceText = palaceNames.length ? palaceNames.join('、') : '未知宫位';
    const bodyTag = indices.some((idx) => BODY_INDEXES.has(idx));
    const useTag = indices.some((idx) => USE_INDEXES.has(idx));
    const tags = [];
    if (bodyTag)
        tags.push('体宫');
    if (useTag)
        tags.push('用宫');
    const tagText = tags.length ? `（${tags.join(' / ')}）` : '';
    return `${letter} 落在 ${palaceText}${tagText}`;
}
function buildTransformDetails(birthPositions, comboByIndex) {
    const letters = ['A', 'B', 'C', 'D'];
    return letters.map((letter) => {
        const indices = filterValidIndices(birthPositions[letter]);
        const palaceNames = extractPalaceNames(indices);
        const isBody = indices.some((idx) => BODY_INDEXES.has(idx));
        const isUse = indices.some((idx) => USE_INDEXES.has(idx));
        const combinationKeys = Array.from(new Set(indices.flatMap((idx) => comboByIndex.get(idx) ?? [])));
        const combinationDetails = combinationKeys.map((key) => COMBINATION_RULES[key]);
        return {
            letter,
            palaceIndices: indices,
            palaceNames,
            isBody,
            isUse,
            description: describeTransform(letter, indices),
            combinationGroups: combinationKeys,
            combinationDetails,
        };
    });
}
function computeOpposite(index) {
    if (!index)
        return [];
    return [((index + 6 - 1) % 12) + 1];
}
function computeNeighbors(index) {
    if (!index)
        return [];
    const prev = ((index + 12 - 2) % 12) + 1;
    const next = (index % 12) + 1;
    return [prev, next];
}
function buildPriorityMatrix(indexes) {
    if (!indexes.length) {
        return {
            stages: [
                { key: 'same', label: '同宫', indexes: [] },
                { key: 'triad', label: '命财官三合', indexes: [] },
                { key: 'oppositeInner', label: '对宫与六内', indexes: [] },
                { key: 'neighbor', label: '邻宫', indexes: [] },
            ],
            notes: ['无生年四化记录，暂无法建立先天气数组。'],
        };
    }
    const sorted = Array.from(new Set(filterValidIndices(indexes))).sort((a, b) => a - b);
    if (!sorted.length) {
        return {
            stages: [
                { key: 'same', label: '同宫', indexes: [] },
                { key: 'triad', label: '命财官三合', indexes: [] },
                { key: 'oppositeInner', label: '对宫与六内', indexes: [] },
                { key: 'neighbor', label: '邻宫', indexes: [] },
            ],
            notes: ['无生年四化记录，暂无法建立先天气数组。'],
        };
    }
    const primaryIndex = sorted[0];
    if (typeof primaryIndex !== 'number') {
        return {
            stages: [
                { key: 'same', label: '同宫', indexes: [] },
                { key: 'triad', label: '命财官三合', indexes: [] },
                { key: 'oppositeInner', label: '对宫与六内', indexes: [] },
                { key: 'neighbor', label: '邻宫', indexes: [] },
            ],
            notes: ['无生年四化记录，暂无法建立先天气数组。'],
        };
    }
    const primaryPalaceName = getPalaceNameByIndex(primaryIndex);
    const notes = [`以第 ${primaryIndex} 宫（${primaryPalaceName ?? '未知宫'}）为核心，依序关注同宫、命财官三合、对宫与六内、邻宫的四化触发。`];
    const used = new Set();
    const same = [primaryIndex];
    same.forEach((idx) => used.add(idx));
    const triad = sorted.filter((idx) => TRIAD_INDEXES.has(idx) && !used.has(idx));
    triad.forEach((idx) => used.add(idx));
    const oppositeCandidates = computeOpposite(primaryIndex);
    const opposite = oppositeCandidates.filter((idx) => sorted.includes(idx) && !used.has(idx));
    opposite.forEach((idx) => used.add(idx));
    const innerSet = INNER_INDEXES.has(primaryIndex) ? INNER_INDEXES : OUTER_INDEXES;
    const inner = sorted.filter((idx) => innerSet.has(idx) && !used.has(idx));
    inner.forEach((idx) => used.add(idx));
    const neighbors = computeNeighbors(primaryIndex).filter((idx) => sorted.includes(idx) && !used.has(idx));
    neighbors.forEach((idx) => used.add(idx));
    return {
        stages: [
            { key: 'same', label: '同宫', indexes: same },
            { key: 'triad', label: '命财官三合', indexes: triad },
            { key: 'oppositeInner', label: '对宫与六内', indexes: [...opposite, ...inner] },
            { key: 'neighbor', label: '邻宫', indexes: neighbors },
        ],
        notes,
    };
}
function buildPriority(birthPositions) {
    return {
        A: buildPriorityMatrix(birthPositions.A),
        B: buildPriorityMatrix(birthPositions.B),
        C: buildPriorityMatrix(birthPositions.C),
        D: buildPriorityMatrix(birthPositions.D),
    };
}
function extractOriginFromHook(chart) {
    return normalizePalaceName(chart?.来因宫);
}
export function analyzePatternFromWealthInput(input, originPalace) {
    const origin = analyzeOrigin(originPalace);
    const birthPositions = collectBirthTransformPositions(input);
    const innatePattern = analyzeInnatePattern(birthPositions);
    const wealthStructure = analyzeWealthStructure(input);
    const comboByIndex = new Map(wealthStructure.palaceCombinations.map((item) => {
        const keys = item.combinations
            .map((combo) => combo.split(':')[0]?.trim())
            .filter(isCombinationKey);
        return [item.index, keys];
    }));
    const natalTransforms = buildTransformDetails(birthPositions, comboByIndex);
    const priority = buildPriority(birthPositions);
    return {
        origin,
        innatePattern,
        natalTransforms,
        priority,
        metadata: {
            birthTransforms: birthPositions,
        },
    };
}
export function analyzePatternFromHookChart(chart) {
    const wealthInput = buildWealthInputFromHook(chart);
    const originPalace = extractOriginFromHook(chart);
    return analyzePatternFromWealthInput(wealthInput, originPalace);
}
export function analyzePatternFromChartData(chart, options) {
    const wealthInput = buildWealthInputFromChartData(chart);
    const originPalace = normalizePalaceName(options?.originPalace ?? null);
    return analyzePatternFromWealthInput(wealthInput, originPalace);
}
//# sourceMappingURL=pattern.js.map