// 日语UI界面翻译补充
// 专门用于补充现有翻译系统中缺失的日语内容

export const japaneseUITranslations = {
  // 页面标题和导航
  pages: {
    home: {
      title: 'AstroZi 星玺 - ホーム',
      subtitle: '古代東洋の智慧と現代AI技術の融合',
      welcome: 'ようこそ、AstroZi 星玺へ'
    },
    bazi: {
      title: '八字分析',
      subtitle: '生年月日から運命を読み解く',
      description: '古代中国の智慧による精密な人生分析システム'
    },
    ziwei: {
      title: '紫微斗数',
      subtitle: '星の配置から人生を占う',
      description: '紫微斗数による運命と性格の詳細分析'
    },
    wiki: {
      title: '知識ベース',
      subtitle: '命理学の智慧を学ぶ',
      searchPlaceholder: '知識ベースを検索...',
      categories: 'カテゴリ',
      popularArticles: '人気記事',
      recentArticles: '最新記事',
      noResults: '検索結果が見つかりません'
    },
    settings: {
      title: '設定',
      subtitle: 'アカウントとアプリケーションの設定',
      profile: 'プロフィール設定',
      preferences: '環境設定',
      privacy: 'プライバシー設定',
      security: 'セキュリティ設定'
    },
    preferences: {
      title: '設定',
      subtitle: 'あなたの体験をカスタマイズ',
      theme: {
        title: 'テーマ設定',
        description: 'お好みのインターフェーススタイルを選択'
      },
      language: {
        title: '言語設定',
        description: 'お好みの表示言語を選択',
        support: '🌐 中国語、日本語、英語インターフェースをサポートしています。いつでも言語を切り替えられます！',
        comingSoon: '近日公開'
      }
    },
    charts: {
      title: 'マイチャート',
      subtitle: '保存されたチャートを管理',
      createNew: '新規チャート作成',
      noCharts: 'チャートがまだありません',
      lastUpdated: '最終更新'
    },
    auth: {
      title: '認証',
      subtitle: 'アカウントにログインまたは新規登録'
    }
  },

  // フォーム要素
  form: {
    birthInfo: {
      name: 'お名前',
      namePlaceholder: 'お名前を入力してください',
      birthDate: '生年月日',
      birthTime: '出生時刻',
      birthPlace: '出生地',
      gender: '性別',
      male: '男性',
      female: '女性',
      year: '年',
      month: '月',
      day: '日',
      hour: '時',
      minute: '分',
      unknown: '不明'
    },
    validation: {
      required: 'この項目は必須です',
      invalidDate: '無効な日付です',
      invalidTime: '無効な時刻です',
      invalidName: '有効な名前を入力してください',
      selectGender: '性別を選択してください',
      selectBirthTime: '出生時刻を選択してください'
    },
    buttons: {
      calculate: '計算する',
      save: '保存',
      reset: 'リセット',
      cancel: 'キャンセル',
      continue: '続行',
      goBack: '戻る',
      finish: '完了',
      retry: '再試行'
    }
  },

  // 分析結果
  analysis: {
    loading: '分析中...',
    completed: '分析完了',
    failed: '分析に失敗しました',
    retryAnalysis: '分析を再実行',
    shareResult: '結果を共有',
    downloadPdf: 'PDFダウンロード',
    sections: {
      basic: '基本情報',
      personality: '性格分析',
      career: '事業運',
      love: '恋愛運',
      health: '健康運',
      wealth: '財運',
      family: '家庭運',
      suggestions: '改善提案'
    }
  },

  // ナビゲーション
  navigation: {
    menu: 'メニュー',
    home: 'ホーム',
    analysis: '分析',
    charts: 'チャート',
    wiki: '知識ベース',
    settings: '設定',
    profile: 'プロフィール',
    logout: 'ログアウト',
    backToTop: 'トップに戻る',
    // 移动端导航专用翻译
    mobile: {
      // メインナビ項目
      encyclopedia: '百科事典',
      commandBooks: '命書',
      createChart: '命盤作成',
      aiMaster: 'AI大師',
      preferences: '環境設定',
      // サブナビ項目
      xuanxuDaoist: '玄虚道人',
      astronomyMinister: '司天監正・星玄大人',
      // 設定サブ項目
      myProfile: 'マイプロフィール',
      memberCenter: '会員センター',
      subscriptionService: 'サブスクリプション',
      contactUs: 'お問い合わせ',
      helpCenter: 'ヘルプセンター',
      logoutAccount: 'ログアウト',
      // クイック操作
      backToHome: 'ホームに戻る',
      dailyCheckIn: '毎日チェックイン',
      baziAnalysis: '八字分析',
      ziweiDouShu: '紫微斗数',
      // 命書関連
      allRecords: '全て',
      friends: '友人',
      family: '家族',
      clients: '顧客',
      favorites: 'お気に入り',
      others: 'その他',
      chartMigrated: '命盤機能が移行されました',
      chartMigratedDesc: '/charts ページで新しい命盤管理システムをご利用ください',
      goToNewChart: '新版命盤へ',
      noRecords: 'まだ命書の記録がありません',
      createFirstChart: '右上の + ボタンをクリックして最初の命盤を作成してください',
      noFriendsRecords: '友人カテゴリの記録がありません',
      noFamilyRecords: '家族カテゴリの記録がありません',
      noClientsRecords: '顧客カテゴリの記録がありません',
      noFavoritesRecords: 'お気に入りカテゴリの記録がありません',
      noOthersRecords: 'その他カテゴリの記録がありません',
      redirectingToHome: 'ホームページにリダイレクト中...',
      // サブスクリプション関連
      subscriptionService2: 'サブスクリプションサービス',
      choosePlan: 'あなたに適したプランを選択してください',
      professionalPlan: 'プロフェッショナル版',
      fullFeatures: '全機能',
      unlimitedAnalysis: '無制限分析',
      aiProfessionalReading: 'AI専門解読',
      detailedFortune: '詳細運勢',
      subscribeNow: '今すぐ登録',
      basicPlan: 'ベーシック版',
      basicExperience: '基本体験',
      dailyThreeAnalysis: '1日3回分析',
      basicChart: '基本命盤',
      currentVersion: '現在のバージョン',
      free: '無料',
      monthly: '/月',
      // ログアウト確認
      confirmLogout: 'ログアウト確認',
      confirmLogoutMessage: '本当に現在のアカウントからログアウトしますか？',
      confirmLogoutButton: 'ログアウト',
      logoutFailed: 'ログアウトに失敗しました'
    }
  },

  // 状態とメッセージ
  status: {
    loading: '読み込み中...',
    saving: '保存中...',
    saved: '保存しました',
    error: 'エラーが発生しました',
    success: '成功しました',
    processing: '処理中...',
    completed: '完了しました',
    cancelled: 'キャンセルされました',
    timeout: 'タイムアウトしました',
    networkError: 'ネットワークエラー',
    serverError: 'サーバーエラー',
    unauthorized: '認証が必要です',
    forbidden: 'アクセスが拒否されました',
    notFound: 'ページが見つかりません'
  },

  // 時間と日付
  datetime: {
    now: '現在',
    today: '今日',
    yesterday: '昨日',
    tomorrow: '明日',
    thisWeek: '今週',
    thisMonth: '今月',
    thisYear: '今年',
    ago: '前',
    later: '後',
    minutes: '分',
    hours: '時間',
    days: '日',
    weeks: '週間',
    months: 'ヶ月',
    years: '年',
    morning: '午前',
    afternoon: '午後',
    evening: '夕方',
    night: '夜'
  },

  // 共通操作
  actions: {
    view: '表示',
    edit: '編集',
    delete: '削除',
    copy: 'コピー',
    share: '共有',
    download: 'ダウンロード',
    upload: 'アップロード',
    search: '検索',
    filter: '絞り込み',
    sort: '並び替え',
    refresh: '更新',
    close: '閉じる',
    open: '開く',
    expand: '展開',
    collapse: '折りたたみ',
    select: '選択',
    selectAll: 'すべて選択',
    deselectAll: 'すべて解除',
    confirm: '確認',
    cancel: 'キャンセル',
    yes: 'はい',
    no: 'いいえ',
    ok: 'OK',
    apply: '適用',
    clear: 'クリア'
  },

  // 確認メッセージ
  confirmations: {
    delete: 'この項目を削除してもよろしいですか？',
    unsavedChanges: '未保存の変更があります。本当に離れますか？',
    logout: 'ログアウトしますか？',
    reset: 'すべての設定をリセットしますか？',
    cancel: 'この操作をキャンセルしますか？'
  },

  // 数値と単位
  units: {
    count: '件',
    items: 'アイテム',
    results: '結果',
    records: 'レコード',
    pages: 'ページ',
    characters: '文字',
    bytes: 'バイト',
    kb: 'KB',
    mb: 'MB',
    gb: 'GB',
    seconds: '秒',
    minutes: '分',
    hours: '時間',
    days: '日',
    percent: '%'
  },

  // プレースホルダー
  placeholders: {
    search: '検索...',
    enterText: 'テキストを入力してください',
    selectOption: 'オプションを選択してください',
    chooseFile: 'ファイルを選択してください',
    enterEmail: 'メールアドレスを入力してください',
    enterPassword: 'パスワードを入力してください',
    enterName: '名前を入力してください',
    enterComment: 'コメントを入力してください',
    noDataAvailable: '利用可能なデータがありません',
    loadingData: 'データを読み込み中...'
  },

  // アクセシビリティ
  accessibility: {
    menuButton: 'メニューボタン',
    closeButton: '閉じるボタン',
    previousPage: '前のページ',
    nextPage: '次のページ',
    firstPage: '最初のページ',
    lastPage: '最後のページ',
    sortAscending: '昇順でソート',
    sortDescending: '降順でソート',
    loading: '読み込み中',
    required: '必須項目',
    optional: '任意項目',
    expand: '展開',
    collapse: '折りたたみ'
  }
} as const

export type JapaneseUITranslations = typeof japaneseUITranslations