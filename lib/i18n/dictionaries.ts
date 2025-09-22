// 英文版界面文字国际化字典
// 注意：排盘术语（天干地支、宫位、星曜等）保持中文，只翻译UI界面元素

export interface Dictionary {
  // 通用界面元素
  common: {
    calculate: string;
    save: string;
    clear: string;
    cancel: string;
    confirm: string;
    loading: string;
    error: string;
    success: string;
    submit: string;
    reset: string;
    back: string;
    next: string;
    search: string;
    filter: string;
    refresh: string;
    close: string;
    edit: string;
    delete: string;
    add: string;
    create: string;
    menu: string;
    all: string;
  };
  
  // 表单字段
  form: {
    name: string;
    birthYear: string;
    birthMonth: string;
    birthDay: string;
    birthHour: string;
    gender: string;
    male: string;
    female: string;
    category: string;
    email: string;
    password: string;
    year: string;
    month: string;
    day: string;
    hour: string;
    currentSelection: string;
    birthTimeRange: string;
  };
  
  // 页面标题
  pages: {
    bazi: {
      title: string;
      subtitle: string;
    };
    ziwei: {
      title: string;
      subtitle: string;
    };
    auth: {
      title: string;
      subtitle: string;
    };
    settings: {
      title: string;
      subtitle: string;
    };
    charts: {
      title: string;
      subtitle: string;
    };
    createChart: {
      title: string;
      subtitle: string;
    };
    wiki: {
      title: string;
      subtitle: string;
    };
  };
  
  // 操作说明
  instructions: {
    fillForm: string;
    clickCalculate: string;
    saveChart: string;
  };
  
  // 错误信息
  errors: {
    invalidInput: string;
    networkError: string;
    authRequired: string;
  };
  
  // 分类选项
  categories: {
    friends: string;
    family: string;
    clients: string;
    favorites: string;
    others: string;
  };

  // 来因宫 (宿世因缘)
  karmaPalace: {
    title: string;
    whatIsKarmaPalace: string;
    whatIsKarmaPalaceDesc: string;
    importanceOfKarmaPalace: string;
    importanceOfKarmaPalaceDesc: string;
    yourKarmaPalaceIn: string;
    peopleAspect: string;
    mattersAspect: string;
    materialAspect: string;
    palaceReference: string;
    palaceReferenceDesc: string;
    palaceNames: {
      self: string;
      siblings: string;
      spouse: string;
      children: string;
      wealth: string;
      health: string;
      travel: string;
      friends: string;
      career: string;
      property: string;
      fortune: string;
      parents: string;
    };
  };

  // 紫微斗数系统翻译
  ziwei: {
    // 基本概念
    concepts: {
      systemName: string;
      systemAlias: string;
      description: string;
      nickname: string;
      ultimateSystem: string;
      purpleStarAstrology: string;
      emperorOfChineseAstrology: string;
      cosmicBlueprint: string;
      precisionLifeEngineering: string;
      imperialGradeDestinyAnalysis: string;
    };
    
         // 十四主星
     primaryStars: {
       ziwei: string;        // 紫微 = Emperor Star
       tianji: string;       // 天机 = Wisdom Star  
       taiyang: string;      // 太阳 = Solar Star
       wuqu: string;         // 武曲 = Martial Wealth Star
       tiantong: string;     // 天同 = Harmonizer Star
       lianzhou: string;     // 廉贞 = Paradox Star
       tianfu: string;       // 天府 = Treasurer Star
       taiyin: string;       // 太阴 = Lunar Star
       tanlang: string;      // 贪狼 = Desire Star
       jumen: string;        // 巨门 = Great Gate Star
       tianxiang: string;    // 天相 = Minister Star
       tianliang: string;    // 天梁 = Mentor Star
       qisha: string;        // 七杀 = Killings Star
       pojun: string;        // 破军 = Revolution Star
     };
     
     // 主星详细信息
     starDetails: {
       ziwei: {
         coreEssence: string;
         symbolism: string;
         keyTraits: string[];
         idealCareers: string;
         relationshipStyle: string;
         lifeApproach: string;
         challenges: string;
       };
       tianji: {
         coreEssence: string;
         symbolism: string;
         keyTraits: string[];
         idealCareers: string;
         relationshipStyle: string;
         lifeApproach: string;
         challenges: string;
       };
       taiyang: {
         coreEssence: string;
         symbolism: string;
         keyTraits: string[];
         idealCareers: string;
         relationshipStyle: string;
         lifeApproach: string;
         challenges: string;
       };
       wuqu: {
         coreEssence: string;
         symbolism: string;
         keyTraits: string[];
         idealCareers: string;
         relationshipStyle: string;
         lifeApproach: string;
         challenges: string;
       };
       tiantong: {
         coreEssence: string;
         symbolism: string;
         keyTraits: string[];
         idealCareers: string;
         relationshipStyle: string;
         lifeApproach: string;
         challenges: string;
       };
       lianzhou: {
         coreEssence: string;
         symbolism: string;
         keyTraits: string[];
         idealCareers: string;
         relationshipStyle: string;
         lifeApproach: string;
         challenges: string;
       };
       tianfu: {
         coreEssence: string;
         symbolism: string;
         keyTraits: string[];
         idealCareers: string;
         relationshipStyle: string;
         lifeApproach: string;
         challenges: string;
       };
       taiyin: {
         coreEssence: string;
         symbolism: string;
         keyTraits: string[];
         idealCareers: string;
         relationshipStyle: string;
         lifeApproach: string;
         challenges: string;
       };
       tanlang: {
         coreEssence: string;
         symbolism: string;
         keyTraits: string[];
         idealCareers: string;
         relationshipStyle: string;
         lifeApproach: string;
         challenges: string;
       };
       jumen: {
         coreEssence: string;
         symbolism: string;
         keyTraits: string[];
         idealCareers: string;
         relationshipStyle: string;
         lifeApproach: string;
         challenges: string;
       };
       tianxiang: {
         coreEssence: string;
         symbolism: string;
         keyTraits: string[];
         idealCareers: string;
         relationshipStyle: string;
         lifeApproach: string;
         challenges: string;
       };
       tianliang: {
         coreEssence: string;
         symbolism: string;
         keyTraits: string[];
         idealCareers: string;
         relationshipStyle: string;
         lifeApproach: string;
         challenges: string;
       };
       qisha: {
         coreEssence: string;
         symbolism: string;
         keyTraits: string[];
         idealCareers: string;
         relationshipStyle: string;
         lifeApproach: string;
         challenges: string;
       };
       pojun: {
         coreEssence: string;
         symbolism: string;
         keyTraits: string[];
         idealCareers: string;
         relationshipStyle: string;
         lifeApproach: string;
         challenges: string;
       };
     };
    
         // 辅助星
     supportingStars: {
       // 左右星
       zuofu: string;        // 左辅 = Left Assistant Star
       youbi: string;        // 右弼 = Right Assistant Star
       
       // 文星
       wenchang: string;     // 文昌 = Literary Excellence Star
       wenqu: string;        // 文曲 = Literary Arts Star
       
       // 天魁天钺
       tiankui: string;      // 天魁 = Sky Leader Star
       tianyue: string;      // 天钺 = Sky Honor Star
       
       // 六煞星
       qingyang: string;     // 擎羊 = Ram Star
       tuoluo: string;       // 陀罗 = Spiral Star
       huoxing: string;      // 火星 = Mars Star
       lingxing: string;     // 铃星 = Bell Star
       dikong: string;       // 地空 = Void Star
       dijie: string;        // 地劫 = Robbery Star
       
       // 其他重要辅星
       tianma: string;       // 天马 = Traveling Horse Star
       hongyan: string;      // 红鸾 = Red Phoenix Star
       tianxi: string;       // 天喜 = Happiness Star
       gukua: string;        // 孤寡 = Loneliness Star
     };
     
     // 辅助星功能描述
     supportingStarFunctions: {
       wenchang: string;     // Academic achievement
       wenqu: string;        // Artistic talent
       zuofuyoubi: string;   // Helpful people
       tiankuitianyue: string; // Noble mentors
       huoxinglingxing: string; // Explosive energy, conflicts
       tianma: string;       // Travel and movement
       hongyantianxi: string; // Romance and marriage
       dikongdijie: string;  // Spiritual void and material loss
       qingyangtuoluo: string; // Obstacles and delays
       gukua: string;        // Loneliness and independence
     };
    
    // 十二宫位
    palaces: {
      ming: string;         // 命宫 = Life Palace
      xiongdi: string;      // 兄弟 = Siblings Palace
      fuqi: string;         // 夫妻 = Marriage Palace / Spouse Palace
      zinv: string;         // 子女 = Children Palace
      caibo: string;        // 财帛 = Wealth Palace
      jie: string;          // 疾厄 = Health Palace
      qianyi: string;       // 迁移 = Travel Palace
      jiaoyou: string;      // 交友 = Friends Palace
      guanlu: string;       // 官禄 = Career Palace
      tianzhai: string;     // 田宅 = Property Palace
      fude: string;         // 福德 = Fortune Palace
      fumu: string;         // 父母 = Parents Palace
    };
    
                // 四化系统
       transformations: {
         // 四化名称
         sihua: string;        // 四化 = Flying Stars / Transformations
         lu: string;           // 化禄 = Affluence Transformation
         quan: string;         // 化权 = Authority Transformation  
         ke: string;           // 化科 = Merit Transformation
         ji: string;           // 化忌 = Adversity Transformation
         
         // 四化概念
         flyingStars: string;
         transformationStates: string;
         starInteractions: string;
         eventTriggers: string;
         
         // 三维系统
         threeDimensions: string;
         karmicDimension: string;      // 事 - The Events
         emotionalDimension: string;   // 人 - The People  
         materialDimension: string;    // 物 - The Resources
         
         // 四季财富周期
         fourSeasons: string;
         springGrowth: string;         // 春季成长 (化科)
         summerStorm: string;          // 夏季风暴 (化权)
         autumnHarvest: string;        // 秋季收获 (化禄)
         winterStorage: string;        // 冬季储存 (化忌)
       };
       
       // 四化详细解析
       transformationDetails: {
         lu: {
           name: string;               // Affluence
           season: string;             // Autumn Harvest
           karmicAspect: string;       // 命运维度描述
           emotionalAspect: string;    // 情感维度描述
           materialAspect: string;     // 物质维度描述
           wealthPattern: string;      // 财富模式
         };
         quan: {
           name: string;               // Authority
           season: string;             // Summer Storm
           karmicAspect: string;       
           emotionalAspect: string;    
           materialAspect: string;     
           wealthPattern: string;      
         };
         ke: {
           name: string;               // Merit
           season: string;             // Spring Growth
           karmicAspect: string;       
           emotionalAspect: string;    
           materialAspect: string;     
           wealthPattern: string;      
         };
         ji: {
           name: string;               // Adversity
           season: string;             // Winter Storage
           karmicAspect: string;       
           emotionalAspect: string;    
           materialAspect: string;     
           wealthPattern: string;      
         };
       };
       
       // Flying Stars技术
       flyingStarsTechnique: {
         secretWeapon: string;         // ZiWei's secret weapon for precise timing
         starsFlying: string;          // Stars "fly" into different palaces each year
         transformationChanges: string; // Transformation states change (power, wealth, love, trouble)
         eventCreation: string;        // Star interactions create specific event triggers
         multipleConfirmations: string; // Multiple confirmations ensure prediction accuracy
         preciseTiming: string;        // Precise timing analysis
         annualActivation: string;     // Annual palace activation
         palaceInfluence: string;      // Palace influence and energy shifts
         triDimensional: string;       // Operating across three dimensions simultaneously
       };
    
    // 时间系统
    timing: {
      daxian: string;       // 大限 = Major Cycles
      liunian: string;      // 流年 = Annual Influences
      liuyue: string;       // 流月 = Monthly Trends
      liuri: string;        // 流日 = Daily Influences
      
      // 时间概念
      tenYearPhases: string;
      yearlyPredictions: string;
      monthlyVariations: string;
      dailyTiming: string;
      preciseTiming: string;
      cosmicTiming: string;
    };
    
    // 分析术语
    analysis: {
      // 分析类型
      marriageRomance: string;
      healthBody: string;
      wealthTiming: string;
      careerBreakthrough: string;
      
      // 分析概念
      unparalleledPrecision: string;
      microscopicLifeAnalysis: string;
      comprehensiveMapping: string;
      detailedMovieScript: string;
      surgicalPrecision: string;
      
      // 预测准确性
      exactTiming: string;
      multipleConfirmations: string;
      predictiveAccuracy: string;
      cosmicBlueprint: string;
    };
  };
  
