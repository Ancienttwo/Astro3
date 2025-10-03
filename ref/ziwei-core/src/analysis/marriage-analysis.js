import { BRANCH_NAMES } from '../types/hook-format-types';
import { PALACE_ORDER, PALACE_NAME_ALIASES } from './wealth';
import { MARRIAGE_KEY_PALACES, MARRIAGE_INNER_PALACES, MARRIAGE_COMBINATION_MEANINGS, PEACH_BLOSSOM_STARS, NOBLE_STARS, MARRIAGE_LETTER_MEANINGS, MARRIAGE_PALACE_ROLES, PALACE_INDEX_TO_NAME, } from './marriage-rules';
function createEmptyBuckets() {
    const blank = { A: [], B: [], C: [], D: [] };
    return {
        origin: { ...blank },
        inward: { ...blank },
        outward: { ...blank },
    };
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
function collectAllStars(info) {
    if (!info)
        return [];
    const mainStars = info['mainStars&sihuaStars'];
    const auxiliaryStars = info['auxiliaryStars&sihuaStars'];
    const minorStars = info.minorStars;
    return [
        ...(mainStars ?? []),
        ...(auxiliaryStars ?? []),
        ...(minorStars ?? []),
    ];
}
function collectMarkers(stars) {
    const buckets = createEmptyBuckets();
    stars.forEach((star) => {
        const tags = Array.isArray(star?.type) ? star.type : [];
        tags.forEach((tag) => {
            if (!tag)
                return;
            if (/^[ABCD]$/.test(tag)) {
                const letter = tag;
                buckets.origin[letter].push(star.name);
            }
            else if (/^i[ABCD]$/.test(tag)) {
                const letter = tag.slice(1);
                buckets.inward[letter].push(star.name);
            }
            else if (/^x[ABCD]$/.test(tag)) {
                const letter = tag.slice(1);
                buckets.outward[letter].push(star.name);
            }
        });
    });
    return buckets;
}
function collectLetterStars(markers, letter) {
    const names = markers.origin[letter].concat(markers.inward[letter], markers.outward[letter]);
    return Array.from(new Set(names.filter(Boolean)));
}
function hasLetter(buckets, letter) {
    return (buckets.origin[letter].length > 0 ||
        buckets.inward[letter].length > 0 ||
        buckets.outward[letter].length > 0);
}
function detectCombinations(buckets) {
    const result = [];
    const checks = [
        ['AB', ['A', 'B']],
        ['AC', ['A', 'C']],
        ['BC', ['B', 'C']],
        ['AD', ['A', 'D']],
        ['BD', ['B', 'D']],
        ['CD', ['C', 'D']],
    ];
    checks.forEach(([key, letters]) => {
        if (letters.every((letter) => hasLetter(buckets, letter))) {
            result.push(key);
        }
    });
    return result;
}
function categorizeStars(stars) {
    const peach = [];
    const noble = [];
    stars.forEach((star) => {
        if (PEACH_BLOSSOM_STARS.has(star.name) && !peach.includes(star.name)) {
            peach.push(star.name);
        }
        if (NOBLE_STARS.has(star.name) && !noble.includes(star.name)) {
            noble.push(star.name);
        }
    });
    return { peach, noble };
}
function findPalaceInfo(chart, target) {
    if (target === '命宫') {
        const branchCandidate = chart.命宫;
        if (typeof branchCandidate === 'string' && branchCandidate) {
            const palace = chart[branchCandidate];
            if (palace)
                return { palace, branch: branchCandidate };
        }
    }
    for (const branch of BRANCH_NAMES) {
        const palace = chart[branch];
        if (!palace)
            continue;
        const normalized = normalizePalaceName(palace.palaceName || branch);
        if (normalized === target) {
            return { palace, branch };
        }
    }
    return { palace: null, branch: null };
}
function buildPalaceSummary(chart, palace, index) {
    const { palace: info, branch } = findPalaceInfo(chart, palace);
    const stars = collectAllStars(info);
    const markers = collectMarkers(stars);
    const combinations = detectCombinations(markers);
    const { peach, noble } = categorizeStars(stars);
    return {
        palace,
        index,
        branch: branch ?? info?.branch ?? null,
        stem: info?.stem ?? null,
        markers,
        combinations,
        peachStars: peach,
        nobleStars: noble,
    };
}
function summarizeCombination(palace, combinations) {
    return combinations
        .filter((key) => key === 'AB' || key === 'AC' || key === 'BC')
        .map((key) => ({
        palace,
        combination: key,
        summary: MARRIAGE_COMBINATION_MEANINGS[key].summary,
    }));
}
function evaluateRiskFindings(summaries) {
    const findings = [];
    const innerSummaries = summaries.filter((summary) => MARRIAGE_INNER_PALACES.includes(summary.palace));
    const totalDCount = innerSummaries.reduce((acc, summary) => {
        const bucket = summary.markers;
        return acc + bucket.origin.D.length + bucket.inward.D.length + bucket.outward.D.length;
    }, 0);
    if (totalDCount >= 4) {
        const notes = innerSummaries
            .filter((summary) => hasLetter(summary.markers, 'D'))
            .map((summary) => {
            const stars = collectLetterStars(summary.markers, 'D');
            return `${summary.palace}：${stars.length ? stars.join('、') : '忌象'}`;
        });
        findings.push({
            rule: '婚姻六内宫忌象密集',
            severity: 'high',
            description: '婚姻六内宫出现大量忌象，需严阵以待婚姻波动与家庭磨合。',
            palaces: innerSummaries.filter((summary) => hasLetter(summary.markers, 'D')).map((summary) => summary.palace),
            markers: ['AD', 'BD', 'CD'].filter((key) => innerSummaries.some((summary) => summary.combinations.includes(key))),
            notes,
        });
    }
    innerSummaries.forEach((summary) => {
        summary.combinations.forEach((key) => {
            if (key === 'AD' || key === 'BD' || key === 'CD') {
                const leftLetter = key.slice(0, 1);
                const rightLetter = key.slice(1);
                const involvedStars = Array.from(new Set([...collectLetterStars(summary.markers, leftLetter), ...collectLetterStars(summary.markers, rightLetter)]));
                findings.push({
                    rule: `${summary.palace}-${key}`,
                    severity: key === 'AD' ? 'high' : 'medium',
                    description: `${summary.palace} 出现 ${MARRIAGE_COMBINATION_MEANINGS[key].label}，${MARRIAGE_COMBINATION_MEANINGS[key].summary}`,
                    palaces: [summary.palace],
                    markers: [key],
                    notes: [`涉及星曜：${involvedStars.length ? involvedStars.join('、') : '—'}`],
                });
            }
        });
    });
    const peachCount = innerSummaries.reduce((acc, summary) => acc + summary.peachStars.length, 0);
    if (peachCount >= 4) {
        findings.push({
            rule: '桃花星過旺',
            severity: 'medium',
            description: '婚姻六内宫桃花星偏多，易出現情感試探與外緣干擾，需設定界線。',
            palaces: innerSummaries.filter((summary) => summary.peachStars.length > 0).map((summary) => summary.palace),
            markers: [],
            notes: innerSummaries
                .filter((summary) => summary.peachStars.length > 0)
                .map((summary) => `${summary.palace}：${summary.peachStars.join('、')}`),
        });
    }
    const nobleCount = innerSummaries.reduce((acc, summary) => acc + summary.nobleStars.length, 0);
    if (nobleCount >= 3) {
        findings.push({
            rule: '贵人星干扰',
            severity: 'medium',
            description: '贵人星重叠象征再一次的姻缘选择或婚后外缘干扰，须谨慎界定角色。',
            palaces: innerSummaries.filter((summary) => summary.nobleStars.length > 0).map((summary) => summary.palace),
            markers: [],
            notes: innerSummaries
                .filter((summary) => summary.nobleStars.length > 0)
                .map((summary) => `${summary.palace}：${summary.nobleStars.join('、')}`),
        });
    }
    return findings;
}
export function analyzeMarriageFromHook(chart) {
    const palaceSummaries = PALACE_ORDER.map((palace, idx) => buildPalaceSummary(chart, palace, idx + 1));
    const relevantSummaries = palaceSummaries.filter((summary) => MARRIAGE_KEY_PALACES.includes(summary.palace));
    const positiveHighlights = [];
    relevantSummaries.forEach((summary) => {
        positiveHighlights.push(...summarizeCombination(summary.palace, summary.combinations));
    });
    const riskFindings = evaluateRiskFindings(relevantSummaries);
    return {
        palaceSummaries: relevantSummaries,
        riskFindings,
        positiveHighlights,
        meta: {
            palaceIndexMap: PALACE_INDEX_TO_NAME,
            letterMeanings: MARRIAGE_LETTER_MEANINGS,
            palaceRoles: MARRIAGE_PALACE_ROLES,
        },
    };
}
//# sourceMappingURL=marriage-analysis.js.map