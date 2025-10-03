import { BRANCH_NAMES } from '../types/hook-format-types';
import { PALACE_ORDER, PALACE_NAME_ALIASES } from './wealth';
import { STAR_SYMPTOMS } from './health-rules';
const RISK_CHAIN_PALACES = ['交友宫', '疾厄宫', '田宅宫'];
const MITIGATION_PALACES = ['命宫', '疾厄宫', '福德宫', '交友宫', '田宅宫'];
const SYMPTOM_PALACES = ['疾厄宫', '命宫', '福德宫'];
function createEmptyBuckets() {
    const initial = { A: [], B: [], C: [], D: [] };
    return {
        origin: { ...initial },
        inward: { ...initial },
        outward: { ...initial },
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
function collectAllStars(palace) {
    if (!palace)
        return [];
    const mainStars = palace['mainStars&sihuaStars'];
    const auxiliaryStars = palace['auxiliaryStars&sihuaStars'];
    const minorStars = palace.minorStars;
    return [
        ...(mainStars ?? []),
        ...(auxiliaryStars ?? []),
        ...(minorStars ?? []),
    ];
}
function collectMarkerBuckets(stars) {
    const buckets = createEmptyBuckets();
    stars.forEach((star) => {
        const types = Array.isArray(star?.type) ? star.type : [];
        types.forEach((tag) => {
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
function buildMarkerSummary(palace, info, branch) {
    const stars = collectAllStars(info);
    return {
        palace,
        branch: branch ?? info?.branch ?? null,
        stem: info?.stem ?? null,
        markers: collectMarkerBuckets(stars),
        totalStars: stars.length,
    };
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
function unique(values) {
    return Array.from(new Set(values.filter(Boolean)));
}
function hasLetter(summary, letter) {
    if (!summary)
        return false;
    return (summary.markers.origin[letter].length > 0 ||
        summary.markers.inward[letter].length > 0 ||
        summary.markers.outward[letter].length > 0);
}
function formatLetterDetail(summary, letter) {
    const sections = [];
    const origin = unique(summary.markers.origin[letter]);
    const inward = unique(summary.markers.inward[letter]);
    const outward = unique(summary.markers.outward[letter]);
    if (origin.length)
        sections.push(`生年：${origin.join('、')}`);
    if (inward.length)
        sections.push(`向心：${inward.join('、')}`);
    if (outward.length)
        sections.push(`离心：${outward.join('、')}`);
    return sections.join('；');
}
function evaluateRiskFindings(markers) {
    const findings = [];
    const chainTriggered = RISK_CHAIN_PALACES.filter((palace) => hasLetter(markers[palace], 'D'));
    if (chainTriggered.length >= 2) {
        const severity = chainTriggered.length === 3 ? 'high' : 'medium';
        const details = chainTriggered.map((palace) => {
            const summary = markers[palace];
            const detail = formatLetterDetail(summary, 'D');
            return detail ? `${palace}：${detail}` : `${palace}：检测到忌象`;
        });
        findings.push({
            rule: '奴疾田忌象链',
            severity,
            description: '交友、疾厄、田宅之间出现忌象连动，需要关注寿元、慢性疾病或重大变故。',
            relatedPalaces: [...chainTriggered],
            triggeredLetters: ['D'],
            details,
        });
    }
    const fudeSummary = markers['福德宫'];
    const fudeHasJi = hasLetter(fudeSummary, 'D');
    if (fudeHasJi && chainTriggered.length >= 2) {
        const details = [
            `福德宫：${formatLetterDetail(fudeSummary, 'D') || '检测到忌象'}`,
            ...chainTriggered.map((palace) => `${palace}：${formatLetterDetail(markers[palace], 'D') || '检测到忌象'}`),
        ];
        findings.push({
            rule: '福德-奴疾田自损链',
            severity: 'high',
            description: '福德宫出现忌象并与奴、疾、田形成链条，应留意精神压力、自我耗损与极端行为风险。',
            relatedPalaces: ['福德宫', ...chainTriggered],
            triggeredLetters: ['D'],
            details,
        });
    }
    else if (fudeHasJi) {
        findings.push({
            rule: '福德忌象',
            severity: 'medium',
            description: '福德宫出现忌象，需关注情绪与精神压力，并结合行运再判断风险。',
            relatedPalaces: ['福德宫'],
            triggeredLetters: ['D'],
            details: [`福德宫：${formatLetterDetail(fudeSummary, 'D') || '检测到忌象'}`],
        });
    }
    const lifeSummary = markers['命宫'];
    const travelSummary = markers['迁移宫'];
    const lifeHasLu = hasLetter(lifeSummary, 'A');
    const lifeHasJi = hasLetter(lifeSummary, 'D');
    const travelHasLu = hasLetter(travelSummary, 'A');
    const travelHasJi = hasLetter(travelSummary, 'D');
    const accidentPairs = [
        lifeHasLu && lifeHasJi,
        travelHasLu && travelHasJi,
        lifeHasLu && travelHasJi,
        lifeHasJi && travelHasLu,
    ];
    if (accidentPairs.some(Boolean)) {
        const severity = lifeHasLu && lifeHasJi && travelHasLu && travelHasJi ? 'high' : 'medium';
        const details = [
            `命宫：${formatLetterDetail(lifeSummary, 'A') || '未见禄'} / ${formatLetterDetail(lifeSummary, 'D') || '未见忌'}`,
            `迁移宫：${formatLetterDetail(travelSummary, 'A') || '未见禄'} / ${formatLetterDetail(travelSummary, 'D') || '未见忌'}`,
        ];
        findings.push({
            rule: '命迁禄忌交会',
            severity,
            description: '命宫与迁移宫之间的禄忌交会提示交通或外出意外风险，请重视出行安全与压力调节。',
            relatedPalaces: ['命宫', '迁移宫'],
            triggeredLetters: ['A', 'D'],
            details,
        });
    }
    return findings;
}
function evaluateMitigation(markers) {
    const hints = [];
    MITIGATION_PALACES.forEach((palace) => {
        const summary = markers[palace];
        if (!summary)
            return;
        const origin = unique(summary.markers.origin.C);
        const inward = unique(summary.markers.inward.C);
        const outward = unique(summary.markers.outward.C);
        if (origin.length === 0 && inward.length === 0 && outward.length === 0)
            return;
        const sources = {};
        if (origin.length)
            sources.origin = origin;
        if (inward.length)
            sources.inward = inward;
        if (outward.length)
            sources.outward = outward;
        const segments = [];
        if (origin.length)
            segments.push(`生年科：${origin.join('、')}`);
        if (inward.length)
            segments.push(`向心科：${inward.join('、')}`);
        if (outward.length)
            segments.push(`离心科：${outward.join('、')}`);
        hints.push({
            palace,
            letter: 'C',
            sources,
            summary: segments.join('；'),
        });
    });
    return hints;
}
function gatherSymptomHighlights(chart) {
    const highlights = [];
    const knowledge = new Map(STAR_SYMPTOMS.map((entry) => [entry.star, entry]));
    SYMPTOM_PALACES.forEach((palace) => {
        const info = findPalaceInfo(chart, palace).palace;
        const stars = collectAllStars(info);
        stars.forEach((star) => {
            const refer = knowledge.get(star.name);
            if (!refer)
                return;
            const markersList = Array.isArray(star.type)
                ? star.type.filter((tag) => /^[ix]?[ABCD]$/.test(tag))
                : [];
            highlights.push({
                palace,
                star: star.name,
                markers: markersList,
                organs: refer.organs,
                symptoms: refer.symptoms,
            });
        });
    });
    return highlights;
}
export function analyzeHealthFromHook(chart) {
    const markers = {};
    PALACE_ORDER.forEach((palace) => {
        const { palace: info, branch } = findPalaceInfo(chart, palace);
        markers[palace] = buildMarkerSummary(palace, info, branch);
    });
    const riskFindings = evaluateRiskFindings(markers);
    const mitigationHints = evaluateMitigation(markers);
    const symptomHighlights = gatherSymptomHighlights(chart);
    return {
        markers,
        riskFindings,
        mitigationHints,
        symptomHighlights,
    };
}
//# sourceMappingURL=health-analysis.js.map