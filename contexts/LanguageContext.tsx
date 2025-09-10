"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'zh' | 'ja' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// 基础翻译对象 - 后续可以扩展
const translations = {
  zh: {
    // 基础界面
    'home': '首页',
    'dashboard': '百科',
    'bazi': '八字分析',
    'ziwei': '紫微斗数',
    'chatbot': 'AI大师',
    'settings': '设置',
    
    // 设置菜单
    'subscription': '订阅服务',

    'appearance': '外观设置',
    'language-settings': '语言设置',
    'contact-us': '联系我们',
    'account-delete': '账号删除',
    'help': '帮助中心',
    'logout': '登出账号',
    
    // 常用词汇
    'save': '保存',
    'cancel': '取消',
    'confirm': '确认',
    'loading': '加载中...',
    'success': '成功',
    'error': '错误',
  },
  ja: {
    // 基础界面
    'home': 'ホーム',
    'dashboard': '百科事典',
    'bazi': '八字分析',
    'ziwei': '紫微斗数',
    'chatbot': 'AIマスター',
    'settings': '設定',
    'charts': 'チャート',
    'create-chart': '新規チャート作成',
    'auth': '認証',
    'profile': 'プロフィール',
    'wiki': '知識ベース',
    'myprofile': 'マイプロフィール',
    'preferences': '環境設定',
    'membership': 'メンバーシップ',
    
    // 设置菜单
    'subscription': 'サブスクリプション',
    'appearance': '外観設定',
    'language-settings': '言語設定',
    'contact-us': 'お問い合わせ',
    'account-delete': 'アカウント削除',
    'help': 'ヘルプセンター',
    'logout': 'ログアウト',
    
    // 常用操作
    'save': '保存',
    'cancel': 'キャンセル',
    'confirm': '確認',
    'loading': '読み込み中...',
    'success': '成功',
    'error': 'エラー',
    'submit': '送信',
    'reset': 'リセット',
    'back': '戻る',
    'next': '次へ',
    'previous': '前へ',
    'edit': '編集',
    'delete': '削除',
    'add': '追加',
    'create': '作成',
    'update': '更新',
    'close': '閉じる',
    'open': '開く',
    'search': '検索',
    'filter': '絞り込み',
    'sort': '並び替え',
    'refresh': '更新',
    'clear': 'クリア',
    'select': '選択',
    'copy': 'コピー',
    'paste': '貼り付け',
    'cut': 'カット',
    'undo': '元に戻す',
    'redo': 'やり直し',
    'print': '印刷',
    'export': 'エクスポート',
    'import': 'インポート',
    'download': 'ダウンロード',
    'upload': 'アップロード',
    'share': '共有',
    'view': '表示',
    'hide': '非表示',
    'show': '表示',
    'expand': '展開',
    'collapse': '折りたたみ',
    
    // 表单相关
    'name': '名前',
    'email': 'メールアドレス',
    'password': 'パスワード',
    'username': 'ユーザー名',
    'phone': '電話番号',
    'address': '住所',
    'birthday': '生年月日',
    'gender': '性別',
    'male': '男性',
    'female': '女性',
    'age': '年齢',
    'occupation': '職業',
    'company': '会社',
    'title': 'タイトル',
    'description': '説明',
    'comment': 'コメント',
    'message': 'メッセージ',
    'note': 'ノート',
    'remarks': '備考',
    'category': 'カテゴリ',
    'tag': 'タグ',
    'status': 'ステータス',
    'priority': '優先度',
    'type': '種類',
    'date': '日付',
    'time': '時間',
    'duration': '期間',
    'quantity': '数量',
    'amount': '金額',
    'price': '価格',
    'total': '合計',
    'subtotal': '小計',
    'tax': '税金',
    'discount': '割引',
    'currency': '通貨',
    
    // 状态相关
    'active': 'アクティブ',
    'inactive': '非アクティブ',
    'enabled': '有効',
    'disabled': '無効',
    'online': 'オンライン',
    'offline': 'オフライン',
    'available': '利用可能',
    'unavailable': '利用不可',
    'public': '公開',
    'private': '非公開',
    'draft': '下書き',
    'published': '公開済み',
    'pending': '保留中',
    'approved': '承認済み',
    'rejected': '却下',
    'completed': '完了',
    'in-progress': '進行中',
    'cancelled': 'キャンセル',
    'expired': '期限切れ',
    'new': '新規',
    'updated': '更新済み',
    'deleted': '削除済み',
    
    // 时间相关
    'today': '今日',
    'yesterday': '昨日',
    'tomorrow': '明日',
    'this-week': '今週',
    'last-week': '先週',
    'next-week': '来週',
    'this-month': '今月',
    'last-month': '先月',
    'next-month': '来月',
    'this-year': '今年',
    'last-year': '昨年',
    'next-year': '来年',
    'now': '現在',
    'recent': '最近',
    'latest': '最新',
    'oldest': '最古',
    'future': '将来',
    'past': '過去',
    'current': '現在の',
    
    // 数量相关
    'all': 'すべて',
    'none': 'なし',
    'some': '一部',
    'many': '多数',
    'few': '少数',
    'more': 'もっと',
    'less': '少なく',
    'most': 'ほとんど',
    'least': '最小',
    'empty': '空',
    'full': '満杯',
    'total-count': '総数',
    'selected': '選択済み',
    'remaining': '残り',
    
    // 导航相关
    'menu': 'メニュー',
    'navigation': 'ナビゲーション',
    'breadcrumb': 'パンくずリスト',
    'sidebar': 'サイドバー',
    'header': 'ヘッダー',
    'footer': 'フッター',
    'main': 'メイン',
    'content': 'コンテンツ',
    'page': 'ページ',
    'section': 'セクション',
    'chapter': '章',
    'article': '記事',
    'post': '投稿',
    'item': 'アイテム',
    'list': 'リスト',
    'table': 'テーブル',
    'grid': 'グリッド',
    'card': 'カード',
    'panel': 'パネル',
    'modal': 'モーダル',
    'dialog': 'ダイアログ',
    'popup': 'ポップアップ',
    'tooltip': 'ツールチップ',
    'alert': 'アラート',
    'notification': '通知',
    'badge': 'バッジ',
    'label': 'ラベル',
    'icon': 'アイコン',
    'image': '画像',
    'video': '動画',
    'audio': '音声',
    'file': 'ファイル',
    'folder': 'フォルダ',
    'link': 'リンク',
    'button': 'ボタン',
    'input': '入力',
    'form': 'フォーム',
    'field': 'フィールド',
    'checkbox': 'チェックボックス',
    'radio': 'ラジオボタン',
    'dropdown': 'ドロップダウン',
    'slider': 'スライダー',
    'toggle': 'トグル',
    'tab': 'タブ',
    'accordion': 'アコーディオン',
    'carousel': 'カルーセル',
    'timeline': 'タイムライン',
    'calendar': 'カレンダー',
    'chart': 'チャート',
    'graph': 'グラフ',
    'map': 'マップ',
    'progress': '進捗',
    'loading-spinner': '読み込みスピナー',
    
    // 错误和提示信息
    'no-data': 'データがありません',
    'no-results': '結果がありません',
    'not-found': '見つかりません',
    'access-denied': 'アクセス拒否',
    'unauthorized': '認証されていません',
    'forbidden': '禁止されています',
    'server-error': 'サーバーエラー',
    'network-error': 'ネットワークエラー',
    'timeout': 'タイムアウト',
    'invalid-input': '無効な入力',
    'required-field': '必須フィールド',
    'optional-field': '任意フィールド',
    'field-too-long': 'フィールドが長すぎます',
    'field-too-short': 'フィールドが短すぎます',
    'invalid-email': '無効なメールアドレス',
    'invalid-password': '無効なパスワード',
    'password-mismatch': 'パスワードが一致しません',
    'weak-password': '弱いパスワード',
    'strong-password': '強いパスワード',
    'operation-successful': '操作が成功しました',
    'operation-failed': '操作が失敗しました',
    'saved-successfully': '正常に保存されました',
    'deleted-successfully': '正常に削除されました',
    'updated-successfully': '正常に更新されました',
    'created-successfully': '正常に作成されました',
    'are-you-sure': '本当によろしいですか？',
    'confirm-delete': '削除してもよろしいですか？',
    'unsaved-changes': '未保存の変更があります',
    'please-wait': 'お待ちください',
    'processing': '処理中',
    'please-try-again': '再度お試しください',
    'contact-support': 'サポートにお問い合わせください',
  },
  en: {
    // 基础界面
    'home': 'Home',
    'dashboard': 'Encyclopedia',
    'bazi': 'BaZi Natal',
    'ziwei': 'ZiWei Astrology',
    'chatbot': 'AI Master',
    'settings': 'Settings',
    
    // 设置菜单
    'subscription': 'Subscription',

    'appearance': 'Appearance',
    'language-settings': 'Language',
    'contact-us': 'Contact Us',
    'account-delete': 'Delete Account',
    'help': 'Help Center',
    'logout': 'Sign Out',
    
    // 常用词汇
    'save': 'Save',
    'cancel': 'Cancel',
    'confirm': 'Confirm',
    'loading': 'Loading...',
    'success': 'Success',
    'error': 'Error',
  }
};

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('zh');

  useEffect(() => {
    // 从localStorage读取保存的语言设置
    const savedLanguage = localStorage.getItem('app_language') as Language;
    if (savedLanguage && ['zh', 'ja', 'en'].includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 