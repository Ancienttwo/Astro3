/*
 * 盲派做功 · 调候上层化 · TypeScript 工具包
 * 用于预计算结构因子、调候判断与工作流骨架，供用神 Agent 使用
 */

// =====================
// 1) Type 定义
// =====================

export type Branch =
  | "子"
  | "丑"
  | "寅"
  | "卯"
  | "辰"
  | "巳"
  | "午"
  | "未"
  | "申"
  | "酉"
  | "戌"
  | "亥";

export type Stem = "甲" | "乙" | "丙" | "丁" | "戊" | "己" | "庚" | "辛" | "壬" | "癸";

export type FiveElement = "木" | "火" | "土" | "金" | "水";

export type TenGod =
  | "比肩"
  | "劫财"
  | "食神"
  | "伤官"
  | "偏财"
  | "正财"
  | "七杀"
  | "正官"
  | "偏印"
  | "正印"
  | "枭";

export interface Meta {
  calendar: "solar" | "lunar";
  tz: string;
  month_branch: Branch;
  data_quality: "ok" | "partial";
}

export interface Pillar {
  stem: Stem;
  branch: Branch;
  hidden_stems: Stem[];
}

export interface Pillars {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar;
}

export interface TenGodHiddenItem {
  host: Branch;
  stem: Stem;
  god: TenGod;
  weight?: number;
}

export interface TenGods {
  day_master: Stem;
  by_stem?: Record<string, TenGod>;
  by_hidden: TenGodHiddenItem[];
}

export interface Strength {
  rooting?: Record<string, Branch[]>;
  seasonal_support?: Partial<Record<FiveElement, number>>;
  overall_bias?: "偏寒" | "偏热" | "中和";
}

export interface StemHePair {
  a: Stem;
  b: Stem;
  type: "合";
  may_transform_to?: FiveElement;
  evidence?: {
    hua_god?: string;
    root?: boolean;
    season_support?: boolean;
  };
  formed?: boolean;
}

export interface BranchPair {
  a: Branch;
  b: Branch;
  type?: string;
  may_transform_to?: FiveElement;
  formed?: boolean;
}

export interface BranchGroup {
  group: Branch[];
  towards: FiveElement;
  formed?: boolean;
}

export interface Relations {
  stems?: {
    he_pairs?: StemHePair[];
    clash?: { a: Stem; b: Stem }[];
  };
  branches?: {
    chong?: BranchPair[];
    xing?: BranchPair[];
    po?: BranchPair[];
    hai?: BranchPair[];
    liuhe?: BranchPair[];
    banhe?: BranchGroup[];
    sanhe?: BranchGroup[];
    hui?: BranchGroup[];
    jue?: BranchPair[];
    others?: unknown[];
  };
  twelve_stage?: Record<string, Record<string, string>>;
  lu_mu_ku?: {
    lu?: Branch[];
    ku?: Branch[];
    enter_ku?: { who: string; in: Branch; strength?: "弱" | "中" | "强" }[];
  };
}

export interface Flags {
  transformation_candidates?: { pattern: string; valid: boolean; reason?: string }[];
  environment?: { cold_hot?: "寒" | "热" | "温"; wet_dry?: "湿" | "燥" | "平" };
}

export interface InputChart {
  meta: Meta;
  pillars: Pillars;
  ten_gods: TenGods;
  strength?: Strength;
  relations?: Relations;
  flags?: Flags;
}

// =====================
// 2) 输出结构
// =====================

export type Compatibility = "match" | "partial" | "mismatch";
export type Grade = "高" | "中" | "受限";

export interface LayerA_DoGong {
  endpoint: "财" | "官" | "杀";
  candidate_scope: string[];
  blockers: string[];
  yongshen: string;
  jishen: string[];
  reasoning: string;
  four_rules_check: {
    guan_not_damaged: boolean;
    sha_has_control: boolean;
    shi_not_by_xiao: boolean;
    cai_not_by_jie: boolean;
  };
}

