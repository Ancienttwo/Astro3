/**
 * 星盘渲染API测试
 * Chart Render API Tests
 * 
 * @ai-context CHART_RENDER_TESTS
 * @preload jest, 渲染API, Hook格式数据
 * @algorithm-dependency ziwei-chart-render-tests
 */

import {
  // Hook格式API
  generateZiWeiHookChart,
  
  // 渲染API
  renderPalaceForWeb,
  renderPalaceForNative,
  generateIntegratedChart,
  generateQuickRender,
  ChartAPI,
  
  // 类型定义
  HookCalculationInput,
  RenderOptions,
  WebRenderData,
  NativeRenderData
} from '../index';

import { clearRenderCache } from '../api/chart-render-api';

describe('星盘渲染API测试', () => {
  // 清除缓存以确保测试独立性
  beforeEach(() => {
    clearRenderCache();
  });
  
  afterEach(() => {
    clearRenderCache();
  });

  const testBirthData: HookCalculationInput = {
    year: 1990,
    month: 1,
    day: 1,
    hour: 14,
    gender: "male",
    isLunar: false
  };

  const testRenderOptions: RenderOptions = {
    platform: 'web',
    showSihuaLines: true,
    compact: false,
    theme: 'light',
    fontSize: 'medium',
    showBrightness: true,
    showMajorPeriods: true
  };

  describe('Web渲染API', () => {
    it('应该生成有效的Web渲染数据', async () => {
      const hookChart = await generateZiWeiHookChart(testBirthData);
      const webData = renderPalaceForWeb({
        hookChart,
        options: testRenderOptions
      });

      expect(webData).toBeDefined();
      expect(webData.palaces).toHaveLength(12);
      expect(webData.centerInfo).toBeDefined();
      expect(webData.cssClasses).toBeDefined();
      expect(webData.layout).toBeDefined();
    });

    it('Web渲染数据应该包含正确的宫位信息', async () => {
      const hookChart = await generateZiWeiHookChart(testBirthData);
      const webData = renderPalaceForWeb({
        hookChart,
        options: testRenderOptions
      });

      const palace = webData.palaces[0]; // 子宫
      expect(palace.branch).toBe('子');
      expect(palace.branchIndex).toBe(0);
      expect(palace.palaceName).toBeDefined();
      expect(palace.stars).toBeInstanceOf(Array);
      expect(palace.strength).toMatch(/^(strong|normal|weak)$/);
      expect(typeof palace.isEmpty).toBe('boolean');
    });

    it('Web渲染数据应该包含CSS类名映射', async () => {
      const hookChart = await generateZiWeiHookChart(testBirthData);
      const webData = renderPalaceForWeb({
        hookChart,
        options: testRenderOptions
      });

      expect(webData.cssClasses.palace).toBeDefined();
      expect(webData.cssClasses.star).toBeDefined();
      expect(webData.cssClasses.sihua).toBeDefined();
      
      expect(webData.cssClasses.star['主星']).toBeDefined();
      expect(webData.cssClasses.sihua['禄']).toBeDefined();
    });
  });

  describe('Native渲染API', () => {
    it('应该生成有效的Native渲染数据', async () => {
      const hookChart = await generateZiWeiHookChart(testBirthData);
      const nativeData = renderPalaceForNative({
        hookChart,
        options: { ...testRenderOptions, platform: 'native' }
      });

      expect(nativeData).toBeDefined();
      expect(nativeData.palaces).toHaveLength(12);
      expect(nativeData.centerInfo).toBeDefined();
      expect(nativeData.dimensions).toBeDefined();
      expect(nativeData.theme).toBeDefined();
      expect(nativeData.interactions).toBeDefined();
    });

    it('Native渲染数据应该包含主题配置', async () => {
      const hookChart = await generateZiWeiHookChart(testBirthData);
      const nativeData = renderPalaceForNative({
        hookChart,
        options: { ...testRenderOptions, platform: 'native', theme: 'dark' }
      });

      expect(nativeData.theme.palace).toBeDefined();
      expect(nativeData.theme.stars).toBeDefined();
      expect(nativeData.theme.sihua).toBeDefined();
      
      // 暗色主题检查
      expect(nativeData.theme.palace.background).toBe('#2c2c2c');
      expect(nativeData.theme.palace.text).toBe('#ffffff');
    });

    it('Native渲染数据应该包含尺寸信息', async () => {
      const hookChart = await generateZiWeiHookChart(testBirthData);
      const nativeData = renderPalaceForNative({
        hookChart,
        options: { ...testRenderOptions, platform: 'native' }
      });

      expect(nativeData.dimensions.screenWidth).toBeGreaterThan(0);
      expect(nativeData.dimensions.screenHeight).toBeGreaterThan(0);
      expect(nativeData.dimensions.gridSize).toBeGreaterThan(0);
      expect(nativeData.dimensions.palaceSize).toBeGreaterThan(0);
    });
  });

  describe('集成API', () => {
    it('应该一次性生成完整数据', async () => {
      const result = await generateIntegratedChart(testBirthData, testRenderOptions);

      expect(result.hookChart).toBeDefined();
      expect(result.webRenderData).toBeDefined();
      expect(result.nativeRenderData).toBeDefined();
      expect(result.performance).toBeDefined();
      expect(result.generatedAt).toBeDefined();
      expect(result.version).toBeDefined();
    });

    it('ChartAPI快速方法应该正常工作', async () => {
      const webResult = await ChartAPI.web(testBirthData);
      expect(webResult.hookChart).toBeDefined();
      expect(webResult.renderData).toBeDefined();

      const nativeResult = await ChartAPI.native(testBirthData);
      expect(nativeResult.hookChart).toBeDefined();
      expect(nativeResult.renderData).toBeDefined();
    });

    it('快速渲染API应该基于现有Hook数据工作', async () => {
      const hookChart = await generateZiWeiHookChart(testBirthData);
      
      const webQuick = generateQuickRender(hookChart, 'web');
      expect(webQuick.renderData).toBeDefined();
      expect(webQuick.hookFingerprint).toBeDefined();
      expect(webQuick.optionsSnapshot).toBeDefined();

      const nativeQuick = generateQuickRender(hookChart, 'native');
      expect(nativeQuick.renderData).toBeDefined();
    });
  });

  describe('数据转换和优化', () => {
    it('星曜信息应该正确转换', async () => {
      const hookChart = await generateZiWeiHookChart(testBirthData);
      const webData = renderPalaceForWeb({
        hookChart,
        options: testRenderOptions
      });

      const palaceWithStars = webData.palaces.find(p => p.stars.length > 0);
      if (palaceWithStars) {
        const star = palaceWithStars.stars[0];
        expect(star.name).toBeDefined();
        expect(star.types).toBeInstanceOf(Array);
        expect(star.types.length).toBeGreaterThan(0);
        expect(star.color).toMatch(/^(primary|secondary|warning|danger|success)$/);
      }
    });

    it('四化连线应该正确生成', async () => {
      const hookChart = await generateZiWeiHookChart(testBirthData);
      const webData = renderPalaceForWeb({
        hookChart,
        options: { ...testRenderOptions, showSihuaLines: true }
      });

      if (webData.sihuaLines.length > 0) {
        const line = webData.sihuaLines[0];
        expect(line.from).toBeGreaterThanOrEqual(0);
        expect(line.from).toBeLessThan(12);
        expect(line.to).toBeGreaterThanOrEqual(0);
        expect(line.to).toBeLessThan(12);
        expect(line.type).toMatch(/^(禄|权|科|忌)$/);
        expect(line.starName).toBeDefined();
        expect(line.color).toBeDefined();
      }
    });

    it('中宫信息应该正确转换', async () => {
      const hookChart = await generateZiWeiHookChart(testBirthData);
      const webData = renderPalaceForWeb({
        hookChart,
        options: testRenderOptions
      });

      const centerInfo = webData.centerInfo;
      expect(centerInfo.gender).toMatch(/^(男|女)$/);
      expect(centerInfo.yearGanZhi).toBeDefined();
      expect(centerInfo.lunarDate).toBeDefined();
      expect(centerInfo.bureau.name).toBeDefined();
      expect(centerInfo.bureau.number).toBeDefined();
      expect(centerInfo.masters.life).toBeDefined();
      expect(centerInfo.masters.body).toBeDefined();
    });
  });

  describe('选项配置测试', () => {
    it('紧凑模式应该影响渲染结果', async () => {
      const hookChart = await generateZiWeiHookChart(testBirthData);
      
      const normalData = renderPalaceForWeb({
        hookChart,
        options: { ...testRenderOptions, compact: false }
      });
      
      const compactData = renderPalaceForWeb({
        hookChart,
        options: { ...testRenderOptions, compact: true }
      });

      expect(normalData).toBeDefined();
      expect(compactData).toBeDefined();
      // 紧凑模式的具体差异由实现决定
    });

    it('主题切换应该影响渲染结果', async () => {
      // Clear cache before this specific test
      clearRenderCache();
      
      const hookChart = await generateZiWeiHookChart(testBirthData);
      
      // Clear cache between calls
      clearRenderCache();
      
      const lightData = renderPalaceForNative({
        hookChart,
        options: { ...testRenderOptions, platform: 'native', theme: 'light' }
      });
      
      // Clear cache again
      clearRenderCache();
      
      const darkData = renderPalaceForNative({
        hookChart,
        options: { ...testRenderOptions, platform: 'native', theme: 'dark' }
      });

      expect(lightData.theme.palace.background).toBe('#ffffff');
      expect(darkData.theme.palace.background).toBe('#2c2c2c');
    });

    it('四化连线开关应该正常工作', async () => {
      const hookChart = await generateZiWeiHookChart(testBirthData);
      
      const withLines = renderPalaceForWeb({
        hookChart,
        options: { ...testRenderOptions, showSihuaLines: true }
      });
      
      const withoutLines = renderPalaceForWeb({
        hookChart,
        options: { ...testRenderOptions, showSihuaLines: false }
      });

      expect(withoutLines.sihuaLines).toHaveLength(0);
      // withLines的连线数量取决于实际的四化情况
    });
  });

  describe('错误处理', () => {
    it('应该处理无效的渲染选项', async () => {
      const hookChart = await generateZiWeiHookChart(testBirthData);
      
      // 测试无效主题
      expect(() => {
        renderPalaceForWeb({
          hookChart,
          options: { ...testRenderOptions, theme: 'invalid' as any }
        });
      }).not.toThrow(); // 应该使用默认值而不是抛出错误
    });

    it('应该处理空的Hook数据', () => {
      const emptyHookChart = {
        birthInfo: {
          year: 1990, month: 1, day: 1, hour: 14,
          gender: 'male' as const, isLunar: false,
          yearGanzhi: '庚午', monthGanzhi: '丁丑', dayGanzhi: '甲子', hourGanzhi: '辛未',
          monthLunar: 1, dayLunar: 1, isLeapMonth: false,
          solarDate: '1990-01-01', lunarDate: '1989-11-15'
        },
        八字: '庚午 丁丑 甲子 辛未',
        八字起运: '2岁起运',
        八字大运: '戊寅 己卯 庚辰 辛巳',
        命宫: '子',
        身宫: '丑',
        五行局: { name: '水二局', 局数: 2 },
        命主: '贪狼',
        身主: '太阴',
        子: { branch: '子', branchIndex: 0, stem: '甲', palaceName: '命宫', 
              "mainStars&sihuaStars": [], "auxiliaryStars&sihuaStars": [], minorStars: [],
              fleetingYears: [], majorPeriod: { period: 0, startAge: 0, endAge: 0, startYear: 0, endYear: 0 }, minorPeriod: []
            },
        丑: { branch: '丑', branchIndex: 1, stem: '乙', palaceName: '兄弟', 
              "mainStars&sihuaStars": [], "auxiliaryStars&sihuaStars": [], minorStars: [],
              fleetingYears: [], majorPeriod: { period: 0, startAge: 0, endAge: 0, startYear: 0, endYear: 0 }, minorPeriod: []
            },
        寅: { branch: '寅', branchIndex: 2, stem: '丙', palaceName: '夫妻', 
              "mainStars&sihuaStars": [], "auxiliaryStars&sihuaStars": [], minorStars: [],
              fleetingYears: [], majorPeriod: { period: 0, startAge: 0, endAge: 0, startYear: 0, endYear: 0 }, minorPeriod: []
            },
        卯: { branch: '卯', branchIndex: 3, stem: '丁', palaceName: '子女', 
              "mainStars&sihuaStars": [], "auxiliaryStars&sihuaStars": [], minorStars: [],
              fleetingYears: [], majorPeriod: { period: 0, startAge: 0, endAge: 0, startYear: 0, endYear: 0 }, minorPeriod: []
            },
        辰: { branch: '辰', branchIndex: 4, stem: '戊', palaceName: '财帛', 
              "mainStars&sihuaStars": [], "auxiliaryStars&sihuaStars": [], minorStars: [],
              fleetingYears: [], majorPeriod: { period: 0, startAge: 0, endAge: 0, startYear: 0, endYear: 0 }, minorPeriod: []
            },
        巳: { branch: '巳', branchIndex: 5, stem: '己', palaceName: '疾厄', 
              "mainStars&sihuaStars": [], "auxiliaryStars&sihuaStars": [], minorStars: [],
              fleetingYears: [], majorPeriod: { period: 0, startAge: 0, endAge: 0, startYear: 0, endYear: 0 }, minorPeriod: []
            },
        午: { branch: '午', branchIndex: 6, stem: '庚', palaceName: '迁移', 
              "mainStars&sihuaStars": [], "auxiliaryStars&sihuaStars": [], minorStars: [],
              fleetingYears: [], majorPeriod: { period: 0, startAge: 0, endAge: 0, startYear: 0, endYear: 0 }, minorPeriod: []
            },
        未: { branch: '未', branchIndex: 7, stem: '辛', palaceName: '交友', 
              "mainStars&sihuaStars": [], "auxiliaryStars&sihuaStars": [], minorStars: [],
              fleetingYears: [], majorPeriod: { period: 0, startAge: 0, endAge: 0, startYear: 0, endYear: 0 }, minorPeriod: []
            },
        申: { branch: '申', branchIndex: 8, stem: '壬', palaceName: '事业', 
              "mainStars&sihuaStars": [], "auxiliaryStars&sihuaStars": [], minorStars: [],
              fleetingYears: [], majorPeriod: { period: 0, startAge: 0, endAge: 0, startYear: 0, endYear: 0 }, minorPeriod: []
            },
        酉: { branch: '酉', branchIndex: 9, stem: '癸', palaceName: '田宅', 
              "mainStars&sihuaStars": [], "auxiliaryStars&sihuaStars": [], minorStars: [],
              fleetingYears: [], majorPeriod: { period: 0, startAge: 0, endAge: 0, startYear: 0, endYear: 0 }, minorPeriod: []
            },
        戌: { branch: '戌', branchIndex: 10, stem: '甲', palaceName: '福德', 
              "mainStars&sihuaStars": [], "auxiliaryStars&sihuaStars": [], minorStars: [],
              fleetingYears: [], majorPeriod: { period: 0, startAge: 0, endAge: 0, startYear: 0, endYear: 0 }, minorPeriod: []
            },
        亥: { branch: '亥', branchIndex: 11, stem: '乙', palaceName: '父母', 
              "mainStars&sihuaStars": [], "auxiliaryStars&sihuaStars": [], minorStars: [],
              fleetingYears: [], majorPeriod: { period: 0, startAge: 0, endAge: 0, startYear: 0, endYear: 0 }, minorPeriod: []
            }
      } as any;

      expect(() => {
        renderPalaceForWeb({
          hookChart: emptyHookChart,
          options: testRenderOptions
        });
      }).not.toThrow();
    });
  });
});