  // 八字系统翻译
  bazi: {
    // 基本概念
    concepts: {
      systemName: string;           // 八字 = BaZi / Eight Characters
      alternativeName: string;      // 四柱命理 = Four Pillars of Destiny
      description: string;          // 系统描述
      foundation: string;           // 基础系统
      coreIdentity: string;         // 核心身份
      personalityAnalysis: string;  // 人格分析
      lifePrediction: string;       // 生命预测
      culturalContext: string;      // 文化背景
    };
    
    // 四柱系统
    fourPillars: {
      structure: string;            // 四柱结构
      yearPillar: string;           // 年柱 = Year Pillar
      monthPillar: string;          // 月柱 = Month Pillar
      dayPillar: string;            // 日柱 = Day Pillar (Core Identity)
      hourPillar: string;           // 时柱 = Hour Pillar
      eightCharacters: string;      // 八个字符
      heavenlyStems: string;        // 天干 = Heavenly Stems
      earthlyBranches: string;      // 地支 = Earthly Branches
      sixtyYearCycle: string;       // 60年循环
      dayMaster: string;            // 日主 = Day Master
      stemBranchRelations: string;  // 干支关系 = Stem-Branch Relations
    };
    
    // 分析类型
    analysisTypes: {
      categoricalPrediction: string;  // 铁口直断 = Categorical Prediction
      yongshenAnalysis: string;       // 用神分析 = Focal Element Analysis
      tenGodsAnalysis: string;        // 十神分析 = Ten Gods Analysis
      luckCycles: string;             // 大运 = Luck Cycles
      fleetingYears: string;          // 流年 = Fleeting Years
    };
    
    // 五行解释（中文+拼音+英文）
    elements: {
      jia: string;    // 甲(Jia, Yang Wood)
      yi: string;     // 乙(Yi, Yin Wood)
      bing: string;   // 丙(Bing, Yang Fire)
      ding: string;   // 丁(Ding, Yin Fire)
      wu: string;     // 戊(Wu, Yang Earth)
      ji: string;     // 己(Ji, Yin Earth)
      geng: string;   // 庚(Geng, Yang Metal)
      xin: string;    // 辛(Xin, Yin Metal)
      ren: string;    // 壬(Ren, Yang Water)
      gui: string;    // 癸(Gui, Yin Water)
    };
    
    // 滴天髓原文及意译
    dripFromHeaven: {
      originalText: string;     // 原文
      translation: string;      // 意译
      interpretation: string;   // 解释
    };

    // 十神系统 (Ten Gods)
    tenStars: {
      systemName: string;           // 十神系统 = Ten Gods System
      dayMaster: string;            // 日干 = Day Master
      relationshipBasis: string;    // 关系基础
      
      // 比劫系统 (Peer Gods)
      peerGod: string;              // 比肩 = Peer God
      rivalGod: string;             // 劫财 = Rival God
      
      // 食伤系统 (Output Gods)
      prosperityGod: string;        // 食神 = Prosperity God
      dramaGod: string;             // 伤官 = Drama God
      
      // 财星系统 (Wealth Gods)
      wealthGod: string;            // 正财 = Wealth God
      fortuneGod: string;           // 偏财 = Fortune God
      
      // 官杀系统 (Authority Gods)
      authorityGod: string;         // 正官 = Authority God
      warGod: string;               // 七杀 = War God
      
      // 印枭系统 (Support Gods)
      studyGod: string;             // 正印 = Scholar God
      mysticGod: string;            // 偏印 = Oracle God
    };
    
    // 神祇功能描述
    starFunctions: {
      // 比劫功能
      peerGodFunction: string;      // 友谊和合作关系
      rivalGodFunction: string;     // 竞争和资源争夺
      
      // 食伤功能
      prosperityGodFunction: string; // 创造力与表达
      dramaGodFunction: string;     // 戏剧性的创新反叛
      
      // 财星功能
      wealthGodFunction: string;    // 稳定收入，保守投资
      fortuneGodFunction: string;   // 意外之财，商业机会
      
      // 官杀功能
      authorityGodFunction: string; // 合法权威，结构化管理
      warGodFunction: string;       // 直接权力，军事领导
      
      // 印枭功能
      studyGodFunction: string;     // 教育支持，慈母关怀
      mysticGodFunction: string;    // 控制性帮助，条件支持
    };
    
    // 平衡概念
    balance: {
      strong: string;               // 旺 = Strong
      weak: string;                 // 弱 = Weak
      focalElement: string;         // 用神 = Focal Element
      unfavorableElement: string;   // 忌神 = Unfavorable Element
      balanceKey: string;           // 平衡关键
      elementalBalance: string;     // 元素平衡
      strengthAnalysis: string;     // 强弱分析
      supportNeeded: string;        // 需要支持
    };
    
    // 时间分析
    timing: {
      luckCycle: string;            // 大运 = Luck Cycle
      annualInfluences: string;     // 流年 = Annual Influences
      monthlyInfluences: string;    // 流月 = Monthly Influences
      tenYearCycles: string;        // 十年周期
      yearlyChanges: string;        // 年度变化
      monthlyVariations: string;    // 月度变化
      timingOptimization: string;   // 时机优化
      cyclicalPattern: string;      // 周期模式
    };
    
    // 实际应用
    applications: {
      careerGuidance: string;       // 职业指导
      relationshipAnalysis: string; // 关系分析
      timingAnalysis: string;       // 时机分析
      personalityPsychology: string; // 人格心理学
      selfUnderstanding: string;    // 自我理解
      lifeDecisions: string;        // 人生决策
      eventTiming: string;          // 事件时机
      relationshipImprovement: string; // 关系改善
    };
    
    // 文化背景
    cultural: {
      ancientWisdom: string;        // 古代智慧
      thousandYears: string;        // 千年历史
      personalitySystem: string;    // 人格系统
      westernComparison: string;    // 西方比较
      myersBriggs: string;          // 迈尔斯-布里格斯
      enneagram: string;            // 九型人格
      globalAccessibility: string;  // 全球可及性
      culturalBridge: string;       // 文化桥梁
    };
  };
  
  // 导航
  navigation: {
    home: string;
    dashboard: string;
    profile: string;
    settings: string;
    help: string;
    about: string;
    wiki: string;
    charts: string;
    createChart: string;
  };
  
  // 设置页面
  settings: {
    accountManagement: string;
    myProfile: string;
    preferences: string;
    serviceSubscription: string;
    membershipCenter: string;
    subscriptionService: string;
    helpSupport: string;
    helpCenter: string;
    systemSettings: string;
    logout: string;
    membershipLevel: string;
    freeVersion: string;
    member: string;
    manageBirthInfo: string;
    personalizeExperience: string;
    viewMembershipStatus: string;
    manageSubscription: string;
    faqGuide: string;
    secureLogout: string;
    accountOverview: string;
    nicknameNotSet: string;
    profileActivated: string;
    profileIncomplete: string;
    membershipLevelDesc: string;
    exclusiveBenefits: string;
    profileReminder: string;
    completeProfile: string;
    profileReminderDesc: string;
    contactSupport: string;
    loggingOut: string;
  };
  
  // Profile 页面
  profile: {
    title: string;
    subtitle: string;
    returnToCharts: string;
    returnToPrevious: string;
    importantReminder: string;
    reminderText: string;
    basicInfo: string;
    basicInfoDesc: string;
    personalProfile: string;
    personalProfileDesc: string;
    birthDate: string;
    birthTime: string;
    birthLocation: string;
    gender: string;
    nickname: string;
    male: string;
    female: string;
    edit: string;
    save: string;
    cancel: string;
    saving: string;
    notSet: string;
    selectDate: string;
    selectTime: string;
    enterLocation: string;
    enterNickname: string;
    selectGender: string;
    year: string;
    month: string;
    day: string;
    hour: string;
    minute: string;
    am: string;
    pm: string;
    pleaseLoginFirst: string;
    loginToManageProfile: string;
    goToLogin: string;
    loading: string;
    saveSuccess: string;
    saveFailed: string;
    genderEditLimitExceeded: string;
    genderChangeConfirm: string;
    emailMismatch: string;
    profileComplete: string;
    profileIncomplete: string;
    completeYourProfile: string;
    birthInfoValidation: string;
    profileStats: string;
    joinedDate: string;
    lastUpdated: string;
    editCount: string;
    genderEditCount: string;
  };
  
  // Membership 页面
  membership: {
    title: string;
    subtitle: string;
    membershipStatus: string;
    personalInfo: string;
    personalInfoDesc: string;
    usageStats: string;
    usageStatsDesc: string;
    accountActions: string;
    accountActionsDesc: string;
    premiumMember: string;
    freeReports: string;
    paidReports: string;
    chatbotDialogs: string;
    expertReports: string;
    membershipExpiry: string;
    emailAddress: string;
    joinDate: string;
    lastActive: string;
    exportData: string;
    importData: string;
    resetSettings: string;
    deleteAccount: string;
    exportDataDesc: string;
    importDataDesc: string;
    resetSettingsDesc: string;
    deleteAccountDesc: string;
    exportDataInProgress: string;
    importDataInProgress: string;
    resetSettingsConfirm: string;
    settingsReset: string;
    deleteAccountConfirm: string;
    deleteAccountSuccess: string;
    deleteAccountFailed: string;
    newUserTip: string;
    loadingFailed: string;
    reload: string;
    loading: string;
    deleting: string;
  };
  
  // Subscription 页面
  subscription: {
    title: string;
    subtitle: string;
    membershipComparison: string;
    chooseYourPlan: string;
    purchaseCredits: string;
    purchaseCreditsDesc: string;
    mostPopular: string;
    recommended: string;
    bestValue: string;
    freeText: string;
    buyCredits: string;
    unitPrice: string;
    perCredit: string;
    permanentValidity: string;
    stackable: string;
    aiAnalysisReports: string;
    faq: string;
    faqMembershipExpiry: string;
    faqMembershipExpiryAnswer: string;
    faqUpgradePlans: string;
    faqUpgradePlansAnswer: string;
    faqCreditsExpiry: string;
    faqCreditsExpiryAnswer: string;
    faqPaymentMethods: string;
    faqPaymentMethodsAnswer: string;
    creditsStackingTip: string;
    purchaseProcessing: string;
    purchaseFailed: string;
  };
  
  // Preferences 页面
  preferences: {
    title: string;
    subtitle: string;
    themeSettings: string;
    themeSettingsDesc: string;
    languageSettings: string;
    languageSettingsDesc: string;
    lightMode: string;
    darkMode: string;
    systemMode: string;
    chinese: string;
    english: string;
    japanese: string;
    comingSoon: string;
    comingSoonDesc: string;
    currentTheme: string;
    currentLanguage: string;
    available: string;
    notAvailable: string;
  };
  
  // 命盘页面
  charts: {
    noChartsYet: string;
    createFirstChart: string;
    createFirstChartDesktop: string;
    chartRecords: string;
    createNewChart: string;
    selectChart: string;
    baziAnalysis: string;
    ziweiAnalysis: string;
    // 新增分析相关翻译
    loadingAnalysis: string;
    noAnalysis: string;
    analysisReports: string;
    reports: string;
    collapse: string;
    viewAnalysis: string;
    deleteAnalysis: string;
    aiAnalysisResult: string;
    confirmDeleteChart: string;
    deleteChartWarning: string;
    deleteFailed: string;
    deleteFailedMessage: string;
    confirmDeleteAnalysis: string;
    deleteAnalysisWarning: string;
    // 图表类型标签
    chartTypes: {
      bazi: string;
      ziwei: string;
    };
  };
  
  // 创建命盘页面
  createChart: {
    selectBirthTime: string;
    timePickerTitle: string;
    birthDate: string;
    birthTime: string;
    saveChart: string;
    chartName: string;
    chartCategory: string;
    pleaseEnterName: string;
    pleaseSelectCategory: string;
    saving: string;
    chartSaved: string;
    saveFailed: string;
  };
  
  // Wiki页面
  wiki: {
    knowledgeBase: string;
    allCategories: string;
    baziBasics: string;
    ziweiDoushu: string;
    wuxingTheory: string;
    yijingWisdom: string;
    schoolComparison: string;
    hotArticles: string;
    readTime: string;
    minutes: string;
    views: string;
    searchPlaceholder: string;
    tgdzMeaning: string;
    wuxingLifeCycle: string;
    starsAndPalaces: string;
    sihuaFlying: string;
    yijingWisdomGuide: string;
    baziBasicsDesc: string;
    ziweiBasicsDesc: string;
    wuxingTheoryDesc: string;
    yijingWisdomDesc: string;
    schoolComparisonDesc: string;
  };
}