export type TiaohouDirection = "火暖" | "水润" | "燥化" | "湿化";

export interface LayerB_Tiaohou {
  month_branch: Branch;
  need: boolean;
  direction: TiaohouDirection[];
  why: string;
  impact_on_chain: "enable" | "boost" | "neutral" | "impair";
  conflict_with_yongshen: boolean;
}

export interface LayerC_FitAndGrade {
  compatibility: Compatibility;
  grade: Grade;
  notes: string;
}

export interface StructuralFactors {
  stems_he?: string[];
  branches_chong?: string[];
  branches_xing?: string[];
  branches_pohai?: string[];
  sanhe?: string[];
  liuhe?: string[];
  banhe?: string[];
  hui?: string[];
  lu_mu_ku?: string[];
}

export interface WorkflowEdge {
  from: string;
  to: string;
  effect: string;
  weight?: number;
}

export interface OutputPayload {
  meta: Meta;
  layerA_do_gong: LayerA_DoGong;
  layerB_tiaohou: LayerB_Tiaohou;
  layerC_fit_and_grade: LayerC_FitAndGrade;
  structural_factors?: StructuralFactors;
  workflow: { steps: string[]; edges: WorkflowEdge[] };
}

// =====================
// 3) JSON Schema
// =====================

const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"] as const;
const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"] as const;

const pillarSchema = () => ({
  type: "object",
  required: ["stem", "branch", "hidden_stems"],
  properties: {
    stem: { enum: STEMS },
    branch: { enum: BRANCHES },
    hidden_stems: { type: "array", items: { enum: STEMS } },
  },
}) as const;

export const InputChartJsonSchema = {
  type: "object",
  required: ["meta", "pillars", "ten_gods"],
  properties: {
    meta: {
      type: "object",
      required: ["calendar", "tz", "month_branch", "data_quality"],
      properties: {
        calendar: { enum: ["solar", "lunar"] },
        tz: { type: "string" },
        month_branch: { enum: BRANCHES },
        data_quality: { enum: ["ok", "partial"] },
      },
    },
    pillars: {
      type: "object",
      required: ["year", "month", "day", "hour"],
      properties: {
        year: pillarSchema(),
        month: pillarSchema(),
        day: pillarSchema(),
        hour: pillarSchema(),
      },
    },
    ten_gods: {
      type: "object",
      required: ["day_master", "by_hidden"],
      properties: {
        day_master: { enum: STEMS },
        by_stem: { type: "object", additionalProperties: { type: "string" } },
        by_hidden: {
          type: "array",
          items: {
            type: "object",
            required: ["host", "stem", "god"],
            properties: {
              host: { enum: BRANCHES },
              stem: { enum: STEMS },
              god: { type: "string" },
              weight: { type: "number" },
            },
          },
        },
      },
    },
    strength: { type: "object", additionalProperties: true },
    relations: { type: "object", additionalProperties: true },
    flags: { type: "object", additionalProperties: true },
  },
} as const;

// =====================
// 4) 调候规则
// =====================

export function assessTiaohou(
  month: Branch,
  keyChain?: string,
): Omit<LayerB_Tiaohou, "month_branch"> {
  let need = false;
  const direction: TiaohouDirection[] = [];
  let why = "";
  let impact: LayerB_Tiaohou["impact_on_chain"] = "neutral";
  const conflict_with_yongshen = false;

  const winter: Branch[] = ["亥", "子", "丑"];
  const summer: Branch[] = ["巳", "午", "未"];

  if (winter.includes(month)) {
    if (keyChain?.includes("水→木")) {
      need = true;
      direction.push("火暖");
      why = "冬水不生木，先火暖后水生木";
      impact = "enable";
    } else {
      direction.push("火暖");
      need = true;
      why = "冬月偏寒，火暖助生化";
      impact = "boost";
    }
  } else if (summer.includes(month)) {
    need = true;
    direction.push("水润");
    why = "夏月火盛，需水润降伏以成其功";
    impact = "boost";
  } else if (month === "寅") {
    need = true;
    direction.push("火暖");
    why = "寅月初春寒犹在，需火暖以发木";
    impact = keyChain?.includes("水→木") ? "enable" : "boost";
  } else {
    need = false;
    why = "平月通常不需调候";
    impact = "neutral";
  }

  return { need, direction, why, impact_on_chain: impact, conflict_with_yongshen };
}

