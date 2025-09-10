import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { YongShenData } from '@/lib/services/yongshen-extractor';

// 类型定义
export interface BirthData {
  username: string;
  year: string;
  month: string;
  day: string;
  hour: string;
  gender: string;
  category: string;
}

export interface Pillar {
  heavenlyStem: string;
  earthlyBranch: string;
  element: string;
  animal: string;
}

export interface BaziResult {
  year: Pillar;
  month: Pillar;
  day: Pillar;
  hour: Pillar;
  luck: {
    current: string;
    next: string;
  };
  elements: {
    wood: number;
    fire: number;
    earth: number;
    metal: number;
    water: number;
  };
}

export interface LuckCycle {
  age: number;
  year: number;
  ganZhi: string;
  gan: string;
  zhi: string;
  ganTenGod: string;
  zhiTenGod: string;
}

export interface FleetingYear {
  year: number;
  gan: string;
  zhi: string;
  ganTenGod: string;
  zhiTenGod: string;
}

// 状态接口
interface BaziState {
  // 基础数据
  birthData: BirthData;
  baziResult: BaziResult | null;
  
  // 计算状态
  isCalculating: boolean;
  
  // 辅助信息
  lunarDateString: string | null;
  luckInfo: string | null;
  
  // 大运流年
  luckCycles: LuckCycle[] | null;
  selectedLuckCycle: LuckCycle | null;
  fleetingYears: FleetingYear[] | null;
  
  // 用神信息
  currentYongShen: YongShenData | null;
  
  // UI 状态
  showMenu: boolean;
  pendingSave: boolean;
  
  // 操作方法
  setBirthData: (data: Partial<BirthData>) => void;
  setBaziResult: (result: BaziResult | null) => void;
  setIsCalculating: (calculating: boolean) => void;
  setLunarDateString: (dateString: string | null) => void;
  setLuckInfo: (info: string | null) => void;
  setLuckCycles: (cycles: LuckCycle[] | null) => void;
  setSelectedLuckCycle: (cycle: LuckCycle | null) => void;
  setFleetingYears: (years: FleetingYear[] | null) => void;
  setCurrentYongShen: (yongShen: YongShenData | null) => void;
  setShowMenu: (show: boolean) => void;
  setPendingSave: (pending: boolean) => void;
  
  // 复合操作
  resetAll: () => void;
  updateBirthDataField: (field: keyof BirthData, value: string) => void;
  loadChartData: (chartData: any) => void;
}

// 初始状态
const initialState = {
  birthData: {
    username: "",
    year: "",
    month: "",
    day: "",
    hour: "",
    gender: "",
    category: "others",
  },
  baziResult: null,
  isCalculating: false,
  lunarDateString: null,
  luckInfo: null,
  luckCycles: null,
  selectedLuckCycle: null,
  fleetingYears: null,
  currentYongShen: null,
  showMenu: false,
  pendingSave: false,
};

// 创建 store
export const useBaziStore = create<BaziState>()(
  subscribeWithSelector(
    immer((set, get) => ({
      ...initialState,
      
      // 基础设置方法
      setBirthData: (data) => set((state) => {
        Object.assign(state.birthData, data);
      }),
      
      setBaziResult: (result) => set((state) => {
        state.baziResult = result;
      }),
      
      setIsCalculating: (calculating) => set((state) => {
        state.isCalculating = calculating;
      }),
      
      setLunarDateString: (dateString) => set((state) => {
        state.lunarDateString = dateString;
      }),
      
      setLuckInfo: (info) => set((state) => {
        state.luckInfo = info;
      }),
      
      setLuckCycles: (cycles) => set((state) => {
        state.luckCycles = cycles;
      }),
      
      setSelectedLuckCycle: (cycle) => set((state) => {
        state.selectedLuckCycle = cycle;
      }),
      
      setFleetingYears: (years) => set((state) => {
        state.fleetingYears = years;
      }),
      
      setCurrentYongShen: (yongShen) => set((state) => {
        state.currentYongShen = yongShen;
      }),
      
      setShowMenu: (show) => set((state) => {
        state.showMenu = show;
      }),
      
      setPendingSave: (pending) => set((state) => {
        state.pendingSave = pending;
      }),
      
      // 复合操作
      resetAll: () => set((state) => {
        Object.assign(state, initialState);
      }),
      
      updateBirthDataField: (field, value) => set((state) => {
        state.birthData[field] = value;
      }),
      
      loadChartData: (chartData) => set((state) => {
        // 🔥 添加调试信息
        console.log('🔍 loadChartData接收到的数据:', chartData);
        
        // 从命盘数据加载到birth data
        const newBirthData = {
          username: chartData.name,
          year: chartData.birth_year.toString(),
          month: chartData.birth_month.toString(),
          day: chartData.birth_day.toString(),
          hour: chartData.birth_hour.toString(),
          gender: chartData.gender,
          category: chartData.category || 'others'
        };
        
        console.log('🔍 设置的birthData:', newBirthData);
        
        state.birthData = newBirthData;
      }),
    }))
  )
);

// 选择器 - 用于获取衍生状态
export const useBaziSelectors = () => {
  const store = useBaziStore();
  
  return {
    // 基础数据
    birthData: store.birthData,
    baziResult: store.baziResult,
    
    // 计算状态
    isCalculating: store.isCalculating,
    
    // 辅助信息
    lunarDateString: store.lunarDateString,
    luckInfo: store.luckInfo,
    
    // 大运流年
    luckCycles: store.luckCycles,
    selectedLuckCycle: store.selectedLuckCycle,
    fleetingYears: store.fleetingYears,
    
    // 用神信息
    currentYongShen: store.currentYongShen,
    
    // UI 状态
    showMenu: store.showMenu,
    pendingSave: store.pendingSave,
    
    // 衍生状态
    hasValidBirthData: store.birthData.year && store.birthData.month && 
                       store.birthData.day && store.birthData.hour && 
                       store.birthData.gender && store.birthData.username,
    
    hasBaziResult: !!store.baziResult,
    
    dayMaster: store.baziResult?.day?.heavenlyStem || '',
    
    // 检查是否需要保存
    shouldSave: store.pendingSave && store.baziResult && 
               store.birthData.username && store.birthData.year,
  };
};

// 操作方法选择器
export const useBaziActions = () => {
  const store = useBaziStore();
  
  return {
    setBirthData: store.setBirthData,
    setBaziResult: store.setBaziResult,
    setIsCalculating: store.setIsCalculating,
    setLunarDateString: store.setLunarDateString,
    setLuckInfo: store.setLuckInfo,
    setLuckCycles: store.setLuckCycles,
    setSelectedLuckCycle: store.setSelectedLuckCycle,
    setFleetingYears: store.setFleetingYears,
    setCurrentYongShen: store.setCurrentYongShen,
    setShowMenu: store.setShowMenu,
    setPendingSave: store.setPendingSave,
    resetAll: store.resetAll,
    updateBirthDataField: store.updateBirthDataField,
    loadChartData: store.loadChartData,
  };
};

// 导出类型
export type { BaziState }; 