// 中文字典
export const zhDict: Dictionary = {
  common: {
    calculate: '计算',
    save: '保存',
    clear: '清除',
    cancel: '取消',
    confirm: '确认',
    loading: '加载中...',
    error: '错误',
    success: '成功',
    submit: '提交',
    reset: '重置',
    back: '返回',
    next: '下一步',
    search: '搜索',
    filter: '筛选',
    refresh: '刷新',
    close: '关闭',
    edit: '编辑',
    delete: '删除',
    add: '添加',
    create: '创建',
    menu: '菜单',
    all: '全部',
  },
  form: {
    name: '姓名',
    birthYear: '出生年',
    birthMonth: '出生月',
    birthDay: '出生日',
    birthHour: '出生时',
    gender: '性别',
    male: '男',
    female: '女',
    category: '分类',
    email: '邮箱',
    password: '密码',
    year: '年',
    month: '月',
    day: '日',
    hour: '时',
    currentSelection: '当前选择',
    birthTimeRange: '出生时辰',
  },
  pages: {
    bazi: {
      title: '八字排盘',
      subtitle: '传统八字命理分析',
    },
    ziwei: {
      title: '紫微斗数',
      subtitle: '紫微斗数命盘分析',
    },
    auth: {
      title: 'Web3 钱包登录',
      subtitle: '连接钱包后即可使用 AstroZi 全部功能',
    },
    settings: {
      title: '设置',
      subtitle: '个人设置和偏好',
    },
    charts: {
      title: '命盘记录',
      subtitle: '我的命盘档案',
    },
    createChart: {
      title: '创建命盘',
      subtitle: '输入出生信息生成命盘',
    },
    wiki: {
      title: '知识百科',
      subtitle: '命理知识库',
    },
  },
  instructions: {
    fillForm: '请填写出生信息',
    clickCalculate: '点击计算按钮生成命盘',
    saveChart: '保存命盘到您的档案',
  },
  errors: {
    invalidInput: '输入信息不正确',
    networkError: '网络连接错误',
    authRequired: '请先登录',
  },
  categories: {
    friends: '朋友',
    family: '家人',
    clients: '客户',
    favorites: '最爱',
    others: '其他',
  },
  karmaPalace: {
    title: '宿世因缘',
    whatIsKarmaPalace: '什么是来因宫？',
    whatIsKarmaPalaceDesc: '来因宫在紫微斗数中扮演着至关重要的角色，它不仅反映了个人的内在动机和潜在能力，还揭示了与他人、事务和物质世界的关系。来因宫的配置能够影响个人的命运走向、事业发展和人际关系。',
    importanceOfKarmaPalace: '来因宫的重要性',
    importanceOfKarmaPalaceDesc: '通过分析来因宫在不同宫位的表现，能够洞察到个体在生活中如何应对挑战、利用资源和实现自我价值。它强调了个人的主动性和责任感，提醒我们在追求目标的过程中，如何平衡自身需求与外部环境的互动。',
    yourKarmaPalaceIn: '您的来因宫在',
    peopleAspect: '人',
    mattersAspect: '事',
    materialAspect: '物',
    palaceReference: '十二宫位参考',
    palaceReferenceDesc: '因此，来因宫的解析对于理解一个人的命格、性格以及未来的发展方向具有重要意义。',
    palaceNames: {
      self: '命宫',
      siblings: '兄弟',
      spouse: '夫妻',
      children: '子女',
      wealth: '财帛',
      health: '疾厄',
      travel: '迁移',
      friends: '交友',
      career: '官禄',
      property: '田宅',
      fortune: '福德',
      parents: '父母',
    },
  },
  ziwei: {
    concepts: {
      systemName: '紫微斗数',
      systemAlias: '紫微斗数',
      description: '紫微斗数，又称紫微星盘，是中国古代占星术中的一种，以紫微星（即紫微星）为观测中心，结合天干地支、五行生克、星曜宫位、四化飞星等要素，推断人的命运、性格、事业、婚姻、健康等。',
      nickname: '紫微斗数',
      ultimateSystem: '终极系统',
      purpleStarAstrology: '紫微星占',
      emperorOfChineseAstrology: '中国帝王星占',
      cosmicBlueprint: '宇宙蓝图',
      precisionLifeEngineering: '精密生命工程',
      imperialGradeDestinyAnalysis: '帝王级命运分析',
    },
         primaryStars: {
       ziwei: '紫微',
       tianji: '天机',
       taiyang: '太阳',
       wuqu: '武曲',
       tiantong: '天同',
       lianzhou: '廉贞',
       tianfu: '天府',
       taiyin: '太阴',
       tanlang: '贪狼',
       jumen: '巨门',
       tianxiang: '天相',
       tianliang: '天梁',
       qisha: '七杀',
       pojun: '破军',
     },
     
     starDetails: {
       ziwei: {
         coreEssence: '领导力与高贵',
         symbolism: '北极星 - 恒定、中心、令人敬仰',
         keyTraits: ['天生的领导者，具有强大的存在感', '高度的自尊心和尊严', '出色的组织和管理技能', '喜欢掌控并做决定'],
         idealCareers: 'CEO、政治家、导演、团队领导',
         relationshipStyle: '保护性的，但可能过于专横',
         lifeApproach: '寻求权威地位和影响力',
         challenges: '可能傲慢，难以接受命令'
       },
       tianji: {
         coreEssence: '战略智慧与适应性',
         symbolism: '宇宙策略师 - 总是计算最佳策略',
         keyTraits: ['卓越的战略思维和敏捷的智慧', '热爱学习和智力挑战', '适应力强但有时不一致', '善于发现模式和联系'],
         idealCareers: '顾问、策略师、研究员、程序员',
         relationshipStyle: '重视心理连接和智力刺激',
         lifeApproach: '不断寻求知识和新视角',
         challenges: '过度思考，难以处理常规任务'
       },
       taiyang: {
         coreEssence: '光明能量与仁爱',
         symbolism: '太阳 - 照亮和激发周围的一切',
         keyTraits: ['慷慨和热心', '强烈的正义感和公平感', '喜欢帮助他人成功', '高能量但可能耗尽'],
         idealCareers: '教师、社工、公关、医疗',
         relationshipStyle: '给予和支持，有时自我牺牲',
         lifeApproach: '专注于对社会的贡献',
         challenges: '倾向于给予过多，忽视自我照顾'
       },
       wuqu: {
         coreEssence: '财务智慧与果断行动',
         symbolism: '军事指挥官 - 资源战略性和执行大胆',
         keyTraits: ['出色的金钱和财务规划能力', '果断和实用', '强烈的意志力和决心', '直接的沟通风格'],
         idealCareers: '金融、银行、创业、军事',
         relationshipStyle: '忠诚但可能难以表达情感',
         lifeApproach: '目标导向，专注于物质安全',
         challenges: '可能固执，对低效率不耐烦'
       },
       tiantong: {
         coreEssence: '和平与知足',
         symbolism: '温和的微风 - 带来平静和舒适',
         keyTraits: ['和平和随和的天性', '出色的调解者和和平缔造者', '欣赏美丽和舒适', '尽可能避免冲突'],
         idealCareers: '咨询师、人事、服务业、艺术设计',
         relationshipStyle: '支持和谐的伴侣',
         lifeApproach: '寻求平衡，避免压力',
         challenges: '可能缺乏雄心，避免必要的对抗'
       },
       lianzhou: {
         coreEssence: '创意矛盾与转化',
         symbolism: '悖论 - 美丽与毁灭，创造与混乱合一',
         keyTraits: ['情感复杂而强烈', '强烈的艺术和创造能力', '魅力四射的磁性人格', '既能激励又可能不稳定'],
         idealCareers: '艺术家、表演者、治疗师、创意总监',
         relationshipStyle: '热情但可能占有欲强',
         lifeApproach: '通过极端寻求真实的自我表达',
         challenges: '情绪波动，倾向于矛盾行为'
       },
       tianfu: {
         coreEssence: '稳定与资源管理',
         symbolism: '皇家宝库 - 安全、丰富、组织良好',
         keyTraits: ['天生积累和管理资源的能力', '保守和实用的方法', '可靠和值得信赖', '重视传统和稳定'],
         idealCareers: '会计、房地产、银行、行政',
         relationshipStyle: '稳定和可靠的伴侣',
         lifeApproach: '建立长期安全和财富',
         challenges: '可能过于谨慎，抗拒变化'
       },
       taiyin: {
         coreEssence: '温柔直觉与关怀',
         symbolism: '月亮 - 柔和、接受、情感引导',
         keyTraits: ['高度直觉和共情', '温柔和关怀的天性', '与家庭和家强烈连接', '偏好间接而非对抗性方法'],
         idealCareers: '医疗、教育、心理学、家庭服务',
         relationshipStyle: '关怀和情感支持',
         lifeApproach: '重视情感连接和家庭和谐',
         challenges: '可能过于敏感，避免直接对抗'
       },
       tanlang: {
         coreEssence: '激情与多样性',
         symbolism: '探索者 - 被各种欲望驱动，不断探索',
         keyTraits: ['多才多艺', '对成功和快乐的强烈驱动', '有魅力和社交技巧', '容易被新机会诱惑'],
         idealCareers: '销售、娱乐、营销、创业',
         relationshipStyle: '有魅力但可能难以承诺',
         lifeApproach: '追求多种兴趣和体验',
         challenges: '不一致，难以专注于一条道路'
       },
       jumen: {
         coreEssence: '敏锐沟通与调查',
         symbolism: '倾听所有窃窃私语者 - 在表面下探测真相',
         keyTraits: ['出色的沟通者和演讲者', '调查和分析思维', '强烈的是非观念', '高度感知隐藏含义'],
         idealCareers: '律师、记者、侦探、公共演讲者',
         relationshipStyle: '重视诚实沟通但可能过于挑剔',
         lifeApproach: '寻求真相并揭露隐藏的东西',
         challenges: '可能过于挑剔，倾向于八卦'
       },
       tianxiang: {
         coreEssence: '忠诚服务与外交支持',
         symbolism: '可信赖的大臣 - 在王座后忠实服务',
         keyTraits: ['天然的帮手和支持者', '外交和机智', '强烈的责任感', '偏好在幕后工作'],
         idealCareers: '行政助理、顾问、客户服务、外交',
         relationshipStyle: '支持和迁就的伴侣',
         lifeApproach: '在帮助他人成功中找到满足',
         challenges: '可能忽视自己的需求，可能优柔寡断'
       },
       tianliang: {
         coreEssence: '智慧与保护',
         symbolism: '智慧长者 - 为有需要的人提供指导和庇护',
         keyTraits: ['成熟和超越年龄的智慧', '天然的保护者和指导者', '强烈的道德指南针', '喜欢教学和指导'],
         idealCareers: '教师、咨询师、教练、宗教领袖',
         relationshipStyle: '保护和指导，有时控制',
         lifeApproach: '寻求帮助他人成长和发展',
         challenges: '可能说教，倾向于控制他人的选择'
       },
       qisha: {
         coreEssence: '勇气与独立',
         symbolism: '孤独的战士 - 勇敢、独立、准备迎接任何挑战',
         keyTraits: ['无畏和冒险', '强烈的独立性', '天然的危机管理者', '不喜欢常规和约束'],
         idealCareers: '应急服务、军事、极限运动、危机管理',
         relationshipStyle: '独立但一旦承诺就忠诚',
         lifeApproach: '寻求挑战和冒险',
         challenges: '可能鲁莽，难以接受权威和常规'
       },
       pojun: {
         coreEssence: '变革与创新',
         symbolism: '革命者 - 打破旧系统以建立更好的东西',
         keyTraits: ['先锋和创新者', '在变化和转型中茁壮成长', '有创意的问题解决者', '可能具有破坏性和不稳定'],
         idealCareers: '创业创始人、创新者、艺术家、变革管理',
         relationshipStyle: '令人兴奋但不可预测的伴侣',
         lifeApproach: '不断寻求改进和革命',
         challenges: '可能具有破坏性，难以维持稳定'
       }
     },
         supportingStars: {
       zuofu: '左辅',
       youbi: '右弼',
       wenchang: '文昌',
       wenqu: '文曲',
       tiankui: '天魁',
       tianyue: '天钺',
       qingyang: '擎羊',
       tuoluo: '陀罗',
       huoxing: '火星',
       lingxing: '铃星',
       dikong: '地空',
       dijie: '地劫',
       tianma: '天马',
       hongyan: '红鸾',
       tianxi: '天喜',
       gukua: '孤寡',
     },
     
     supportingStarFunctions: {
       wenchang: '学术成就',
       wenqu: '艺术才华',
       zuofuyoubi: '贵人帮助',
       tiankuitianyue: '权贵导师',
       huoxinglingxing: '爆发能量，冲突',
       tianma: '旅行变动',
       hongyantianxi: '姻缘桃花',
       dikongdijie: '精神空虚，物质损失',
       qingyangtuoluo: '阻碍延迟',
       gukua: '孤独独立',
     },
    palaces: {
      ming: '命宫',
      xiongdi: '兄弟',
      fuqi: '夫妻',
      zinv: '子女',
      caibo: '财帛',
      jie: '疾厄',
      qianyi: '迁移',
      jiaoyou: '交友',
      guanlu: '官禄',
      tianzhai: '田宅',
      fude: '福德',
      fumu: '父母',
    },
         transformations: {
       sihua: '四化',
       lu: '化禄',
       quan: '化权',
       ke: '化科',
       ji: '化忌',
       flyingStars: '飞星',
       transformationStates: '化象',
       starInteractions: '星曜互动',
       eventTriggers: '事件触发',
       
       // 三维系统
       threeDimensions: '三维系统',
       karmicDimension: '事 - 事件维度',
       emotionalDimension: '人 - 情感维度',
       materialDimension: '物 - 物质维度',
       
       // 四季财富周期
       fourSeasons: '四季财富周期',
       springGrowth: '春季成长',
       summerStorm: '夏季风暴',
       autumnHarvest: '秋季收获',
       winterStorage: '冬季储存',
     },
     
     transformationDetails: {
       lu: {
         name: '富足',
         season: '秋季收获',
         karmicAspect: '命中注定的机缘和神圣安排',
         emotionalAspect: '无条件的爱与接纳',
         materialAspect: '自然的财富流动和丰厚回报',
         wealthPattern: '金钱如秋收般自然而来，收获所种并为未来准备'
       },
       quan: {
         name: '权威',
         season: '夏季风暴',
         karmicAspect: '突如其来的生活变化和神圣干预',
         emotionalAspect: '占有欲强、控制行为',
         materialAspect: '突然的财富和快速流失',
         wealthPattern: '金钱如夏日风暴般突然而猛烈，高风险高回报'
       },
       ke: {
         name: '功名',
         season: '春季成长',
         karmicAspect: '灵魂认知和情感命运',
         emotionalAspect: '真诚的欣赏和温暖情感',
         materialAspect: '稳定积累和持续增长',
         wealthPattern: '金钱如春雨般温和持续，通过耐心和关系建立财富'
       },
       ji: {
         name: '困厄',
         season: '冬季储存',
         karmicAspect: '未完成的业务需要解决',
         emotionalAspect: '深深的怨恨和失望',
         materialAspect: '最终积累和隐藏储备',
         wealthPattern: '如熊冬眠前储存，通过失去和结束获得最持久的财富'
       }
     },
     
     flyingStarsTechnique: {
       secretWeapon: '紫微斗数精准推算的秘密武器',
       starsFlying: '星曜每年"飞"入不同宫位',
       transformationChanges: '四化状态变化（权力、财富、爱情、困难）',
       eventCreation: '星曜互动创造特定事件触发',
       multipleConfirmations: '多重验证确保预测准确性',
       preciseTiming: '精准时机分析',
       annualActivation: '年度宫位激活',
       palaceInfluence: '宫位影响力与能量转换',
       triDimensional: '同时在三个维度中运作',
     },
    timing: {
      daxian: '大限',
      liunian: '流年',
      liuyue: '流月',
      liuri: '流日',
      tenYearPhases: '十年大运',
      yearlyPredictions: '年运',
      monthlyVariations: '月运',
      dailyTiming: '日运',
      preciseTiming: '精准推算',
      cosmicTiming: '宇宙推算',
    },
    analysis: {
      marriageRomance: '婚姻感情',
      healthBody: '健康身体',
      wealthTiming: '财富时机',
      careerBreakthrough: '事业突破',
      unparalleledPrecision: '无与伦比精准',
      microscopicLifeAnalysis: '微观生命分析',
      comprehensiveMapping: '全面映射',
      detailedMovieScript: '详尽剧本',
      surgicalPrecision: '手术级精准',
      exactTiming: '精准时刻',
      multipleConfirmations: '多重验证',
      predictiveAccuracy: '预测准确率',
      cosmicBlueprint: '宇宙蓝图',
    },
  },
  navigation: {
    home: '首页',
    dashboard: '仪表板',
    profile: '个人资料',
    settings: '设置',
    help: '帮助',
    about: '关于',
    wiki: '百科',
    charts: '命盘记录',
    createChart: '创建命盘',
  },
  settings: {
    accountManagement: '账户管理',
    myProfile: '我的档案',
    preferences: '偏好设置',
    serviceSubscription: '服务订阅',
    membershipCenter: '会员中心',
    subscriptionService: '订阅服务',
    helpSupport: '帮助支持',
    helpCenter: '帮助中心',
    systemSettings: '系统设置',
    logout: '登出账号',
    membershipLevel: '会员等级',
    freeVersion: '免费版',
    member: '会员',
    manageBirthInfo: '管理您的出生信息和个人资料',
    personalizeExperience: '个性化您的使用体验',
    viewMembershipStatus: '查看会员状态和专属权益',
    manageSubscription: '管理订阅计划和付费服务',
    faqGuide: '使用指南和常见问题解答',
    secureLogout: '安全退出当前账户',
    accountOverview: '账户概览',
    nicknameNotSet: '未设置昵称',
    profileActivated: '已激活',
    profileIncomplete: '待完善',
    membershipLevelDesc: '会员等级',
    exclusiveBenefits: '享受专属权益和服务',
    profileReminder: '提醒：',
    completeProfile: '完善档案信息',
    profileReminderDesc: '您的档案尚未完善，完善档案信息后可享受更精准的分析服务。',
    contactSupport: '联系客服',
    loggingOut: '正在退出...',
  },
  
  // Profile 页面
  profile: {
    title: '我的档案',
    subtitle: '管理您的出生信息，为专家级报告做准备',
    returnToCharts: '完成设置后将返回到我的星盘',
    returnToPrevious: '完成设置后将返回到上一页',
    importantReminder: '重要提醒：',
    reminderText: '您有一次免费修改出生日期和性别的机会。时辰可以无限次修改。修改后的信息将用于生成更精确的专家级报告。',
    basicInfo: '基本信息',
    basicInfoDesc: '完善您的基本档案信息',
    personalProfile: '个人档案',
    personalProfileDesc: '自定义您的个人信息',
    birthDate: '出生日期',
    birthTime: '出生时间',
    birthLocation: '出生地点',
    gender: '性别',
    nickname: '昵称',
    male: '男',
    female: '女',
    edit: '编辑',
    save: '保存',
    cancel: '取消',
    saving: '保存中...',
    notSet: '未设置',
    selectDate: '选择日期',
    selectTime: '选择时间',
    enterLocation: '输入出生地点',
    enterNickname: '输入昵称',
    selectGender: '选择性别',
    year: '年',
    month: '月',
    day: '日',
    hour: '时',
    minute: '分',
    am: '上午',
    pm: '下午',
    pleaseLoginFirst: '请先登录',
    loginToManageProfile: '登录后即可管理个人档案',
    goToLogin: '前往登录',
    loading: '加载中...',
    saveSuccess: '保存成功！',
    saveFailed: '保存失败，请重试',
    genderEditLimitExceeded: '您已使用过免费修改性别的机会，继续修改性别需要付费服务。',
    genderChangeConfirm: '重要提醒：\n\n您已经使用过一次免费修改性别的机会。\n\n继续修改性别将需要付费服务。\n\n确定要继续吗？',
    emailMismatch: '邮箱地址不匹配，取消删除操作',
    profileComplete: '档案完整',
    profileIncomplete: '档案待完善',
    completeYourProfile: '完善您的档案信息，享受更精准的分析服务',
    birthInfoValidation: '出生信息验证中',
    profileStats: '档案统计',
    joinedDate: '加入日期',
    lastUpdated: '最后更新',
    editCount: '编辑次数',
    genderEditCount: '性别编辑次数'
  },
  
  // Membership 页面
  membership: {
    title: '会员状态',
    subtitle: '的会员信息',
    membershipStatus: '会员状态',
    personalInfo: '个人资料',
    personalInfoDesc: '查看和管理您的账号信息',
    usageStats: '使用统计',
    usageStatsDesc: '查看您的服务使用情况和剩余次数',
    accountActions: '账户操作',
    accountActionsDesc: '管理您的账户和数据',
    premiumMember: '高级会员',
    freeReports: '免费报告次数',
    paidReports: '已用付费报告',
    chatbotDialogs: 'ChatBot对话次数',
    expertReports: '专家报告次数',
    membershipExpiry: '高级会员到期时间',
    emailAddress: '邮箱地址',
    joinDate: '加入日期',
    lastActive: '最后活跃',
    exportData: '导出数据',
    importData: '导入数据',
    resetSettings: '重置设置',
    deleteAccount: '删除账号',
    exportDataDesc: '导出您的数据和分析结果',
    importDataDesc: '导入备份数据',
    resetSettingsDesc: '将所有设置重置为默认值',
    deleteAccountDesc: '永久删除您的账户和所有数据',
    exportDataInProgress: '数据导出功能开发中...',
    importDataInProgress: '数据导入功能开发中...',
    resetSettingsConfirm: '确定要重置所有设置到默认值吗？此操作不可撤销。',
    settingsReset: '设置已重置，请刷新页面。',
    deleteAccountConfirm: '⚠️ 删除账号是不可逆操作！\n\n将删除您的所有数据：\n• 所有命盘记录\n• 所有AI分析结果\n• 用户资料和设置\n• 会员权益\n\n请输入您的邮箱地址确认删除：',
    deleteAccountSuccess: '账号删除成功。感谢您使用我们的服务。',
    deleteAccountFailed: '删除账号失败：',
    newUserTip: '💡 提示：新用户默认使用次数为0，请通过每日签到获取免费使用次数！',
    loadingFailed: '加载失败',
    reload: '重新加载',
    loading: '加载中...',
    deleting: '删除中...'
  },
  
  // Subscription 页面
  subscription: {
    title: '会员权益对比',
    subtitle: '选择适合您的会员计划，享受AI命理分析服务',
    membershipComparison: '会员权益对比',
    chooseYourPlan: '选择适合您的会员计划，享受AI命理分析服务',
    purchaseCredits: '购买分析次数',
    purchaseCreditsDesc: '灵活购买AI分析次数，按需付费',
    mostPopular: '最受欢迎',
    recommended: '推荐',
    bestValue: '最划算',
    freeText: '免费',
    buyCredits: '购买 {count}次',
    unitPrice: '单价',
    perCredit: '/次',
    permanentValidity: '永久有效，不过期',
    stackable: '可叠加使用',
    aiAnalysisReports: 'AI分析报告',
    faq: '常见问题',
    faqMembershipExpiry: '🤔 会员到期后会怎样？',
    faqMembershipExpiryAnswer: '会员到期后将自动降级为免费用户，保留所有历史数据，但会员专享功能将受到限制。',
    faqUpgradePlans: '⬆️ 可以升级或更换会员计划吗？',
    faqUpgradePlansAnswer: '当前会员到期后可以选择任意新的会员计划，暂不支持会员期间升级。',
    faqCreditsExpiry: '⏰ 购买的分析次数会过期吗？',
    faqCreditsExpiryAnswer: '不会过期。购买的分析次数将永久保存在您的账户中，可以随时使用，与会员权益叠加。',
    faqPaymentMethods: '💳 支持哪些支付方式？',
    faqPaymentMethodsAnswer: '支持信用卡、微信支付、支付宝等主流支付方式（通过Stripe安全支付）。',
    creditsStackingTip: '💡 购买的分析次数将直接充值到您的账户，与会员权益叠加使用',
    purchaseProcessing: '处理购买中...',
    purchaseFailed: '购买失败，请稍后重试。'
  },
  
  // Preferences 页面
  preferences: {
    title: '偏好设置',
    subtitle: '个性化您的使用体验',
    themeSettings: '主题设置',
    themeSettingsDesc: '选择您偏好的颜色主题',
    languageSettings: '语言设置',
    languageSettingsDesc: '选择您偏好的显示语言',
    lightMode: '浅色模式',
    darkMode: '深色模式',
    systemMode: '跟随系统',
    chinese: '中文',
    english: 'English',
    japanese: '日本語',
    comingSoon: '即将推出',
    comingSoonDesc: '该语言版本即将推出，敬请期待！',
    currentTheme: '当前主题',
    currentLanguage: '当前语言',
    available: '可用',
    notAvailable: '不可用'
  },
  

  charts: {
    noChartsYet: '还没有命盘记录',
    createFirstChart: '从首页菜单或命书页面创建您的第一个命盘',
    createFirstChartDesktop: '从左侧导航或排盘页面创建您的第一个命盘',
    chartRecords: '命盘记录',
    createNewChart: '创建新命盘',
    selectChart: '选择命盘',
    baziAnalysis: '八字分析',
    ziweiAnalysis: '紫微斗数',
    // 新增分析相关翻译
    loadingAnalysis: '加载分析中...',
    noAnalysis: '没有分析',
    analysisReports: '分析报告',
    reports: '报告',
    collapse: '折叠',
    viewAnalysis: '查看分析',
    deleteAnalysis: '删除分析',
    aiAnalysisResult: 'AI分析结果',
    confirmDeleteChart: '确认删除命盘？',
    deleteChartWarning: '删除命盘将删除所有分析数据，不可撤销。',
    deleteFailed: '删除失败',
    deleteFailedMessage: '删除失败，请重试。',
    confirmDeleteAnalysis: '确认删除分析？',
    deleteAnalysisWarning: '删除分析将删除所有数据，不可撤销。',
         // 图表类型标签
     chartTypes: {
       bazi: '八字',
       ziwei: '紫微',
     },
  },
  createChart: {
    selectBirthTime: '选择出生时间',
    timePickerTitle: '选择出生时间',
    birthDate: '出生日期',
    birthTime: '出生时间',
    saveChart: '保存命盘',
    chartName: '命盘名称',
    chartCategory: '命盘分类',
    pleaseEnterName: '请输入姓名',
    pleaseSelectCategory: '请选择分类',
    saving: '保存中...',
    chartSaved: '命盘保存成功',
    saveFailed: '保存失败',
  },
  wiki: {
    knowledgeBase: '知识百科',
    allCategories: '全部',
    baziBasics: '八字基础',
    ziweiDoushu: '紫微斗数',
    wuxingTheory: '五行理论',
    yijingWisdom: '易经易传',
    schoolComparison: '学派对比',
    hotArticles: '热门文章',
    readTime: '阅读时间',
    minutes: '分钟',
    views: '浏览',
    searchPlaceholder: '搜索知识库...',
    tgdzMeaning: '天干地支、五行生克',
    wuxingLifeCycle: '相生相克、平衡调理',
    starsAndPalaces: '星曜宫位、四化飞星',
    sihuaFlying: '四化飞星运用技巧',
    yijingWisdomGuide: '周易智慧、卦象解析',
    baziBasicsDesc: '天干地支、五行生克',
    ziweiBasicsDesc: '星曜宫位、四化飞星',
    wuxingTheoryDesc: '相生相克、平衡调理',
    yijingWisdomDesc: '周易智慧、卦象解析',
    schoolComparisonDesc: '不同流派、理论比较',
  },
  
  // 八字系统翻译
  bazi: {
    concepts: {
      systemName: '八字',
      alternativeName: '四柱命理',
      description: '基于出生时间的传统中国人格分析和生命预测系统',
      foundation: '天干地支基础系统',
      coreIdentity: '核心身份',
      personalityAnalysis: '人格分析',
      lifePrediction: '生命预测',
      culturalContext: '文化背景',
    },
    fourPillars: {
      structure: '四柱结构',
      yearPillar: '年柱',
      monthPillar: '月柱',
      dayPillar: '日柱（核心身份）',
      hourPillar: '时柱',
      eightCharacters: '八个字符',
      heavenlyStems: '天干',
      earthlyBranches: '地支',
      sixtyYearCycle: '60年循环',
      dayMaster: '日主',
      stemBranchRelations: '干支关系',
    },
    analysisTypes: {
      categoricalPrediction: '铁口直断',
      yongshenAnalysis: '用神分析',
      tenGodsAnalysis: '十神分析',
      luckCycles: '大运',
      fleetingYears: '流年',
    },
    elements: {
      jia: '甲',
      yi: '乙',
      bing: '丙',
      ding: '丁',
      wu: '戊',
      ji: '己',
      geng: '庚',
      xin: '辛',
      ren: '壬',
      gui: '癸',
    },
    dripFromHeaven: {
      originalText: '原文',
      translation: '意译',
      interpretation: '解释',
    },
    tenStars: {
      systemName: '十神系统',
      dayMaster: '日干',
      relationshipBasis: '关系基础',
      peerGod: '比肩',
      rivalGod: '劫财',
      prosperityGod: '食神',
      dramaGod: '伤官',
      wealthGod: '正财',
      fortuneGod: '偏财',
      authorityGod: '正官',
      warGod: '七杀',
      studyGod: '正印',
      mysticGod: '偏印',
    },
    starFunctions: {
      peerGodFunction: '友谊和合作关系',
      rivalGodFunction: '竞争和资源争夺',
      prosperityGodFunction: '创造力与表达',
      dramaGodFunction: '戏剧性的创新反叛',
      wealthGodFunction: '稳定收入，保守投资',
      fortuneGodFunction: '意外之财，商业机会',
      authorityGodFunction: '合法权威，结构化管理',
      warGodFunction: '直接权力，军事领导',
      studyGodFunction: '教育支持，慈母关怀',
      mysticGodFunction: '控制性帮助，条件支持',
    },
    balance: {
      strong: '旺',
      weak: '弱',
      focalElement: '用神',
      unfavorableElement: '忌神',
      balanceKey: '平衡关键',
      elementalBalance: '元素平衡',
      strengthAnalysis: '强弱分析',
      supportNeeded: '需要支持',
    },
    timing: {
      luckCycle: '大运',
      annualInfluences: '流年',
      monthlyInfluences: '流月',
      tenYearCycles: '十年周期',
      yearlyChanges: '年度变化',
      monthlyVariations: '月度变化',
      timingOptimization: '时机优化',
      cyclicalPattern: '周期模式',
    },
    applications: {
      careerGuidance: '职业指导',
      relationshipAnalysis: '关系分析',
      timingAnalysis: '时机分析',
      personalityPsychology: '人格心理学',
      selfUnderstanding: '自我理解',
      lifeDecisions: '人生决策',
      eventTiming: '事件时机',
      relationshipImprovement: '关系改善',
    },
    cultural: {
      ancientWisdom: '古代智慧',
      thousandYears: '千年历史',
      personalitySystem: '人格系统',
      westernComparison: '西方比较',
      myersBriggs: '迈尔斯-布里格斯',
      enneagram: '九型人格',
      globalAccessibility: '全球可及性',
      culturalBridge: '文化桥梁',
    },
  },
};