// =====================
// 5) 关系因子映射
// =====================

export function relationsToStructuralFactors(rel?: Relations): StructuralFactors {
  if (!rel) return {};
  const sf: StructuralFactors = {};
  if (rel.stems?.he_pairs?.length) {
    sf.stems_he = rel.stems.he_pairs.map((p) =>
      `${p.a}${p.b}合${p.may_transform_to ?? "?"}${p.formed ? "(成)" : "(未成)"}`,
    );
  }
  const b = rel.branches;
  if (b?.chong?.length) sf.branches_chong = b.chong.map((x) => `${x.a}${x.b}冲`);
  if (b?.xing?.length) sf.branches_xing = b.xing.map((x) => `${x.a}${x.b}刑`);
  const ph: string[] = [];
  if (b?.po?.length) ph.push(...b.po.map((x) => `${x.a}${x.b}破`));
  if (b?.hai?.length) ph.push(...b.hai.map((x) => `${x.a}${x.b}害`));
  if (ph.length) sf.branches_pohai = ph;
  if (b?.sanhe?.length)
    sf.sanhe = b.sanhe.map((g) => `${g.group.join("")}${g.formed ? "三合成局" : "三合意向"}→${g.towards}`);
  if (b?.liuhe?.length)
    sf.liuhe = b.liuhe.map((x) => `${x.a}${x.b}六合${x.may_transform_to ? `→${x.may_transform_to}` : ""}`);
  if (b?.banhe?.length)
    sf.banhe = b.banhe.map((g) => `${g.group.join("")}${g.formed ? "半合成" : "半合意向"}→${g.towards}`);
  if (b?.hui?.length)
    sf.hui = b.hui.map((g) => `${g.group.join("")}${g.formed ? "会局成" : "会局意向"}→${g.towards}`);
  if (rel.lu_mu_ku) {
    const list: string[] = [];
    if (rel.lu_mu_ku.lu?.length) list.push(`禄位:${rel.lu_mu_ku.lu.join("、")}`);
    if (rel.lu_mu_ku.ku?.length) list.push(`四库:${rel.lu_mu_ku.ku.join("、")}`);
    if (rel.lu_mu_ku.enter_ku?.length)
      list.push(
        ...rel.lu_mu_ku.enter_ku.map((e) => `${e.who}入${e.in}库${e.strength ? `(${e.strength})` : ""}`),
      );
    if (list.length) sf.lu_mu_ku = list;
  }
  return sf;
}

