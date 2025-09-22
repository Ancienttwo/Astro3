/**
 * useZiWeiStore - Zustand store for ZiWei chart state management
 * 紫微斗数状态管理存储
 * 
 * 数据流: 用户输入 → 算法计算 → 存储到Store → UI组件读取
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type {
  CompleteChart,
  BirthInfo,
  CalculationOptions,
  PalaceName,
  Star,
  SihuaTransformation,
} from '../types/core';
import { ZiWeiFacade } from '../facade/ziwei-facade';

/**
 * Store state interface
 */
export interface ZiWeiStoreState {
  // Chart data
  currentChart: CompleteChart | null;
  chartHistory: CompleteChart[];
  savedCharts: Map<string, CompleteChart>;
  
  // UI state
  selectedPalace: PalaceName | null;
  highlightedStars: Set<string>;
  viewMode: 'chart' | 'list' | 'analysis';
  showSihua: boolean;
  showStarDetails: boolean;
  
  // Calculation state
  isCalculating: boolean;
  lastCalculation: Date | null;
  calculationError: Error | null;
  
  // Preferences
  defaultOptions: CalculationOptions;
  colorScheme: 'traditional' | 'modern' | 'custom';
  language: 'zh-CN' | 'zh-TW' | 'en';
}

/**
 * Store actions interface
 */
export interface ZiWeiStoreActions {
  // Chart calculation
  calculateChart: (birthInfo: BirthInfo, options?: CalculationOptions) => Promise<void>;
  recalculateChart: () => Promise<void>;
  clearChart: () => void;
  
  // Chart management
  saveChart: (name: string, chart?: CompleteChart) => void;
  loadChart: (name: string) => void;
  deleteChart: (name: string) => void;
  
  // History
  addToHistory: (chart: CompleteChart) => void;
  loadFromHistory: (index: number) => void;
  clearHistory: () => void;
  
  // UI interactions
  selectPalace: (palaceName: PalaceName | null) => void;
  toggleStarHighlight: (starName: string) => void;
  clearHighlights: () => void;
  setViewMode: (mode: 'chart' | 'list' | 'analysis') => void;
  toggleSihua: () => void;
  toggleStarDetails: () => void;
  
  // Preferences
  updateDefaultOptions: (options: Partial<CalculationOptions>) => void;
  setColorScheme: (scheme: 'traditional' | 'modern' | 'custom') => void;
  setLanguage: (lang: 'zh-CN' | 'zh-TW' | 'en') => void;
  
  // Utility
  reset: () => void;
}

/**
 * Complete store type
 */
export type ZiWeiStore = ZiWeiStoreState & ZiWeiStoreActions;

// Singleton facade instance
let facadeInstance: ZiWeiFacade | null = null;
const getFacade = () => {
  if (!facadeInstance) {
    facadeInstance = new ZiWeiFacade();
  }
  return facadeInstance;
};

/**
 * Initial state
 */
const initialState: ZiWeiStoreState = {
  // Chart data
  currentChart: null,
  chartHistory: [],
  savedCharts: new Map(),
  
  // UI state
  selectedPalace: null,
  highlightedStars: new Set(),
  viewMode: 'chart',
  showSihua: true,
  showStarDetails: false,
  
  // Calculation state
  isCalculating: false,
  lastCalculation: null,
  calculationError: null,
  
  // Preferences
  defaultOptions: {
    includeMinorStars: true,
    calculateSelfTransformations: true,
    calculateRelationships: false,
  },
  colorScheme: 'traditional',
  language: 'zh-CN',
};

/**
 * Create the Zustand store
 */