// 英文字典
export const enDict: Dictionary = {
  common: {
    calculate: 'Calculate',
    save: 'Save',
    clear: 'Clear',
    cancel: 'Cancel',
    confirm: 'Confirm',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    submit: 'Submit',
    reset: 'Reset',
    back: 'Back',
    next: 'Next',
    search: 'Search',
    filter: 'Filter',
    refresh: 'Refresh',
    close: 'Close',
    edit: 'Edit',
    delete: 'Delete',
    add: 'Add',
    create: 'Create',
    menu: 'Menu',
    all: 'All',
  },
  form: {
    name: 'Name',
    birthYear: 'Birth Year',
    birthMonth: 'Birth Month',
    birthDay: 'Birth Day',
    birthHour: 'Birth Hour',
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    category: 'Category',
    email: 'Email',
    password: 'Password',
    year: 'Year',
    month: 'Month',
    day: 'Day',
    hour: 'Hour',
    currentSelection: 'Current Selection',
    birthTimeRange: 'Birth Time Range',
  },
  pages: {
    bazi: {
      title: 'BaZi Chart',
      subtitle: 'Traditional Chinese Astrology Analysis',
    },
    ziwei: {
      title: 'ZiWei Astrology',
      subtitle: 'Ancient Chinese Astrology Chart Analysis',
    },
    auth: {
      title: 'Web3 Login',
      subtitle: 'Connect your wallet to access AstroZi',
    },
    settings: {
      title: 'Settings',
      subtitle: 'Personal settings and preferences',
    },
    charts: {
      title: 'Chart Records',
      subtitle: 'My chart archive',
    },
    createChart: {
      title: 'Create Chart',
      subtitle: 'Enter birth information to generate chart',
    },
    wiki: {
      title: 'Knowledge Base',
      subtitle: 'Astrology knowledge library',
    },
  },
  instructions: {
    fillForm: 'Please fill in birth information',
    clickCalculate: 'Click calculate button to generate chart',
    saveChart: 'Save chart to your profile',
  },
  errors: {
    invalidInput: 'Invalid input information',
    networkError: 'Network connection error',
    authRequired: 'Please login first',
  },
  categories: {
    friends: 'Friends',
    family: 'Family',
    clients: 'Clients',
    favorites: 'Favorites',
    others: 'Others',
  },
  karmaPalace: {
    title: 'Karmic Connections',
    whatIsKarmaPalace: 'What is the Karma Palace?',
    whatIsKarmaPalaceDesc: 'The Karma Palace plays a crucial role in Ziwei Doushu astrology. It not only reflects personal inner motivations and potential abilities but also reveals relationships with others, affairs, and the material world. The configuration of the Karma Palace can influence personal destiny, career development, and interpersonal relationships.',
    importanceOfKarmaPalace: 'The Importance of the Karma Palace',
    importanceOfKarmaPalaceDesc: 'By analyzing the performance of the Karma Palace in different palace positions, we can gain insight into how individuals cope with challenges, utilize resources, and achieve self-worth in life. It emphasizes personal initiative and responsibility, reminding us how to balance our own needs with external environmental interactions in the pursuit of goals.',
    yourKarmaPalaceIn: 'Your Karma Palace is in',
    peopleAspect: 'People',
    mattersAspect: 'Matters',
    materialAspect: 'Material',
    palaceReference: 'Twelve Palaces Reference',
    palaceReferenceDesc: 'Therefore, the analysis of the Karma Palace is of great significance for understanding a person\'s destiny, personality, and future development direction.',
    palaceNames: {
      self: 'Self',
      siblings: 'Siblings',
      spouse: 'Spouse',
      children: 'Children',
      wealth: 'Wealth',
      health: 'Health',
      travel: 'Travel',
      friends: 'Friends',
      career: 'Career',
      property: 'Property',
      fortune: 'Fortune',
      parents: 'Parents',
    },
  },
  ziwei: {
    concepts: {
      systemName: 'ZiWei Astrology',
      systemAlias: 'ZiWei Dou Shu',
      description: 'ZiWei Astrology, also known as ZiWei Dou Shu, is often called "The Emperor of Chinese Astrology" - the most complex and detailed fortune-telling system in Chinese metaphysics.',
      nickname: 'The Emperor of Chinese Astrology',
      ultimateSystem: 'The Ultimate System',
      purpleStarAstrology: 'ZiWei Astrology',
      emperorOfChineseAstrology: 'The Emperor of Chinese Astrology',
      cosmicBlueprint: 'Cosmic Blueprint',
      precisionLifeEngineering: 'Precision Life Engineering',
      imperialGradeDestinyAnalysis: 'Imperial-Grade Destiny Analysis',
    },
    primaryStars: {
      ziwei: 'Emperor Star',
      tianji: 'Wisdom Star',
      taiyang: 'Solar Star',
      wuqu: 'Martial Wealth Star',
      tiantong: 'Harmonizer Star',
      lianzhou: 'Paradox Star',
      tianfu: 'Treasurer Star',
      taiyin: 'Lunar Star',
      tanlang: 'Desire Star',
      jumen: 'Great Gate Star',
      tianxiang: 'Minister Star',
      tianliang: 'Mentor Star',
      qisha: 'Killings Star',
      pojun: 'Revolution Star',
    },
    starDetails: {
      ziwei: {
        coreEssence: 'Leadership and nobility',
        symbolism: 'The North Star - constant, central, commanding respect',
        keyTraits: ['Natural-born leaders with strong presence', 'High self-esteem and dignity', 'Excellent organizational and management skills', 'Prefer to be in control and make decisions'],
        idealCareers: 'CEO, politician, director, team leader',
        relationshipStyle: 'Protective but can be domineering',
        lifeApproach: 'Seeks positions of authority and influence',
        challenges: 'Can be arrogant, struggles with taking orders'
      },
      tianji: {
        coreEssence: 'Strategic intelligence and adaptability',
        symbolism: 'The cosmic strategist - always calculating the best moves',
        keyTraits: ['Brilliant strategic mind and quick wit', 'Loves learning and intellectual challenges', 'Adaptable but sometimes inconsistent', 'Excellent at seeing patterns and connections'],
        idealCareers: 'Consultant, strategist, researcher, programmer',
        relationshipStyle: 'Values mental connection and intellectual stimulation',
        lifeApproach: 'Constantly seeking knowledge and new perspectives',
        challenges: 'Overthinking, difficulty with routine tasks'
      },
      taiyang: {
        coreEssence: 'Radiant energy and benevolence',
        symbolism: 'The sun - illuminating and energizing everything around',
        keyTraits: ['Generous and warm-hearted', 'Strong sense of justice and fairness', 'Enjoys helping others succeed', 'High energy but can burn out'],
        idealCareers: 'Teacher, social worker, public relations, healthcare',
        relationshipStyle: 'Giving and supportive, sometimes self-sacrificing',
        lifeApproach: 'Focuses on contribution to society',
        challenges: 'Tendency to give too much, neglecting self-care'
      },
      wuqu: {
        coreEssence: 'Financial acumen and decisive action',
        symbolism: 'The military commander - strategic with resources and bold in execution',
        keyTraits: ['Excellent with money and financial planning', 'Decisive and practical', 'Strong willpower and determination', 'Direct communication style'],
        idealCareers: 'Finance, banking, entrepreneurship, military',
        relationshipStyle: 'Loyal but may struggle with emotional expression',
        lifeApproach: 'Goal-oriented with focus on material security',
        challenges: 'Can be stubborn, impatient with inefficiency'
      },
      tiantong: {
        coreEssence: 'Peace and contentment',
        symbolism: 'The gentle breeze - bringing calm and comfort wherever it goes',
        keyTraits: ['Peaceful and easy-going nature', 'Excellent mediator and peacemaker', 'Appreciates beauty and comfort', 'Avoids conflict when possible'],
        idealCareers: 'Counselor, HR, hospitality, arts and design',
        relationshipStyle: 'Supportive and harmonious partner',
        lifeApproach: 'Seeks balance and avoids stress',
        challenges: 'May lack ambition, avoids necessary confrontations'
      },
      lianzhou: {
        coreEssence: 'Creative contradiction and transformation',
        symbolism: 'The paradox - beauty and destruction, creation and chaos in one',
        keyTraits: ['Emotionally complex and intense', 'Strong artistic and creative abilities', 'Charismatic and magnetic personality', 'Can be both inspiring and volatile'],
        idealCareers: 'Artist, performer, therapist, creative director',
        relationshipStyle: 'Passionate but can be possessive',
        lifeApproach: 'Seeks authentic self-expression through extremes',
        challenges: 'Emotional volatility, tendency toward contradictory behavior'
      },
      tianfu: {
        coreEssence: 'Stability and resource management',
        symbolism: 'The royal treasury - secure, abundant, and well-organized',
        keyTraits: ['Natural ability to accumulate and manage resources', 'Conservative and practical approach', 'Reliable and trustworthy', 'Values tradition and stability'],
        idealCareers: 'Accounting, real estate, banking, administration',
        relationshipStyle: 'Steady and dependable partner',
        lifeApproach: 'Building long-term security and wealth',
        challenges: 'Can be overly cautious, resistant to change'
      },
      taiyin: {
        coreEssence: 'Gentle intuition and nurturing care',
        symbolism: 'The moon - soft, receptive, and emotionally guided',
        keyTraits: ['Highly intuitive and empathetic', 'Gentle and caring nature', 'Strong connection to family and home', 'Prefers indirect rather than confrontational approaches'],
        idealCareers: 'Healthcare, education, psychology, family services',
        relationshipStyle: 'Nurturing and emotionally supportive',
        lifeApproach: 'Values emotional connections and family harmony',
        challenges: 'Can be overly sensitive, avoids direct confrontation'
      },
      tanlang: {
        coreEssence: 'Passion and versatility',
        symbolism: 'The seeker - driven by various desires and constantly exploring',
        keyTraits: ['Multi-talented and versatile', 'Strong drive for success and pleasure', 'Charismatic and socially skilled', 'Can be easily tempted by new opportunities'],
        idealCareers: 'Sales, entertainment, marketing, entrepreneurship',
        relationshipStyle: 'Charming but may struggle with commitment',
        lifeApproach: 'Pursues multiple interests and experiences',
        challenges: 'Inconsistency, difficulty focusing on one path'
      },
      jumen: {
        coreEssence: 'Perceptive communication and investigation',
        symbolism: 'The one who hears all whispers - detecting truth beneath the surface',
        keyTraits: ['Excellent communicator and speaker', 'Investigative and analytical mind', 'Strong sense of right and wrong', 'Highly perceptive of hidden meanings'],
        idealCareers: 'Lawyer, journalist, detective, public speaker',
        relationshipStyle: 'Values honest communication but can be critical',
        lifeApproach: 'Seeks truth and exposes what\'s hidden',
        challenges: 'Can be overly critical, tendency to gossip'
      },
      tianxiang: {
        coreEssence: 'Loyal service and diplomatic support',
        symbolism: 'The trusted minister - serving faithfully behind the throne',
        keyTraits: ['Natural helper and supporter', 'Diplomatic and tactful', 'Strong sense of duty and responsibility', 'Prefers to work behind the scenes'],
        idealCareers: 'Executive assistant, advisor, customer service, diplomacy',
        relationshipStyle: 'Supportive and accommodating partner',
        lifeApproach: 'Finds fulfillment in helping others succeed',
        challenges: 'May neglect own needs, can be indecisive'
      },
      tianliang: {
        coreEssence: 'Wisdom and protection',
        symbolism: 'The wise elder - offering guidance and shelter to those in need',
        keyTraits: ['Mature and wise beyond years', 'Natural protector and guide', 'Strong moral compass', 'Enjoys teaching and mentoring'],
        idealCareers: 'Teacher, counselor, coach, religious leader',
        relationshipStyle: 'Protective and guiding, sometimes controlling',
        lifeApproach: 'Seeks to help others grow and develop',
        challenges: 'Can be preachy, tendency to control others\' choices'
      },
      qisha: {
        coreEssence: 'Courage and independence',
        symbolism: 'The lone warrior - brave, independent, and ready for any challenge',
        keyTraits: ['Fearless and adventurous', 'Strong independent streak', 'Natural crisis manager', 'Dislikes routine and constraints'],
        idealCareers: 'Emergency services, military, extreme sports, crisis management',
        relationshipStyle: 'Independent but loyal once committed',
        lifeApproach: 'Seeks challenge and adventure',
        challenges: 'Can be reckless, difficulty with authority and routine'
      },
      pojun: {
        coreEssence: 'Transformation and innovation',
        symbolism: 'The revolutionary - breaking down old systems to build something better',
        keyTraits: ['Pioneer and innovator', 'Thrives on change and transformation', 'Creative problem solver', 'Can be disruptive and unstable'],
        idealCareers: 'Startup founder, innovator, artist, change management',
        relationshipStyle: 'Exciting but unpredictable partner',
        lifeApproach: 'Constantly seeking to improve and revolutionize',
        challenges: 'Can be destructive, difficulty maintaining stability'
      }
    },
    supportingStars: {
      zuofu: 'Left Assistant Star',
      youbi: 'Right Assistant Star',
      wenchang: 'Literary Excellence Star',
      wenqu: 'Literary Arts Star',
      tiankui: 'Sky Leader Star',
      tianyue: 'Sky Honor Star',
      qingyang: 'Ram Star',
      tuoluo: 'Spiral Star',
      huoxing: 'Mars Star',
      lingxing: 'Bell Star',
      dikong: 'Void Star',
      dijie: 'Robbery Star',
      tianma: 'Traveling Horse Star',
      hongyan: 'Red Phoenix Star',
      tianxi: 'Happiness Star',
      gukua: 'Loneliness Star',
    },
    supportingStarFunctions: {
      wenchang: 'Academic achievement',
      wenqu: 'Artistic talent',
      zuofuyoubi: 'Helpful people',
      tiankuitianyue: 'Noble mentors',
      huoxinglingxing: 'Explosive energy, conflicts',
      tianma: 'Travel and movement',
      hongyantianxi: 'Romance and marriage',
      dikongdijie: 'Spiritual void and material loss',
      qingyangtuoluo: 'Obstacles and delays',
      gukua: 'Loneliness and independence',
    },
    palaces: {
      ming: 'Life Palace',
      xiongdi: 'Siblings Palace',
      fuqi: 'Marriage Palace',
      zinv: 'Children Palace',
      caibo: 'Wealth Palace',
      jie: 'Health Palace',
      qianyi: 'Travel Palace',
      jiaoyou: 'Friends Palace',
      guanlu: 'Career Palace',
      tianzhai: 'Property Palace',
      fude: 'Fortune Palace',
      fumu: 'Parents Palace',
    },
    transformations: {
      sihua: 'Flying Stars',
      lu: 'Affluence Transformation',
      quan: 'Authority Transformation',
      ke: 'Merit Transformation',
      ji: 'Adversity Transformation',
      flyingStars: 'Flying Stars',
      transformationStates: 'Transformation States',
      starInteractions: 'Star Interactions',
      eventTriggers: 'Event Triggers',
      threeDimensions: 'Three Dimensions',
      karmicDimension: 'Karmic Dimension (事) - The Events',
      emotionalDimension: 'Emotional Dimension (人) - The People',
      materialDimension: 'Material Dimension (物) - The Resources',
      fourSeasons: 'Four Seasons Financial Cycle',
      springGrowth: 'Spring Growth (C)',
      summerStorm: 'Summer Storm (B)',
      autumnHarvest: 'Autumn Harvest (A)',
      winterStorage: 'Winter Storage (D)',
    },
    transformationDetails: {
      lu: {
        name: 'Affluence',
        season: 'Autumn Harvest',
        karmicAspect: 'Fated connections and divine arrangements',
        emotionalAspect: 'Unconditional love and acceptance',
        materialAspect: 'Natural flow of wealth and resources',
        wealthPattern: 'Money comes easily like autumn harvest, reaping what you\'ve sown'
      },
      quan: {
        name: 'Authority',
        season: 'Summer Storm',
        karmicAspect: 'Sudden, uncontrollable life changes',
        emotionalAspect: 'Possessive, controlling behavior',
        materialAspect: 'Sudden wealth and rapid loss',
        wealthPattern: 'Money comes like summer storms - intense, quick, and volatile'
      },
      ke: {
        name: 'Merit',
        season: 'Spring Growth',
        karmicAspect: 'Soul recognition and emotional destiny',
        emotionalAspect: 'Genuine appreciation and warm affection',
        materialAspect: 'Steady accumulation and continuous flow',
        wealthPattern: 'Money flows like spring rain - gentle, consistent growth'
      },
      ji: {
        name: 'Adversity',
        season: 'Winter Storage',
        karmicAspect: 'Unfinished business requiring resolution',
        emotionalAspect: 'Deep resentment and bitter disappointment',
        materialAspect: 'Final accumulation and hidden reserves',
        wealthPattern: 'Like bears storing for winter, accumulating lasting wealth through endings'
      }
    },
    flyingStarsTechnique: {
      secretWeapon: 'ZiWei\'s secret weapon for precise timing',
      starsFlying: 'Stars "fly" into different palaces each year',
      transformationChanges: 'Transformation states change (power, wealth, love, trouble)',
      eventCreation: 'Star interactions create specific event triggers',
      multipleConfirmations: 'Multiple confirmations ensure prediction accuracy',
      preciseTiming: 'Precise timing analysis',
      annualActivation: 'Annual palace activation',
      palaceInfluence: 'Palace influence and energy shifts',
      triDimensional: 'Operating across three dimensions simultaneously',
    },
    timing: {
      daxian: 'Major Cycles',
      liunian: 'Annual Influences',
      liuyue: 'Monthly Trends',
      liuri: 'Daily Influences',
      tenYearPhases: '10-year Life Phases',
      yearlyPredictions: 'Yearly Predictions',
      monthlyVariations: 'Monthly Variations',
      dailyTiming: 'Daily Timing',
      preciseTiming: 'Exact Timing System',
      cosmicTiming: 'Cosmic Timing',
    },
    analysis: {
      marriageRomance: 'Marriage & Romance Predictions',
      healthBody: 'Health & Body Analysis',
      wealthTiming: 'Wealth Timing & Sources',
      careerBreakthrough: 'Career Breakthrough',
      unparalleledPrecision: 'Unparalleled Precision in Timing',
      microscopicLifeAnalysis: 'Microscopic Life Analysis',
      comprehensiveMapping: '12-House Comprehensive Mapping',
      detailedMovieScript: 'Detailed Movie Script',
      surgicalPrecision: 'Surgical Precision',
      exactTiming: 'Exact Timing System',
      multipleConfirmations: 'Multiple Star Confirmation Systems',
      predictiveAccuracy: 'Predictive Accuracy',
      cosmicBlueprint: 'Cosmic Blueprint',
    },
  },
  bazi: {
    concepts: {
      systemName: 'BaZi',
      alternativeName: 'Four Pillars of Destiny',
      description: 'Traditional Chinese personality analysis and life prediction system based on birth time',
      foundation: 'Heavenly Stems and Earthly Branches foundation system',
      coreIdentity: 'Core Identity',
      personalityAnalysis: 'Personality Analysis',
      lifePrediction: 'Life Prediction',
      culturalContext: 'Cultural Context',
    },
    fourPillars: {
      structure: 'Four Pillars Structure',
      yearPillar: 'Year Pillar',
      monthPillar: 'Month Pillar',
      dayPillar: 'Day Pillar (Core Identity)',
      hourPillar: 'Hour Pillar',
      eightCharacters: 'Eight Characters',
      heavenlyStems: 'Heavenly Stems',
      earthlyBranches: 'Earthly Branches',
      sixtyYearCycle: '60-year cycle',
      dayMaster: 'Day Master',
      stemBranchRelations: 'Stem-Branch Relations',
    },
    analysisTypes: {
      categoricalPrediction: 'Categorical Prediction',
      yongshenAnalysis: 'Focal Element Analysis',
      tenGodsAnalysis: 'Ten Gods Analysis',
      luckCycles: 'Luck Cycles',
      fleetingYears: 'Fleeting Years',
    },
    elements: {
      jia: '甲(Jia, Yang Wood)',
      yi: '乙(Yi, Yin Wood)',
      bing: '丙(Bing, Yang Fire)',
      ding: '丁(Ding, Yin Fire)',
      wu: '戊(Wu, Yang Earth)',
      ji: '己(Ji, Yin Earth)',
      geng: '庚(Geng, Yang Metal)',
      xin: '辛(Xin, Yin Metal)',
      ren: '壬(Ren, Yang Water)',
      gui: '癸(Gui, Yin Water)',
    },
    dripFromHeaven: {
      originalText: '滴天髓',
      translation: 'Dripping from Heaven\'s Marrow',
      interpretation: 'Classical text on the essence of destiny analysis',
    },
    tenStars: {
      systemName: 'Ten Gods System',
      dayMaster: 'Day Master',
      relationshipBasis: 'Relationship Basis',
      peerGod: 'Peer God',
      rivalGod: 'Rival God',
      prosperityGod: 'Prosperity God',
      dramaGod: 'Drama God',
      wealthGod: 'Wealth God',
      fortuneGod: 'Fortune God',
      authorityGod: 'Authority God',
      warGod: 'War God',
      studyGod: 'Scholar God',
      mysticGod: 'Oracle God',
    },
    starFunctions: {
      peerGodFunction: 'Cooperation, friendship, equals',
      rivalGodFunction: 'Competition, conflict, partnership challenges',
      prosperityGodFunction: 'Creativity, expression, gentle output',
      dramaGodFunction: 'Innovation, rebellion, dramatic change',
      wealthGodFunction: 'Stable income, conservative investment',
      fortuneGodFunction: 'Windfall, business opportunities',
      authorityGodFunction: 'Legal authority, structured management',
      warGodFunction: 'Direct power, military leadership',
      studyGodFunction: 'Education, support, motherly care',
      mysticGodFunction: 'Controlling help, conditional support',
    },
    balance: {
      strong: 'Strong',
      weak: 'Weak',
      focalElement: 'Focal Element',
      unfavorableElement: 'Unfavorable Element',
      balanceKey: 'Balance Key',
      elementalBalance: 'Elemental Balance',
      strengthAnalysis: 'Strength Analysis',
      supportNeeded: 'Support Needed',
    },
    timing: {
      luckCycle: 'Luck Cycle',
      annualInfluences: 'Annual Influences',
      monthlyInfluences: 'Monthly Influences',
      tenYearCycles: 'Ten-year Cycles',
      yearlyChanges: 'Yearly Changes',
      monthlyVariations: 'Monthly Variations',
      timingOptimization: 'Timing Optimization',
      cyclicalPattern: 'Cyclical Pattern',
    },
    applications: {
      careerGuidance: 'Career Guidance',
      relationshipAnalysis: 'Relationship Analysis',
      timingAnalysis: 'Timing Analysis',
      personalityPsychology: 'Personality Psychology',
      selfUnderstanding: 'Self Understanding',
      lifeDecisions: 'Life Decisions',
      eventTiming: 'Event Timing',
      relationshipImprovement: 'Relationship Improvement',
    },
    cultural: {
      ancientWisdom: 'Ancient Wisdom',
      thousandYears: 'Thousand Years of History',
      personalitySystem: 'Personality System',
      westernComparison: 'Western Comparison',
      myersBriggs: 'Myers-Briggs',
      enneagram: 'Enneagram',
      globalAccessibility: 'Global Accessibility',
      culturalBridge: 'Cultural Bridge',
    },
  },
  navigation: {
    home: 'Home',
    dashboard: 'Dashboard',
    profile: 'Profile',
    settings: 'Settings',
    help: 'Help',
    about: 'About',
    wiki: 'Wiki',
    charts: 'Charts',
    createChart: 'Create Chart',
  },
  settings: {
    accountManagement: 'Account Management',
    myProfile: 'My Profile',
    preferences: 'Preferences',
    serviceSubscription: 'Service Subscription',
    membershipCenter: 'Membership Center',
    subscriptionService: 'Subscription Service',
    helpSupport: 'Help & Support',
    helpCenter: 'Help Center',
    systemSettings: 'System Settings',
    logout: 'Logout',
    membershipLevel: 'Membership Level',
    freeVersion: 'Free Version',
    member: 'Member',
    manageBirthInfo: 'Manage your birth information and personal profile',
    personalizeExperience: 'Personalize your experience',
    viewMembershipStatus: 'View membership status and exclusive benefits',
    manageSubscription: 'Manage subscription plans and paid services',
    faqGuide: 'User guide and frequently asked questions',
    secureLogout: 'Securely logout from your account',
    accountOverview: 'Account Overview',
    nicknameNotSet: 'Nickname not set',
    profileActivated: 'Activated',
    profileIncomplete: 'Incomplete',
    membershipLevelDesc: 'Membership Level',
    exclusiveBenefits: 'Enjoy exclusive benefits and services',
    profileReminder: 'Reminder:',
    completeProfile: 'Complete Profile',
    profileReminderDesc: 'Your profile is incomplete. Complete your profile information to enjoy more accurate analysis services.',
    contactSupport: 'Contact Support',
    loggingOut: 'Logging out...',
  },
  profile: {
    title: 'My Profile',
    subtitle: 'Manage your birth information for expert-level reports',
    returnToCharts: 'Return to My Charts after completion',
    returnToPrevious: 'Return to previous page after completion',
    importantReminder: 'Important Reminder:',
    reminderText: 'You have one free opportunity to modify your birth date and gender. Birth time can be modified unlimited times. Updated information will be used for more accurate expert reports.',
    basicInfo: 'Basic Information',
    basicInfoDesc: 'Complete your basic profile information',
    personalProfile: 'Personal Profile',
    personalProfileDesc: 'Customize your personal information',
    birthDate: 'Birth Date',
    birthTime: 'Birth Time',
    birthLocation: 'Birth Location',
    gender: 'Gender',
    nickname: 'Nickname',
    male: 'Male',
    female: 'Female',
    edit: 'Edit',
    save: 'Save',
    cancel: 'Cancel',
    saving: 'Saving...',
    notSet: 'Not Set',
    selectDate: 'Select Date',
    selectTime: 'Select Time',
    enterLocation: 'Enter birth location',
    enterNickname: 'Enter nickname',
    selectGender: 'Select Gender',
    year: 'Year',
    month: 'Month',
    day: 'Day',
    hour: 'Hour',
    minute: 'Minute',
    am: 'AM',
    pm: 'PM',
    pleaseLoginFirst: 'Please login first',
    loginToManageProfile: 'Login to manage your profile',
    goToLogin: 'Go to Login',
    loading: 'Loading...',
    saveSuccess: 'Saved successfully!',
    saveFailed: 'Save failed, please try again',
    genderEditLimitExceeded: 'You have used your free gender modification opportunity. Further modifications require paid service.',
    genderChangeConfirm: 'Important Notice:\n\nYou have already used your free gender modification opportunity.\n\nContinuing to modify gender will require paid service.\n\nDo you want to continue?',
    emailMismatch: 'Email address does not match, operation cancelled',
    profileComplete: 'Profile Complete',
    profileIncomplete: 'Profile Incomplete',
    completeYourProfile: 'Complete your profile to enjoy more accurate analysis services',
    birthInfoValidation: 'Birth information validation in progress',
    profileStats: 'Profile Statistics',
    joinedDate: 'Joined Date',
    lastUpdated: 'Last Updated',
    editCount: 'Edit Count',
    genderEditCount: 'Gender Edit Count'
  },
  membership: {
    title: 'Membership Status',
    subtitle: 'membership information',
    membershipStatus: 'Membership Status',
    personalInfo: 'Personal Information',
    personalInfoDesc: 'View and manage your account information',
    usageStats: 'Usage Statistics',
    usageStatsDesc: 'View your service usage and remaining credits',
    accountActions: 'Account Actions',
    accountActionsDesc: 'Manage your account and data',
    premiumMember: 'Premium Member',
    freeReports: 'Free Reports',
    paidReports: 'Paid Reports Used',
    chatbotDialogs: 'ChatBot Dialogs',
    expertReports: 'Expert Reports',
    membershipExpiry: 'Premium membership expires on',
    emailAddress: 'Email Address',
    joinDate: 'Join Date',
    lastActive: 'Last Active',
    exportData: 'Export Data',
    importData: 'Import Data',
    resetSettings: 'Reset Settings',
    deleteAccount: 'Delete Account',
    exportDataDesc: 'Export your data and analysis results',
    importDataDesc: 'Import backup data',
    resetSettingsDesc: 'Reset all settings to default',
    deleteAccountDesc: 'Permanently delete your account and all data',
    exportDataInProgress: 'Data export feature in development...',
    importDataInProgress: 'Data import feature in development...',
    resetSettingsConfirm: 'Are you sure you want to reset all settings to default? This action cannot be undone.',
    settingsReset: 'Settings have been reset, please refresh the page.',
    deleteAccountConfirm: '⚠️ Account deletion is irreversible!\n\nThis will delete all your data:\n• All birth charts\n• All AI analysis results\n• User profile and settings\n• Membership benefits\n\nPlease enter your email address to confirm deletion:',
    deleteAccountSuccess: 'Account deleted successfully. Thank you for using our service.',
    deleteAccountFailed: 'Account deletion failed:',
    newUserTip: '💡 Tip: New users start with 0 credits by default. Please use daily check-in to get free usage credits!',
    loadingFailed: 'Loading Failed',
    reload: 'Reload',
    loading: 'Loading...',
    deleting: 'Deleting...'
  },
  subscription: {
    title: 'Membership Plans',
    subtitle: 'Choose the perfect plan for your astrology needs',
    membershipComparison: 'Membership Plans Comparison',
    chooseYourPlan: 'Choose the perfect plan for your astrology needs',
    purchaseCredits: 'Purchase Analysis Credits',
    purchaseCreditsDesc: 'Flexible AI analysis credits purchase, pay as you go',
    mostPopular: 'Most Popular',
    recommended: 'Recommended',
    bestValue: 'Best Value',
    freeText: 'Free',
    buyCredits: 'Buy {count} Credits',
    unitPrice: 'Unit Price',
    perCredit: '/credit',
    permanentValidity: 'Permanent validity, never expires',
    stackable: 'Stackable',
    aiAnalysisReports: 'AI Analysis Reports',
    faq: 'Frequently Asked Questions',
    faqMembershipExpiry: '🤔 What happens when membership expires?',
    faqMembershipExpiryAnswer: 'When membership expires, you will automatically be downgraded to a free user, retaining all historical data, but member-exclusive features will be limited.',
    faqUpgradePlans: '⬆️ Can I upgrade or change membership plans?',
    faqUpgradePlansAnswer: 'You can choose any new membership plan after your current membership expires. Upgrades during membership are not currently supported.',
    faqCreditsExpiry: '⏰ Do purchased analysis credits expire?',
    faqCreditsExpiryAnswer: 'No, they do not expire. Purchased analysis credits are permanently saved in your account and can be used anytime, stacking with membership benefits.',
    faqPaymentMethods: '💳 What payment methods are supported?',
    faqPaymentMethodsAnswer: 'We support credit cards, WeChat Pay, Alipay, and other mainstream payment methods (through secure Stripe payment).',
    creditsStackingTip: '💡 Purchased analysis credits will be directly credited to your account, stacking with membership benefits',
    purchaseProcessing: 'Processing purchase...',
    purchaseFailed: 'Purchase failed, please try again later.'
  },
  preferences: {
    title: 'Preferences',
    subtitle: 'Personalize your experience',
    themeSettings: 'Theme Settings',
    themeSettingsDesc: 'Choose your preferred color theme',
    languageSettings: 'Language Settings',
    languageSettingsDesc: 'Choose your preferred display language',
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
    systemMode: 'System Mode',
    chinese: 'Chinese',
    english: 'English',
    japanese: 'Japanese',
    comingSoon: 'Coming Soon',
    comingSoonDesc: 'This language version is coming soon!',
    currentTheme: 'Current Theme',
    currentLanguage: 'Current Language',
    available: 'Available',
    notAvailable: 'Not Available'
  },
  charts: {
    noChartsYet: 'No chart records yet',
    createFirstChart: 'Create your first chart from the home menu or charts page',
    createFirstChartDesktop: 'Create your first chart from the left navigation or chart page',
    chartRecords: 'Chart Records',
    createNewChart: 'Create New Chart',
    selectChart: 'Select Chart',
    baziAnalysis: 'BaZi Natal',
    ziweiAnalysis: 'ZiWei Astrology',
    loadingAnalysis: 'Loading analysis...',
    noAnalysis: 'No analysis',
    analysisReports: 'Analysis Reports',
    reports: 'Reports',
    collapse: 'Collapse',
    viewAnalysis: 'View Analysis',
    deleteAnalysis: 'Delete Analysis',
    aiAnalysisResult: 'AI Analysis Result',
    confirmDeleteChart: 'Confirm delete chart?',
    deleteChartWarning: 'Deleting chart will remove all analysis data and cannot be undone.',
    deleteFailed: 'Delete failed',
    deleteFailedMessage: 'Delete failed, please try again.',
    confirmDeleteAnalysis: 'Confirm delete analysis?',
    deleteAnalysisWarning: 'Deleting analysis will remove all data and cannot be undone.',
    chartTypes: {
      bazi: 'BaZi',
      ziwei: 'Ziwei',
    },
  },
  createChart: {
    selectBirthTime: 'Select Birth Time',
    timePickerTitle: 'Select Birth Time',
    birthDate: 'Birth Date',
    birthTime: 'Birth Time',
    saveChart: 'Save Chart',
    chartName: 'Chart Name',
    chartCategory: 'Chart Category',
    pleaseEnterName: 'Please enter name',
    pleaseSelectCategory: 'Please select category',
    saving: 'Saving...',
    chartSaved: 'Chart saved successfully',
    saveFailed: 'Save failed',
  },
  wiki: {
    knowledgeBase: 'Knowledge Base',
    allCategories: 'All Categories',
    baziBasics: 'BaZi Basics',
    ziweiDoushu: 'ZiWei Astrology',
    wuxingTheory: 'Five Elements Theory',
    yijingWisdom: 'I Ching Wisdom',
    schoolComparison: 'School Comparison',
    hotArticles: 'Hot Articles',
    readTime: 'Read Time',
    minutes: 'minutes',
    views: 'views',
    searchPlaceholder: 'Search knowledge base...',
    tgdzMeaning: 'Heavenly Stems & Earthly Branches, Five Elements',
    wuxingLifeCycle: 'Generation and Restraint, Balance and Harmony',
    starsAndPalaces: 'Stars and Palaces, Four Transformations',
    sihuaFlying: 'Four Transformations Flying Star Techniques',
    yijingWisdomGuide: 'I Ching Wisdom, Hexagram Analysis',
    baziBasicsDesc: 'Heavenly Stems & Earthly Branches, Five Elements',
    ziweiBasicsDesc: 'Stars and Palaces, Four Transformations',
    wuxingTheoryDesc: 'Generation and Restraint, Balance and Harmony',
    yijingWisdomDesc: 'I Ching Wisdom, Hexagram Analysis',
    schoolComparisonDesc: 'Different schools and theoretical comparisons',
  },
};