export function relationsToEdges(rel?: Relations): WorkflowEdge[] {
  if (!rel) return [];
  const edges: WorkflowEdge[] = [];
  for (const p of rel.stems?.he_pairs ?? []) {
    edges.push({
      from: `干合:${p.a}${p.b}`,
      to: `化:${p.may_transform_to ?? "?"}`,
      effect: p.formed ? "合化成" : "合绊意向",
      weight: p.formed ? 0.8 : 0.3,
    });
  }
  const b = rel.branches;
  for (const item of b?.chong ?? [])
    edges.push({ from: `支冲:${item.a}${item.b}`, to: "链:关键", effect: "冲破", weight: -0.8 });
  for (const item of b?.xing ?? [])
    edges.push({ from: `支刑:${item.a}${item.b}`, to: "链:关键", effect: "损耗", weight: -0.4 });
  for (const item of b?.po ?? [])
    edges.push({ from: `支破:${item.a}${item.b}`, to: "链:关键", effect: "破坏", weight: -0.5 });
  for (const item of b?.hai ?? [])
    edges.push({ from: `支害:${item.a}${item.b}`, to: "链:关键", effect: "相害", weight: -0.3 });
  for (const group of b?.sanhe ?? [])
    edges.push({
      from: `三合:${group.group.join("")}`,
      to: `向:${group.towards}`,
      effect: group.formed ? "成局" : "趋向",
      weight: group.formed ? 0.8 : 0.4,
    });
  for (const group of b?.banhe ?? [])
    edges.push({
      from: `半合:${group.group.join("")}`,
      to: `向:${group.towards}`,
      effect: group.formed ? "半合成" : "半合意向",
      weight: group.formed ? 0.5 : 0.3,
    });
  for (const group of b?.hui ?? [])
    edges.push({
      from: `会局:${group.group.join("")}`,
      to: `向:${group.towards}`,
      effect: group.formed ? "会成" : "会意向",
      weight: group.formed ? 0.6 : 0.3,
    });
  for (const item of b?.liuhe ?? [])
    edges.push({
      from: `六合:${item.a}${item.b}`,
      to: `向:${item.may_transform_to ?? "?"}`,
      effect: "合向",
      weight: 0.5,
    });
  return edges;
}

// =====================
// 6) 配合度与格局评分
// =====================

export function evaluateCompatibility(
  yongshenElement: FiveElement | undefined,
  tiaohou: LayerB_Tiaohou,
): LayerC_FitAndGrade {
  let compatibility: Compatibility = "partial";
  let grade: Grade = "中";
  const direction = new Set(tiaohou.direction);

  if (!tiaohou.need) {
    compatibility = "match";
    grade = "高";
  } else {
    if (direction.has("火暖") && ["亥", "子", "丑", "寅"].includes(tiaohou.month_branch)) {
      compatibility = "match";
      grade = "高";
    }
    if (direction.has("水润") && ["巳", "午", "未"].includes(tiaohou.month_branch)) {
      compatibility = "match";
      grade = "高";
    }
  }

  if (yongshenElement === "水" && direction.has("燥化")) {
    compatibility = "mismatch";
    grade = "受限";
  }
  if (yongshenElement === "火" && direction.has("水润") && tiaohou.month_branch === "子") {
    if (compatibility === "match") compatibility = "partial";
    if (grade === "高") grade = "中";
  }

  return {
    compatibility,
    grade,
    notes: "根据月令与调候方向的基础匹配结果，可在调用层追加更细的冲突矩阵。",
  };
}

// =====================
// 7) Mermaid 渲染
// =====================

export function renderMermaid(output: OutputPayload, keyChainLabel = "链:关键"): string {
  const lines: string[] = [];
  lines.push("flowchart TD");
  lines.push("  A[体：食/伤/印/比劫] -->|生/泄| U[用：财/官/杀]");
  for (const edge of output.workflow.edges) {
    const weightLabel =
      typeof edge.weight === "number" ? ` (${edge.weight >= 0 ? "+" : ""}${edge.weight.toFixed(1)})` : "";
    lines.push(`  ${sanitize(edge.from)} --|${edge.effect}${weightLabel}|--> ${sanitize(edge.to)}`);
  }
  const directionLabel = output.layerB_tiaohou.direction.length
    ? output.layerB_tiaohou.direction.join("/")
    : "无";
  lines.push(`  TH[调候：${directionLabel}] --|上层校验|--> ${sanitize(keyChainLabel)}`);
  lines.push(`  ENV[月令：${output.layerB_tiaohou.month_branch}] --|影响|--> ${sanitize(keyChainLabel)}`);
  return ["```mermaid", ...lines, "```"].join("\n");
}

function sanitize(raw: string): string {
  return raw.replace(/[^\u4e00-\u9fa5A-Za-z0-9:_→]/g, "");
}

// =====================
// 8) 最小组合器
// =====================

export interface BuildOptions {
  endpoint: "财" | "官" | "杀";
  yongshen: string;
  jishen: string[];
  blockers: string[];
  reasoning: string;
  candidate_scope: string[];
  keyChainHint?: string;
  yongshenElement?: FiveElement;
  fourRulesOverride?: Partial<LayerA_DoGong["four_rules_check"]>;
}