export const useZiWeiStore = create<ZiWeiStore>()(
  devtools(
    persist(
      immer((set, get) => ({
        // State
        ...initialState,
        
        // Actions
        
        // Chart calculation
        calculateChart: async (birthInfo: BirthInfo, options?: CalculationOptions) => {
          set((state) => {
            state.isCalculating = true;
            state.calculationError = null;
          });
          
          try {
            const facade = getFacade();
            const chart = await facade.calculateCompleteChart(
              birthInfo,
              options || get().defaultOptions
            );
            
            set((state) => {
              state.currentChart = chart;
              state.lastCalculation = new Date();
              state.isCalculating = false;
              
              // Add to history
              state.chartHistory.push(chart);
              if (state.chartHistory.length > 10) {
                state.chartHistory.shift(); // Keep max 10 in history
              }
            });
          } catch (error) {
            set((state) => {
              state.calculationError = error instanceof Error ? error : new Error('Calculation failed');
              state.isCalculating = false;
            });
          }
        },
        
        recalculateChart: async () => {
          const { currentChart, defaultOptions } = get();
          if (!currentChart) return;
          
          const birthInfo: BirthInfo = {
            year: currentChart.birthInfo.year,
            month: currentChart.birthInfo.month,
            day: currentChart.birthInfo.day,
            hour: currentChart.birthInfo.hour,
            minute: currentChart.birthInfo.minute,
            gender: currentChart.birthInfo.gender,
            isLunar: currentChart.birthInfo.isLunar,
            isLeapMonth: currentChart.birthInfo.isLeapMonth,
          };
          
          await get().calculateChart(birthInfo, defaultOptions);
        },
        
        clearChart: () => {
          set((state) => {
            state.currentChart = null;
            state.selectedPalace = null;
            state.highlightedStars.clear();
            state.calculationError = null;
          });
        },
        
        // Chart management
        saveChart: (name: string, chart?: CompleteChart) => {
          const chartToSave = chart || get().currentChart;
          if (!chartToSave) return;
          
          set((state) => {
            state.savedCharts.set(name, chartToSave);
          });
        },
        
        loadChart: (name: string) => {
          const chart = get().savedCharts.get(name);
          if (!chart) return;
          
          set((state) => {
            state.currentChart = chart;
            state.selectedPalace = null;
            state.highlightedStars.clear();
          });
        },
        
        deleteChart: (name: string) => {
          set((state) => {
            state.savedCharts.delete(name);
          });
        },
        
        // History
        addToHistory: (chart: CompleteChart) => {
          set((state) => {
            state.chartHistory.push(chart);
            if (state.chartHistory.length > 10) {
              state.chartHistory.shift();
            }
          });
        },
        
        loadFromHistory: (index: number) => {
          const chart = get().chartHistory[index];
          if (!chart) return;
          
          set((state) => {
            state.currentChart = chart;
            state.selectedPalace = null;
            state.highlightedStars.clear();
          });
        },
        
        clearHistory: () => {
          set((state) => {
            state.chartHistory = [];
          });
        },
        
        // UI interactions
        selectPalace: (palaceName: PalaceName | null) => {
          set((state) => {
            state.selectedPalace = palaceName;
          });
        },
        
        toggleStarHighlight: (starName: string) => {
          set((state) => {
            if (state.highlightedStars.has(starName)) {
              state.highlightedStars.delete(starName);
            } else {
              state.highlightedStars.add(starName);
            }
          });
        },
        
        clearHighlights: () => {
          set((state) => {
            state.highlightedStars.clear();
          });
        },
        
        setViewMode: (mode: 'chart' | 'list' | 'analysis') => {
          set((state) => {
            state.viewMode = mode;
          });
        },
        
        toggleSihua: () => {
          set((state) => {
            state.showSihua = !state.showSihua;
          });
        },
        
        toggleStarDetails: () => {
          set((state) => {
            state.showStarDetails = !state.showStarDetails;
          });
        },
        
        // Preferences
        updateDefaultOptions: (options: Partial<CalculationOptions>) => {
          set((state) => {
            state.defaultOptions = { ...state.defaultOptions, ...options };
          });
        },
        
        setColorScheme: (scheme: 'traditional' | 'modern' | 'custom') => {
          set((state) => {
            state.colorScheme = scheme;
          });
        },
        
        setLanguage: (lang: 'zh-CN' | 'zh-TW' | 'en') => {
          set((state) => {
            state.language = lang;
          });
        },
        
        // Utility
        reset: () => {
          set(() => initialState);
        },
      })),
      {
        name: 'ziwei-store',
        partialize: (state) => ({
          savedCharts: Array.from(state.savedCharts.entries()),
          defaultOptions: state.defaultOptions,
          colorScheme: state.colorScheme,
          language: state.language,
        }),
        onRehydrateStorage: () => (state) => {
          if (state && Array.isArray(state.savedCharts)) {
            state.savedCharts = new Map(state.savedCharts);
          }
        },
      }
    ),
    {
      name: 'ZiWeiStore',
    }
  )
);

/**
 * Selector hooks
 */
export const useCurrentChart = () => useZiWeiStore((state) => state.currentChart);
export const useSelectedPalace = () => useZiWeiStore((state) => state.selectedPalace);
export const useHighlightedStars = () => useZiWeiStore((state) => state.highlightedStars);
export const useViewMode = () => useZiWeiStore((state) => state.viewMode);
export const useCalculationState = () => useZiWeiStore((state) => ({
  isCalculating: state.isCalculating,
  error: state.calculationError,
  lastCalculation: state.lastCalculation,
}));

/**
 * Action hooks
 */
export const useChartActions = () => useZiWeiStore((state) => ({
  calculateChart: state.calculateChart,
  recalculateChart: state.recalculateChart,
  clearChart: state.clearChart,
  saveChart: state.saveChart,
  loadChart: state.loadChart,
}));

export const useUIActions = () => useZiWeiStore((state) => ({
  selectPalace: state.selectPalace,
  toggleStarHighlight: state.toggleStarHighlight,
  clearHighlights: state.clearHighlights,
  setViewMode: state.setViewMode,
  toggleSihua: state.toggleSihua,
  toggleStarDetails: state.toggleStarDetails,
}));

export const usePreferences = () => useZiWeiStore((state) => ({
  defaultOptions: state.defaultOptions,
  colorScheme: state.colorScheme,
  language: state.language,
  updateDefaultOptions: state.updateDefaultOptions,
  setColorScheme: state.setColorScheme,
  setLanguage: state.setLanguage,
}));
