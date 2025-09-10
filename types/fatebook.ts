/**
 * 命书模块统一类型定义
 * 
 * 这个文件包含了命书模块的所有核心类型定义，
 * 提供了清晰的领域模型和数据结构。
 */

// ========== 基础类型 ==========

export type ChartType = 'bazi' | 'ziwei';
export type Gender = 'male' | 'female';
export type ChartCategory = 'friends' | 'family' | 'clients' | 'favorites' | 'others';

export type AnalysisType = 
  | 'yongshen_analysis'   // 用神分析
  | 'tiekou_zhiduan'      // 铁口直断
  | 'ziwei_reasoning'     // 紫微推理
  | 'sihua_reasoning'     // 四化分析
  | 'bazi_analysis'       // 八字分析
  | 'ziwei_analysis';     // 紫微分析

// ========== 核心实体 ==========

/**
 * 出生信息
 */
export interface BirthInfo {
  year: number;
  month: number;
  day: number;
  hour: number;
  gender: Gender;
}

/**
 * 时间戳信息
 */
export interface Timestamps {
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 用神信息
 */
export interface YongShenInfo {
  primaryYongShen: string;        // 主用神
  secondaryYongShen?: string;     // 辅用神
  jiShen: string[];               // 忌神
  geLu: string;                   // 格局
  analysisDate: string;           // 分析日期
  confidence: number;             // 置信度 (0-1)
  summary: string;                // 总结
}

/**
 * AI分析元数据
 */
export interface AnalysisMetadata {
  characterCount: number;         // 字符数
  confidence: number;             // 置信度
  poweredBy: string;              // 分析引擎
  processingTime?: number;        // 处理时间(ms)
  version?: string;               // 分析版本
}

/**
 * AI分析结果
 */
export interface AIAnalysis {
  id: string;
  chartId: string;
  type: AnalysisType;
  content: string;
  metadata: AnalysisMetadata;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 命盘元数据
 */
export interface ChartMetadata {
  yongShenInfo?: YongShenInfo;    // 用神信息
  tags?: string[];                // 标签
  notes?: string;                 // 备注
  customFields?: Record<string, any>; // 自定义字段
}

/**
 * 命盘记录 - 核心实体
 */
export interface ChartRecord {
  id: string;
  userId: string;
  name: string;
  birthInfo: BirthInfo;
  chartType: ChartType;
  category: ChartCategory;
  metadata: ChartMetadata;
  timestamps: Timestamps;
}

// ========== DTO类型 ==========

/**
 * 创建命盘DTO
 */
export interface CreateChartDTO {
  name: string;
  birthInfo: BirthInfo;
  chartType: ChartType;
  category: ChartCategory;
  metadata?: Partial<ChartMetadata>;
}

/**
 * 更新命盘DTO
 */
export interface UpdateChartDTO {
  name?: string;
  birthInfo?: Partial<BirthInfo>;
  category?: ChartCategory;
  metadata?: Partial<ChartMetadata>;
}

/**
 * 创建分析DTO
 */
export interface CreateAnalysisDTO {
  chartId: string;
  type: AnalysisType;
  content: string;
  metadata: AnalysisMetadata;
}

/**
 * 更新分析DTO
 */
export interface UpdateAnalysisDTO {
  content?: string;
  metadata?: Partial<AnalysisMetadata>;
}

// ========== 查询和过滤类型 ==========

/**
 * 命盘查询参数
 */
export interface ChartQueryParams {
  chartType?: ChartType;
  category?: ChartCategory;
  search?: string;               // 搜索关键词
  limit?: number;                // 限制数量
  offset?: number;               // 偏移量
  sortBy?: 'name' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

/**
 * 分析查询参数
 */
export interface AnalysisQueryParams {
  chartId?: string;
  type?: AnalysisType;
  limit?: number;
  offset?: number;
  sortBy?: 'createdAt' | 'type';
  sortOrder?: 'asc' | 'desc';
}

// ========== 响应类型 ==========

/**
 * API响应基础类型
 */
export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * 用户档案响应类型
 */
export interface UserProfileResponse {
  success: boolean;
  profile: any;
  error?: string;
  message?: string;
}

/**
 * 分页响应类型
 */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  error?: string;
}

/**
 * 命盘列表响应
 */
export type ChartListResponse = PaginatedResponse<ChartRecord>;

/**
 * 分析列表响应
 */
export type AnalysisListResponse = PaginatedResponse<AIAnalysis>;

// ========== 状态类型 ==========

/**
 * 加载状态
 */
export interface LoadingState {
  loading: boolean;
  error: string | null;
}

/**
 * 命盘状态
 */
export interface ChartState extends LoadingState {
  charts: ChartRecord[];
  selectedChart: ChartRecord | null;
  searchQuery: string;
  filters: {
    chartType?: ChartType;
    category?: ChartCategory;
  };
}

/**
 * 分析状态
 */
export interface AnalysisState extends LoadingState {
  analyses: Record<string, AIAnalysis[]>; // chartId -> analyses
  selectedAnalysis: AIAnalysis | null;
}

// ========== 组件Props类型 ==========

/**
 * 基础组件Props
 */
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

/**
 * 命盘卡片Props
 */
export interface ChartCardProps extends BaseComponentProps {
  chart: ChartRecord;
  isSelected?: boolean;
  onSelect?: (chart: ChartRecord) => void;
  onDelete?: (chart: ChartRecord) => void;
  onEdit?: (chart: ChartRecord) => void;
  onViewAnalysis?: (chart: ChartRecord) => void;
}

/**
 * 命盘列表Props
 */
export interface ChartListProps extends BaseComponentProps {
  charts: ChartRecord[];
  selectedChartId?: string;
  onSelectChart?: (chart: ChartRecord) => void;
  onDeleteChart?: (chart: ChartRecord) => void;
  onEditChart?: (chart: ChartRecord) => void;
  loading?: boolean;
  error?: string | null;
}

/**
 * 命盘表单Props
 */
export interface ChartFormProps extends BaseComponentProps {
  chart?: ChartRecord;
  onSave?: (chart: CreateChartDTO | UpdateChartDTO) => void;
  onCancel?: () => void;
  loading?: boolean;
}

/**
 * 分析面板Props
 */
export interface AnalysisPanelProps extends BaseComponentProps {
  chartId: string;
  analyses: AIAnalysis[];
  onDeleteAnalysis?: (analysis: AIAnalysis) => void;
  onViewAnalysis?: (analysis: AIAnalysis) => void;
  loading?: boolean;
  error?: string | null;
}

// ========== 事件类型 ==========

/**
 * 命盘事件
 */
export interface ChartEvents {
  onChartCreate: (chart: ChartRecord) => void;
  onChartUpdate: (chart: ChartRecord) => void;
  onChartDelete: (chartId: string) => void;
  onChartSelect: (chart: ChartRecord | null) => void;
}

/**
 * 分析事件
 */
export interface AnalysisEvents {
  onAnalysisCreate: (analysis: AIAnalysis) => void;
  onAnalysisDelete: (analysisId: string) => void;
  onAnalysisView: (analysis: AIAnalysis) => void;
}

// ========== 工具类型 ==========

/**
 * 分类标签映射
 */
export const CATEGORY_LABELS: Record<ChartCategory, string> = {
  friends: '朋友',
  family: '家人',
  clients: '客户',
  favorites: '最爱',
  others: '其他'
};

/**
 * 分析类型标签映射
 */
export const ANALYSIS_TYPE_LABELS: Record<AnalysisType, string> = {
  yongshen_analysis: '用神大师',
  tiekou_zhiduan: '铁口直断',
  ziwei_reasoning: '紫微推理',
  sihua_reasoning: '四化分析',
  bazi_analysis: '八字分析',
  ziwei_analysis: '紫微分析'
};

/**
 * 性别标签映射
 */
export const GENDER_LABELS: Record<Gender, string> = {
  male: '男',
  female: '女'
};

/**
 * 命盘类型标签映射
 */
export const CHART_TYPE_LABELS: Record<ChartType, string> = {
  bazi: '八字',
  ziwei: '紫微'
};

// ========== 验证类型 ==========

/**
 * 验证错误
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * 表单验证结果
 */
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// ========== 类型已通过各自的声明导出 ==========
// 所有的 interface 和 type 都已经在定义时使用 export 关键字导出
// 不需要再次集中导出，避免重复导出错误 