export function buildOutput(input: InputChart, opt: BuildOptions): OutputPayload {
  const structural = relationsToStructuralFactors(input.relations);
  const edges = relationsToEdges(input.relations);
  const tiaohou = assessTiaohou(input.meta.month_branch, opt.keyChainHint);
  const layerBTiaohou: LayerB_Tiaohou = { month_branch: input.meta.month_branch, ...tiaohou };
  const fit = evaluateCompatibility(opt.yongshenElement, layerBTiaohou);

  const fourDefaults: LayerA_DoGong["four_rules_check"] = {
    guan_not_damaged: true,
    sha_has_control: true,
    shi_not_by_xiao: true,
    cai_not_by_jie: true,
  };

  const fourRules = { ...fourDefaults, ...opt.fourRulesOverride } as LayerA_DoGong["four_rules_check"];

  return {
    meta: input.meta,
    layerA_do_gong: {
      endpoint: opt.endpoint,
      candidate_scope: opt.candidate_scope,
      blockers: opt.blockers,
      yongshen: opt.yongshen,
      jishen: opt.jishen,
      reasoning: opt.reasoning,
      four_rules_check: fourRules,
    },
    layerB_tiaohou: layerBTiaohou,
    layerC_fit_and_grade: fit,
    structural_factors: structural,
    workflow: {
      steps: [
        "体→用主线",
        `标注阻断: ${opt.blockers.join("；")}`,
        `用神介入: ${opt.yongshen}（制/生）`,
        tiaohou.need ? `调候: ${tiaohou.direction.join("/")}（${tiaohou.why}）` : "调候: 不需要",
      ],
      edges,
    },
  };
}

// =====================
// 9) 示例（注释，用于文档）
// =====================

/*
const input: InputChart = {
  meta: { calendar: "solar", tz: "Asia/Shanghai", month_branch: "子", data_quality: "ok" },
  pillars: {
    year: { stem: "壬", branch: "申", hidden_stems: ["庚", "壬", "戊"] },
    month: { stem: "乙", branch: "卯", hidden_stems: ["乙"] },
    day: { stem: "甲", branch: "寅", hidden_stems: ["甲", "丙", "戊"] },
    hour: { stem: "戊", branch: "子", hidden_stems: ["癸"] },
  },
  ten_gods: {
    day_master: "甲",
    by_hidden: [
      { host: "寅", stem: "丙", god: "食神", weight: 0.6 },
      { host: "申", stem: "庚", god: "枭", weight: 0.5 },
      { host: "子", stem: "癸", god: "食神", weight: 1 },
    ],
  },
  relations: {
    stems: {
      he_pairs: [
        {
          a: "甲",
          b: "己",
          type: "合",
          may_transform_to: "土",
          evidence: { root: true, season_support: true },
          formed: false,
        },
      ],
    },
    branches: {
      chong: [{ a: "子", b: "午" }],
      sanhe: [{ group: ["申", "子", "辰"], towards: "水", formed: true }],
      liuhe: [{ a: "子", b: "丑", may_transform_to: "土" }],
    },
    lu_mu_ku: {
      lu: ["寅"],
      ku: ["辰", "丑", "未", "戌"],
      enter_ku: [{ who: "财(水)", in: "辰", strength: "强" }],
    },
  },
};

const result = buildOutput(input, {
  endpoint: "官",
  yongshen: "丙",
  jishen: ["枭", "劫"],
  blockers: ["枭克食", "劫夺财", "财入辰库"],
  reasoning: "先制枭复原食→财/官之路；冬水不生木需火暖；子午冲削弱水→木链。",
  candidate_scope: ["丙", "丁", "壬", "癸", "寅", "子", "申", "辰"],
  keyChainHint: "水→木",
  yongshenElement: "火",
});

console.log(renderMermaid(result));
*/
