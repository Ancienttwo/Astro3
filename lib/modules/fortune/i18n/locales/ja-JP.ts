// lib/modules/fortune/i18n/locales/ja-JP.ts - 日本語翻訳
import type { FortuneTranslationKeys } from '../index';

export const jaJP: FortuneTranslationKeys = {
  common: {
    loading: '読み込み中...',
    error: 'エラー',
    success: '成功',
    confirm: '確認',
    cancel: 'キャンセル',
    save: '保存',
    edit: '編集',
    delete: '削除',
    back: '戻る',
    next: '次へ',
    previous: '前へ',
    search: '検索',
    filter: 'フィルター',
    sort: '並び替え',
    language: '言語'
  },

  temple: {
    title: '寺院システム',
    name: '寺院名',
    location: '所在地',
    deity: '主祭神',
    established: '創建年',
    totalSlips: '籤の総数',
    specialization: '専門分野',
    description: '寺院紹介',
    culturalContext: '文化的背景',
    selectTemple: '寺院を選択',
    noTemplesAvailable: '利用可能な寺院がありません',
    loadingTemples: '寺院情報を読み込み中...'
  },

  slip: {
    title: '籤',
    number: '籤番号',
    level: '吉凶',
    category: 'カテゴリー',
    content: '籤の内容',
    interpretation: '解釈',
    historicalContext: '歴史的背景',
    symbolism: '象徴的意味',
    drawSlip: '籤を引く',
    randomSlip: 'ランダム籤',
    yourSlip: 'あなたの籤',
    upgradeRequired: 'アップグレードが必要',
    loginRequired: 'ログインが必要'
  },

  fortuneLevel: {
    excellent: '大吉',
    good: '吉',
    average: '中吉',
    caution: '小吉',
    warning: '凶'
  },

  category: {
    career: '仕事',
    wealth: '金運',
    marriage: '結婚',
    health: '健康',
    study: '学業',
    travel: '旅行',
    family: '家族',
    business: '商売',
    legal: '訴訟',
    general: '総合'
  },

  ai: {
    title: 'AI占い解釈',
    analyzing: '籤を分析中...',
    interpretation: 'AI解釈',
    question: 'ご質問',
    askQuestion: '具体的な質問をする',
    getInterpretation: 'AI解釈を取得',
    culturalStory: '文化的物語',
    practicalAdvice: '実用的なアドバイス',
    interpretationComplete: '解釈完了',
    interpretationFailed: '解釈失敗'
  },

  auth: {
    login: 'ログイン',
    register: '登録',
    logout: 'ログアウト',
    loginRequired: 'ログインが必要',
    upgradeAccount: 'アカウントをアップグレード',
    basicAccess: '基本アクセス',
    fullAccess: 'フルアクセス',
    anonymousUser: '匿名ユーザー'
  },

  qr: {
    title: 'QRコード',
    generate: 'QRコード生成',
    scan: 'QRコードスキャン',
    campaign: 'キャンペーン',
    referralLink: '紹介リンク',
    downloadQR: 'QRダウンロード',
    printQR: 'QR印刷'
  },

  message: {
    welcome: '占いシステムへようこそ',
    slipDrawn: '第{{number}}番の籤を引きました',
    interpretationSaved: '解釈が履歴に保存されました',
    shareSlip: '籤をシェア',
    copyLink: 'リンクをコピー',
    linkCopied: 'リンクがコピーされました'
  },

  error: {
    networkError: 'ネットワーク接続エラー',
    serverError: 'サーバーエラー',
    notFound: 'コンテンツが見つかりません',
    unauthorized: '認証されていないアクセス',
    forbidden: 'アクセスが禁止されています',
    invalidInput: '入力形式が無効',
    slipNotFound: '籤が見つかりません',
    templeNotFound: '寺院が見つかりません',
    interpretationFailed: 'AI解釈に失敗しました'
  },

  nav: {
    home: 'ホーム',
    temples: '寺院',
    mySlips: '私の籤',
    history: '履歴',
    settings: '設定',
    help: 'ヘルプ',
    about: 'について'
  },

  meta: {
    title: 'AI占いシステム - 伝統文化とテクノロジーの融合',
    description: '伝統的な寺院の占いをAI解釈で体験し、深い文化的意味と実用的な人生指導を得る',
    keywords: '占い,寺院,AI解釈,伝統文化,運勢,神託',
    ogTitle: 'AI占いシステム - 伝統とテクノロジーの完璧な融合',
    ogDescription: 'オンラインで伝統的な寺院の占いを体験、AI解釈があなたに籤の深い意味を理解させ、人生指導を提供'
  }
};