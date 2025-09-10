// lib/modules/fortune/i18n/locales/en-US.ts - English Translation
import type { FortuneTranslationKeys } from '../index';

export const enUS: FortuneTranslationKeys = {
  common: {
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    confirm: 'Confirm',
    cancel: 'Cancel',
    save: 'Save',
    edit: 'Edit',
    delete: 'Delete',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    language: 'Language'
  },

  temple: {
    title: 'Temple Systems',
    name: 'Temple Name',
    location: 'Location',
    deity: 'Primary Deity',
    established: 'Established Year',
    totalSlips: 'Total Slips',
    specialization: 'Specializations',
    description: 'Description',
    culturalContext: 'Cultural Context',
    selectTemple: 'Select Temple',
    noTemplesAvailable: 'No temples available',
    loadingTemples: 'Loading temple information...'
  },

  slip: {
    title: 'Fortune Slip',
    number: 'Slip Number',
    level: 'Fortune Level',
    category: 'Category',
    content: 'Content',
    interpretation: 'Interpretation',
    historicalContext: 'Historical Context',
    symbolism: 'Symbolism',
    drawSlip: 'Draw Slip',
    randomSlip: 'Random Slip',
    yourSlip: 'Your Fortune Slip',
    upgradeRequired: 'Upgrade Required',
    loginRequired: 'Login Required'
  },

  fortuneLevel: {
    excellent: 'Excellent',
    good: 'Good',
    average: 'Average',
    caution: 'Caution',
    warning: 'Warning'
  },

  category: {
    career: 'Career',
    wealth: 'Wealth',
    marriage: 'Marriage',
    health: 'Health',
    study: 'Study',
    travel: 'Travel',
    family: 'Family',
    business: 'Business',
    legal: 'Legal',
    general: 'General'
  },

  ai: {
    title: 'AI Fortune Reading',
    analyzing: 'Analyzing fortune slip...',
    interpretation: 'AI Interpretation',
    question: 'Your Question',
    askQuestion: 'Ask a Specific Question',
    getInterpretation: 'Get AI Interpretation',
    culturalStory: 'Cultural Story',
    practicalAdvice: 'Practical Advice',
    interpretationComplete: 'Interpretation Complete',
    interpretationFailed: 'Interpretation Failed'
  },

  auth: {
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    loginRequired: 'Login Required',
    upgradeAccount: 'Upgrade Account',
    basicAccess: 'Basic Access',
    fullAccess: 'Full Access',
    anonymousUser: 'Anonymous User'
  },

  qr: {
    title: 'QR Code',
    generate: 'Generate QR Code',
    scan: 'Scan QR Code',
    campaign: 'Campaign',
    referralLink: 'Referral Link',
    downloadQR: 'Download QR',
    printQR: 'Print QR'
  },

  message: {
    welcome: 'Welcome to Fortune Reading System',
    slipDrawn: 'You have drawn slip #{{number}}',
    interpretationSaved: 'Interpretation saved to history',
    shareSlip: 'Share Fortune Slip',
    copyLink: 'Copy Link',
    linkCopied: 'Link Copied'
  },

  error: {
    networkError: 'Network connection failed',
    serverError: 'Server error',
    notFound: 'Content not found',
    unauthorized: 'Unauthorized access',
    forbidden: 'Access forbidden',
    invalidInput: 'Invalid input format',
    slipNotFound: 'Fortune slip not found',
    templeNotFound: 'Temple not found',
    interpretationFailed: 'AI interpretation failed'
  },

  nav: {
    home: 'Home',
    temples: 'Temples',
    mySlips: 'My Slips',
    history: 'History',
    settings: 'Settings',
    help: 'Help',
    about: 'About'
  },

  meta: {
    title: 'AI Fortune Reading System - Traditional Culture Powered by Technology',
    description: 'Experience traditional temple fortune reading with AI-powered interpretations, discover deep cultural meanings and practical life guidance',
    keywords: 'fortune reading,temple,AI interpretation,traditional culture,divination,fortune,oracle',
    ogTitle: 'AI Fortune Reading System - Perfect Blend of Tradition and Technology',
    ogDescription: 'Experience traditional temple fortune reading online, AI interpretation helps you understand the deep meaning of fortune slips and gain life guidance'
  }
};