// 日语字典
export const jaDict: Dictionary = {
  common: {
    calculate: '計算',
    save: '保存',
    clear: 'クリア',
    cancel: 'キャンセル',
    confirm: '確認',
    loading: '読み込み中...',
    error: 'エラー',
    success: '成功',
    submit: '送信',
    reset: 'リセット',
    back: '戻る',
    next: '次へ',
    search: '検索',
    filter: 'フィルター',
    refresh: '更新',
    close: '閉じる',
    edit: '編集',
    delete: '削除',
    add: '追加',
    create: '作成',
    menu: 'メニュー',
    all: 'すべて',
  },
  
  form: {
    name: '名前',
    birthYear: '生年',
    birthMonth: '生月',
    birthDay: '生日',
    birthHour: '生時',
    gender: '性別',
    male: '男性',
    female: '女性',
    category: 'カテゴリー',
    email: 'メール',
    password: 'パスワード',
    year: '年',
    month: '月',
    day: '日',
    hour: '時',
    currentSelection: '現在の選択',
    birthTimeRange: '生時範囲',
  },

  pages: {
    bazi: {
      title: '八字排盤',
      subtitle: '伝統八字命理分析',
    },
    ziwei: {
      title: '紫微斗数',
      subtitle: '紫微斗数命盤分析',
    },
    auth: {
      title: 'Web3 ログイン',
      subtitle: 'ウォレットを接続して AstroZi の全機能を利用',
    },
    settings: {
      title: '設定',
      subtitle: 'アカウント設定と環境設定',
    },
    charts: {
      title: '命盤記録',
      subtitle: '保存された命盤とチャート',
    },
    createChart: {
      title: '命盤作成',
      subtitle: '新しい八字または紫微斗数命盤を作成',
    },
    wiki: {
      title: '知識ベース',
      subtitle: '命理学習リソースと参考資料',
    },
  },

  instructions: {
    fillForm: 'フォームに必要な情報を入力してください',
    clickCalculate: '計算ボタンをクリックして結果を生成',
    saveChart: 'チャートを保存して後でアクセス',
  },

  errors: {
    invalidInput: '入力データが無効です',
    networkError: 'ネットワークエラーが発生しました',
    authRequired: 'この操作にはログインが必要です',
  },

  categories: {
    friends: '友人',
    family: '家族',
    clients: 'クライアント',
    favorites: 'お気に入り',
    others: 'その他',
  },

  karmaPalace: {
    title: '来因宫',
    whatIsKarmaPalace: '来因宫とは',
    whatIsKarmaPalaceDesc: '来因宫は過去世からの因縁を示す重要な宮位です',
    importanceOfKarmaPalace: '来因宫の重要性',
    importanceOfKarmaPalaceDesc: 'この宮位は人生の根本的なカルマと運命を理解する鍵となります',
    yourKarmaPalaceIn: 'あなたの来因宫は',
    peopleAspect: '人的側面',
    mattersAspect: '事的側面', 
    materialAspect: '物的側面',
    palaceReference: '宮位参照',
    palaceReferenceDesc: '各宮位の意味と影響',
    palaceNames: {
      self: '自分',
      siblings: '兄弟',
      spouse: '配偶者',
      children: '子女',
      wealth: '財運',
      health: '健康',
      travel: '移動',
      friends: '友人',
      career: '職業',
      property: '不動産',
      fortune: '福徳',
      parents: '両親',
    },
  },

  navigation: {
    home: 'ホーム',
    dashboard: 'ダッシュボード',
    profile: 'プロフィール',
    settings: '設定',
    help: 'ヘルプ',
    about: '概要',
    wiki: '百科',
    charts: '命盤記録',
    createChart: '命盤作成',
  },

  settings: {
    accountManagement: 'アカウント管理',
    myProfile: 'マイプロフィール',
    preferences: '環境設定',
    serviceSubscription: 'サービス購読',
    membershipCenter: 'メンバーシップセンター',
    subscriptionService: '購読サービス',
    helpSupport: 'ヘルプ・サポート',
    helpCenter: 'ヘルプセンター',
    systemSettings: 'システム設定',
    languageSettings: '言語設定',
    themeSettings: 'テーマ設定',
    notificationSettings: '通知設定',
    privacySettings: 'プライバシー設定',
    securitySettings: 'セキュリティ設定',
    accountSettings: 'アカウント設定',
    dataSyncSettings: 'データ同期設定',
    exportSettings: 'エクスポート設定',
    backupSettings: 'バックアップ設定',
    subscriptionManagement: '購読管理',
    billingInformation: '請求情報',
    membershipBenefits: 'メンバーシップ特典',
    upgradeSubscription: '購読アップグレード',
    cancelSubscription: '購読キャンセル',
    renewalSettings: '更新設定',
    paymentMethods: '支払い方法',
    usageStatistics: '使用統計',
    activityLog: 'アクティビティログ',
    sessionHistory: 'セッション履歴',
    loginHistory: 'ログイン履歴',
    deviceManagement: 'デバイス管理',
    securityLog: 'セキュリティログ',
    dataExport: 'データエクスポート',
    dataImport: 'データインポート',
    dataBackup: 'データバックアップ',
    dataRestore: 'データ復元',
    accountDeletion: 'アカウント削除',
    deactivateAccount: 'アカウント無効化',
    reactivateAccount: 'アカウント再有効化',
    changePassword: 'パスワード変更',
    twoFactorAuth: '二段階認証',
    socialMediaLink: 'ソーシャルメディア連携',
    apiAccess: 'API アクセス',
    developerSettings: '開発者設定',
    betaFeatures: 'ベータ機能',
    feedbackSubmission: 'フィードバック送信',
    contactSupport: 'サポート連絡',
    reportIssue: '問題報告',
    featureRequest: '機能リクエスト',
    documentationAccess: 'ドキュメントアクセス',
    communityForum: 'コミュニティフォーラム',
    newsUpdates: 'ニュース・アップデート',
    systemStatus: 'システム状況',
    maintenanceSchedule: 'メンテナンス予定',
    serviceAnnouncements: 'サービス告知',
    emergencyNotifications: '緊急通知',
    loggingOut: 'ログアウト中',
  },

  ziwei: {
    concepts: {
      systemName: '紫微斗数',
      systemAlias: '紫微斗数命理',
      description: '中国古代の星座命理学システム',
      nickname: '帝王の占術',
      ultimateSystem: '究極のシステム',
      purpleStarAstrology: '紫星占星術',
      emperorOfChineseAstrology: '中国占星術の皇帝',
      cosmicBlueprint: '宇宙の設計図',
      precisionLifeEngineering: '精密人生工学',
      imperialGradeDestinyAnalysis: '皇室級運命分析',
      marriageRomance: '結婚・恋愛',
      healthBody: '健康・身体',
      wealthTiming: '財富・時期',
      careerBreakthrough: '職業・突破',
      unparalleledPrecision: '比類なき精密性',
      microscopicLifeAnalysis: '顕微鏡的人生分析',
      comprehensiveMapping: '包括的マッピング',
      multipleConfirmations: '多重確認',
      predictiveAccuracy: '予測精度',
    },

    primaryStars: {
      ziwei: '紫微',
      tianji: '天機',
      taiyang: '太陽',
      wuqu: '武曲',
      tiantong: '天同',
      lianzhou: '廉貞',
      tianfu: '天府',
      taiyin: '太陰',
      tanlang: '貪狼',
      jumen: '巨門',
      tianxiang: '天相',
      tianliang: '天梁',
      qisha: '七殺',
      pojun: '破軍',
    },

    starDetails: {
      ziwei: {
        coreEssence: '皇帝の星',
        symbolism: '権力と威厳',
        keyTraits: ['リーダーシップ', '高貴さ', '責任感'],
        idealCareers: '経営管理、政治、教育',
        relationshipStyle: '保護的で責任感が強い',
        lifeApproach: '堂々として威厳ある',
        challenges: 'プライドが高すぎる傾向',
      },
      tianji: {
        coreEssence: '智慧の星',
        symbolism: '変化と機知',
        keyTraits: ['聡明さ', '適応力', '変化対応'],
        idealCareers: 'コンサルタント、研究、IT',
        relationshipStyle: '理解力があり柔軟',
        lifeApproach: '機敏で変化に富む',
        challenges: '不安定になりがち',
      },
      taiyang: {
        coreEssence: '太陽の星',
        symbolism: '光明と活力',
        keyTraits: ['活発さ', '正義感', '外向性'],
        idealCareers: '営業、広報、エンターテイメント',
        relationshipStyle: '明るく開放的',
        lifeApproach: '積極的で前向き',
        challenges: '燃え尽き症候群のリスク',
      },
      wuqu: {
        coreEssence: '武将の星',
        symbolism: '勇気と財力',
        keyTraits: ['決断力', '実行力', '財運'],
        idealCareers: 'ビジネス、金融、軍事',
        relationshipStyle: '頼れる守護者',
        lifeApproach: '実用的で現実的',
        challenges: '頑固になりすぎる',
      },
      tiantong: {
        coreEssence: '調和の星',
        symbolism: '平和と満足',
        keyTraits: ['平和主義', '楽観性', '調和'],
        idealCareers: 'カウンセリング、芸術、サービス業',
        relationshipStyle: '温和で理解ある',
        lifeApproach: '穏やかで満足感重視',
        challenges: '野心不足の傾向',
      },
      lianzhou: {
        coreEssence: '炎の星',
        symbolism: '情熱と矛盾',
        keyTraits: ['情熱的', '複雑さ', '変化'],
        idealCareers: 'クリエイティブ、研究、心理学',
        relationshipStyle: '情熱的だが複雑',
        lifeApproach: '激しく変化に富む',
        challenges: '感情の起伏が激しい',
      },
      tianfu: {
        coreEssence: '宝庫の星',
        symbolism: '安定と蓄積',
        keyTraits: ['安定性', '保守性', '蓄積力'],
        idealCareers: '財務、不動産、保険',
        relationshipStyle: '安定して信頼できる',
        lifeApproach: '着実で慎重',
        challenges: '変化への抵抗',
      },
      taiyin: {
        coreEssence: '月の星',
        symbolism: '優雅と内省',
        keyTraits: ['優雅さ', '内向性', '感受性'],
        idealCareers: '芸術、文学、美容',
        relationshipStyle: '繊細で思いやりがある',
        lifeApproach: '内省的で芸術的',
        challenges: '過度に敏感になりがち',
      },
      tanlang: {
        coreEssence: '欲望の星',
        symbolism: '多才と欲求',
        keyTraits: ['多才さ', '好奇心', '欲求'],
        idealCareers: '営業、エンターテイメント、起業',
        relationshipStyle: '魅力的だが複雑',
        lifeApproach: '多様で刺激的',
        challenges: '集中力不足の傾向',
      },
      jumen: {
        coreEssence: '口舌の星',
        symbolism: 'コミュニケーションと論争',
        keyTraits: ['弁舌力', '分析力', '批判精神'],
        idealCareers: '法律、ジャーナリズム、教育',
        relationshipStyle: '率直だが時に辛辣',
        lifeApproach: '分析的で批判的',
        challenges: '言葉が厳しすぎる傾向',
      },
      tianxiang: {
        coreEssence: '宰相の星',
        symbolism: '補佐と調整',
        keyTraits: ['補佐能力', '協調性', '忠実さ'],
        idealCareers: '管理職、人事、コーディネート',
        relationshipStyle: '支援的で協力的',
        lifeApproach: '協調的でバランス重視',
        challenges: '主体性不足の傾向',
      },
      tianliang: {
        coreEssence: '長老の星',
        symbolism: '智慧と指導',
        keyTraits: ['智慧', '指導力', '保護欲'],
        idealCareers: '教育、カウンセリング、宗教',
        relationshipStyle: '保護的で指導的',
        lifeApproach: '智慧重視で指導的',
        challenges: '説教がましい傾向',
      },
      qisha: {
        coreEssence: '孤独の星',
        symbolism: '独立と突破',
        keyTraits: ['独立性', '突破力', '孤高'],
        idealCareers: '研究、技術、独立事業',
        relationshipStyle: '独立的で距離を保つ',
        lifeApproach: '独立志向で突破重視',
        challenges: '孤立しやすい傾向',
      },
      pojun: {
        coreEssence: '開拓の星',
        symbolism: '革新と破壊',
        keyTraits: ['革新性', '開拓精神', '破壊力'],
        idealCareers: '起業、革新、改革',
        relationshipStyle: '刺激的だが不安定',
        lifeApproach: '革新的で変化志向',
        challenges: '破壊的になりすぎる傾向',
      },
    },

    palaces: {
      ming: '命宫',
      xiongdi: '兄弟宫',
      fuqi: '夫妻宫',
      zinv: '子女宫',
      caibo: '財帛宫',
      jie: '疾厄宫',
      qianyi: '遷移宫',
      jiaoyou: '交友宫',
      guanlu: '官禄宫',
      tianzhai: '田宅宫',
      fude: '福德宫',
      fumu: '父母宫',
    },

    transformations: {
      sihua: '四化',
      lu: '化禄',
      quan: '化権',
      ke: '化科',
      ji: '化忌',
      flyingStars: '飛星',
      transformationStates: '変化状態',
      starInteractions: '星の相互作用',
      eventTriggers: 'イベントトリガー',
      threeDimensions: '三次元',
      karmicDimension: 'カルマ次元',
      temporalDimension: '時間次元',
      spatialDimension: '空間次元',
      seasonalInfluences: '季節の影響',
      springGrowth: '春の成長',
      summerFlourishing: '夏の繁栄',
      autumnHarvest: '秋の収穫',
      winterStorage: '冬の蓄積',
    },
  },

  bazi: {
    concepts: {
      systemName: '八字',
      alternativeName: '四柱命理',
      description: '出生時間に基づく伝統的中国人格分析および人生予測システム',
      foundation: '天干地支基礎システム',
      coreIdentity: '核心アイデンティティ',
      personalityAnalysis: '性格分析',
      lifePrediction: '人生予測',
      culturalContext: '文化的背景',
    },

    heavenlyStems: {
      jia: '甲',
      yi: '乙', 
      bing: '丙',
      ding: '丁',
      wu: '戊',
      ji: '己',
      geng: '庚',
      xin: '辛',
      ren: '壬',
      gui: '癸',
    },

    earthlyBranches: {
      zi: '子',
      chou: '丑',
      yin: '寅',
      mao: '卯',
      chen: '辰',
      si: '巳',
      wu: '午',
      wei: '未',
      shen: '申',
      you: '酉',
      xu: '戌',
      hai: '亥',
    },

    tenGods: {
      zhengyin: '正印',
      pianyin: '偏印',
      zhengcai: '正財',
      piancai: '偏財',
      zhengguan: '正官',
      qisha: '七殺',
      shanggguan: '傷官',
      shishen: '食神',
      bijian: '比肩',
      jiecai: '劫財',
    },

    elements: {
      wood: '木',
      fire: '火',
      earth: '土',
      metal: '金',
      water: '水',
    },

    interactions: {
      generation: '相生',
      restraint: '相克',
      harmony: '相合',
      conflict: '相沖',
      punishment: '相刑',
      harm: '相害',
      destruction: '相破',
    },

    strength: {
      strong: '身強',
      weak: '身弱',
      balanced: 'バランス',
      extreme: '極端',
    },

    usefulGods: {
      useful: '用神',
      joyful: '喜神',
      avoid: '忌神',
      hateful: '仇神',
      leisure: '閒神',
    },

    timePillars: {
      year: '年柱',
      month: '月柱',
      day: '日柱',
      hour: '時柱',
    },
  },

  charts: {
    saved: '保存済み',
    recent: '最新',
    favorites: 'お気に入り',
    all: 'すべて',
    createNew: '新規作成',
    import: 'インポート',
    export: 'エクスポート',
    delete: '削除',
    deleteConfirm: '削除確認',
    deleteSuccess: '削除完了',
    deleteFailed: '削除失敗',
    deleteFailedMessage: '削除に失敗しました。再試行してください。',
    confirmDeleteAnalysis: '分析の削除を確認しますか？',
    deleteAnalysisWarning: '分析を削除するとすべてのデータが削除され、元に戻せません。',
    chartTypes: {
      bazi: '八字',
      ziwei: '紫微',
    },
  },

  createChart: {
    selectBirthTime: '出生時間選択',
    timePickerTitle: '出生時間選択',
    birthDate: '出生年月日',
    birthTime: '出生時間',
    saveChart: 'チャート保存',
    chartName: 'チャート名',
    chartCategory: 'チャートカテゴリ',
    pleaseEnterName: '名前を入力してください',
    pleaseSelectCategory: 'カテゴリを選択してください',
    saving: '保存中...',
    chartSaved: 'チャートが保存されました',
    saveFailed: '保存に失敗しました',
  },

  wiki: {
    knowledgeBase: '知識ベース',
    allCategories: 'すべてのカテゴリ',
    baziBasics: '八字基礎',
    ziweiDoushu: '紫微斗数',
    wuxingTheory: '五行理論',
    yijingWisdom: '易経智慧',
    schoolComparison: '流派比較',
    hotArticles: '人気記事',
    readTime: '読了時間',
    minutes: '分',
    views: '閲覧数',
    searchPlaceholder: '知識ベースを検索...',
    tgdzMeaning: '天干地支、五行',
    wuxingLifeCycle: '生克制化、均衡調和',
    starsAndPalaces: '星曜宮位、四化',
    sihuaFlying: '四化飛星技法',
    yijingWisdomGuide: '易経智慧、卦象分析',
    baziBasicsDesc: '天干地支、五行',
    ziweiBasicsDesc: '星曜宮位、四化',
    wuxingTheoryDesc: '生克制化、均衡調和',
    yijingWisdomDesc: '易経智慧、卦象分析',
    schoolComparisonDesc: '各流派と理論比較',
  },
};

// 获取字典函数
export function getDictionary(locale: 'zh' | 'en' | 'ja'): Dictionary {
  switch (locale) {
    case 'en':
      return enDict;
    case 'ja':
      return jaDict;
    default:
      return zhDict;
  }
} 
