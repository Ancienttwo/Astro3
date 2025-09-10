'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Types for the store
export interface UserProfile {
  userId?: string;
  walletAddress?: string;
  reputation: number;
  nftCollection: NFTCollection;
  mutualAidHistory: AidRequest[];
  validationHistory: ValidationRecord[];
  preferences: UserPreferences;
  stats: UserStats;
}

export interface NFTCollection {
  totalCount: number;
  legendaryCount: number;
  epicCount: number;
  commonCount: number;
  milestoneRewards: {
    [key: number]: boolean; // milestone -> claimed
  };
  collectionValue: string;
}

export interface AidRequest {
  id: string;
  status: 'pending' | 'approved' | 'rejected' | 'distributed' | 'completed';
  amount: string;
  reason: string;
  severityLevel: number;
  submittedAt: string;
  validationResults?: ValidationResult;
  distributedAt?: string;
  completedAt?: string;
}

export interface ValidationRecord {
  requestId: string;
  vote: 'approve' | 'reject';
  confidence: number;
  reason: string;
  outcome: 'correct' | 'incorrect' | 'pending';
  rewardEarned?: string;
  submittedAt: string;
}

export interface ValidationResult {
  totalVotes: number;
  approvalVotes: number;
  rejectionVotes: number;
  finalDecision: 'approved' | 'rejected';
  confidenceScore: number;
  validators: string[];
}

export interface UserPreferences {
  language: 'zh' | 'en';
  theme: 'light' | 'dark' | 'system';
  notifications: {
    newRequests: boolean;
    validationResults: boolean;
    distributions: boolean;
    milestones: boolean;
  };
  privacy: {
    showReputation: boolean;
    showNFTCollection: boolean;
    allowDirectMessages: boolean;
  };
}

export interface UserStats {
  totalValidationsPerformed: number;
  validationAccuracy: number;
  totalAidReceived: string;
  totalAidDistributed: string;
  communityRank: number;
  weeklyActivity: number;
  streakDays: number;
}

export interface Web3State {
  isConnected: boolean;
  walletAddress?: string;
  networkId?: number;
  networkName?: string;
  balance: {
    native: string;
    azi: string;
    luck: string;
  };
  transactions: Transaction[];
  contracts: {
    mutualAidToken?: string;
    guangdiNFT?: string;
    governance?: string;
  };
}

export interface Transaction {
  id: string;
  type: 'aid_request' | 'aid_distribution' | 'nft_mint' | 'validation_reward';
  status: 'pending' | 'confirmed' | 'failed';
  hash?: string;
  amount?: string;
  timestamp: string;
  blockNumber?: number;
}

export interface UIState {
  theme: 'light' | 'dark';
  language: 'zh' | 'en';
  sidebarOpen: boolean;
  currentModal?: string;
  loading: {
    wallet: boolean;
    analysis: boolean;
    validation: boolean;
    distribution: boolean;
  };
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
}

// Main store interface
export interface MutualAidStore {
  // State
  user: UserProfile;
  web3: Web3State;
  ui: UIState;
  
  // User actions
  setUserProfile: (profile: Partial<UserProfile>) => void;
  updateReputation: (newReputation: number) => void;
  addAidRequest: (request: AidRequest) => void;
  updateAidRequest: (requestId: string, updates: Partial<AidRequest>) => void;
  addValidationRecord: (record: ValidationRecord) => void;
  updateUserPreferences: (preferences: Partial<UserPreferences>) => void;
  updateUserStats: (stats: Partial<UserStats>) => void;
  
  // Web3 actions
  connectWallet: (walletInfo: {
    address: string;
    networkId: number;
    networkName: string;
    balance: Web3State['balance'];
  }) => void;
  disconnectWallet: () => void;
  updateBalance: (balance: Partial<Web3State['balance']>) => void;
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (txId: string, updates: Partial<Transaction>) => void;
  setContracts: (contracts: Partial<Web3State['contracts']>) => void;
  
  // NFT actions
  updateNFTCollection: (collection: Partial<NFTCollection>) => void;
  claimMilestoneReward: (milestone: number) => void;
  
  // UI actions
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (language: 'zh' | 'en') => void;
  setSidebarOpen: (open: boolean) => void;
  setCurrentModal: (modal?: string) => void;
  setLoading: (key: keyof UIState['loading'], loading: boolean) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (notificationId: string) => void;
  removeNotification: (notificationId: string) => void;
  clearNotifications: () => void;
  
  // Reset actions
  resetUserData: () => void;
  resetWeb3Data: () => void;
}

// Default values
const defaultUserProfile: UserProfile = {
  reputation: 3.0,
  nftCollection: {
    totalCount: 0,
    legendaryCount: 0,
    epicCount: 0,
    commonCount: 0,
    milestoneRewards: {},
    collectionValue: '0'
  },
  mutualAidHistory: [],
  validationHistory: [],
  preferences: {
    language: 'zh',
    theme: 'light',
    notifications: {
      newRequests: true,
      validationResults: true,
      distributions: true,
      milestones: true
    },
    privacy: {
      showReputation: true,
      showNFTCollection: true,
      allowDirectMessages: true
    }
  },
  stats: {
    totalValidationsPerformed: 0,
    validationAccuracy: 0,
    totalAidReceived: '0',
    totalAidDistributed: '0',
    communityRank: 0,
    weeklyActivity: 0,
    streakDays: 0
  }
};

const defaultWeb3State: Web3State = {
  isConnected: false,
  balance: {
    native: '0',
    azi: '0',
    luck: '0'
  },
  transactions: [],
  contracts: {}
};

const defaultUIState: UIState = {
  theme: 'light',
  language: 'zh',
  sidebarOpen: false,
  loading: {
    wallet: false,
    analysis: false,
    validation: false,
    distribution: false
  },
  notifications: []
};

// Create the store with persistence
export const useMutualAidStore = create<MutualAidStore>()(
  persist(
    immer((set, get) => ({
      // Initial state
      user: defaultUserProfile,
      web3: defaultWeb3State,
      ui: defaultUIState,

      // User actions
      setUserProfile: (profile) =>
        set((state) => {
          Object.assign(state.user, profile);
        }),

      updateReputation: (newReputation) =>
        set((state) => {
          state.user.reputation = newReputation;
        }),

      addAidRequest: (request) =>
        set((state) => {
          state.user.mutualAidHistory.unshift(request);
        }),

      updateAidRequest: (requestId, updates) =>
        set((state) => {
          const index = state.user.mutualAidHistory.findIndex(r => r.id === requestId);
          if (index !== -1) {
            Object.assign(state.user.mutualAidHistory[index], updates);
          }
        }),

      addValidationRecord: (record) =>
        set((state) => {
          state.user.validationHistory.unshift(record);
          state.user.stats.totalValidationsPerformed += 1;
        }),

      updateUserPreferences: (preferences) =>
        set((state) => {
          Object.assign(state.user.preferences, preferences);
          // Also update UI state for language and theme
          if (preferences.language) {
            state.ui.language = preferences.language;
          }
          if (preferences.theme) {
            state.ui.theme = preferences.theme;
          }
        }),

      updateUserStats: (stats) =>
        set((state) => {
          Object.assign(state.user.stats, stats);
        }),

      // Web3 actions
      connectWallet: (walletInfo) =>
        set((state) => {
          state.web3.isConnected = true;
          state.web3.walletAddress = walletInfo.address;
          state.web3.networkId = walletInfo.networkId;
          state.web3.networkName = walletInfo.networkName;
          state.web3.balance = walletInfo.balance;
          state.user.walletAddress = walletInfo.address;
        }),

      disconnectWallet: () =>
        set((state) => {
          state.web3 = defaultWeb3State;
          state.user.walletAddress = undefined;
        }),

      updateBalance: (balance) =>
        set((state) => {
          Object.assign(state.web3.balance, balance);
        }),

      addTransaction: (transaction) =>
        set((state) => {
          state.web3.transactions.unshift(transaction);
        }),

      updateTransaction: (txId, updates) =>
        set((state) => {
          const index = state.web3.transactions.findIndex(tx => tx.id === txId);
          if (index !== -1) {
            Object.assign(state.web3.transactions[index], updates);
          }
        }),

      setContracts: (contracts) =>
        set((state) => {
          Object.assign(state.web3.contracts, contracts);
        }),

      // NFT actions
      updateNFTCollection: (collection) =>
        set((state) => {
          Object.assign(state.user.nftCollection, collection);
        }),

      claimMilestoneReward: (milestone) =>
        set((state) => {
          state.user.nftCollection.milestoneRewards[milestone] = true;
        }),

      // UI actions
      setTheme: (theme) =>
        set((state) => {
          state.ui.theme = theme;
          state.user.preferences.theme = theme;
        }),

      setLanguage: (language) =>
        set((state) => {
          state.ui.language = language;
          state.user.preferences.language = language;
        }),

      setSidebarOpen: (open) =>
        set((state) => {
          state.ui.sidebarOpen = open;
        }),

      setCurrentModal: (modal) =>
        set((state) => {
          state.ui.currentModal = modal;
        }),

      setLoading: (key, loading) =>
        set((state) => {
          state.ui.loading[key] = loading;
        }),

      addNotification: (notification) =>
        set((state) => {
          const newNotification: Notification = {
            ...notification,
            id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            timestamp: new Date().toISOString(),
            read: false
          };
          state.ui.notifications.unshift(newNotification);
          
          // Keep only last 50 notifications
          if (state.ui.notifications.length > 50) {
            state.ui.notifications = state.ui.notifications.slice(0, 50);
          }
        }),

      markNotificationRead: (notificationId) =>
        set((state) => {
          const notification = state.ui.notifications.find(n => n.id === notificationId);
          if (notification) {
            notification.read = true;
          }
        }),

      removeNotification: (notificationId) =>
        set((state) => {
          state.ui.notifications = state.ui.notifications.filter(
            n => n.id !== notificationId
          );
        }),

      clearNotifications: () =>
        set((state) => {
          state.ui.notifications = [];
        }),

      // Reset actions
      resetUserData: () =>
        set((state) => {
          state.user = defaultUserProfile;
        }),

      resetWeb3Data: () =>
        set((state) => {
          state.web3 = defaultWeb3State;
          state.user.walletAddress = undefined;
        })
    })),
    {
      name: 'mutual-aid-store',
      storage: createJSONStorage(() => {
        // Use different storage for different data types
        return {
          getItem: (name) => {
            const item = localStorage.getItem(name);
            return item ? JSON.parse(item) : null;
          },
          setItem: (name, value) => {
            localStorage.setItem(name, JSON.stringify(value));
          },
          removeItem: (name) => {
            localStorage.removeItem(name);
          }
        };
      }),
      partialize: (state) => ({
        user: {
          ...state.user,
          // Don't persist sensitive real-time data
          mutualAidHistory: state.user.mutualAidHistory.slice(0, 20), // Keep last 20 requests
          validationHistory: state.user.validationHistory.slice(0, 50) // Keep last 50 validations
        },
        ui: {
          theme: state.ui.theme,
          language: state.ui.language,
          sidebarOpen: false // Always start with sidebar closed
        }
        // Don't persist web3 state for security
      }),
      version: 1,
      migrate: (persistedState: any, version: number) => {
        // Handle store migrations if needed
        if (version === 0) {
          // Migration from version 0 to 1
          return {
            ...persistedState,
            user: {
              ...defaultUserProfile,
              ...persistedState.user
            }
          };
        }
        return persistedState;
      }
    }
  )
);

// Selector hooks for better performance
export const useUserProfile = () => useMutualAidStore((state) => state.user);
export const useWeb3State = () => useMutualAidStore((state) => state.web3);
export const useUIState = () => useMutualAidStore((state) => state.ui);

// Computed selectors
export const useIsWalletConnected = () => useMutualAidStore((state) => state.web3.isConnected);
export const useUserReputation = () => useMutualAidStore((state) => state.user.reputation);
export const useNFTCollection = () => useMutualAidStore((state) => state.user.nftCollection);
export const useUnreadNotifications = () => useMutualAidStore((state) => 
  state.ui.notifications.filter(n => !n.read).length
);

// Action hooks
export const useMutualAidActions = () => {
  const store = useMutualAidStore();
  return {
    setUserProfile: store.setUserProfile,
    updateReputation: store.updateReputation,
    addAidRequest: store.addAidRequest,
    updateAidRequest: store.updateAidRequest,
    addValidationRecord: store.addValidationRecord,
    updateUserPreferences: store.updateUserPreferences,
    updateUserStats: store.updateUserStats
  };
};

export const useWeb3Actions = () => {
  const store = useMutualAidStore();
  return {
    connectWallet: store.connectWallet,
    disconnectWallet: store.disconnectWallet,
    updateBalance: store.updateBalance,
    addTransaction: store.addTransaction,
    updateTransaction: store.updateTransaction,
    setContracts: store.setContracts
  };
};

export const useUIActions = () => {
  const store = useMutualAidStore();
  return {
    setTheme: store.setTheme,
    setLanguage: store.setLanguage,
    setSidebarOpen: store.setSidebarOpen,
    setCurrentModal: store.setCurrentModal,
    setLoading: store.setLoading,
    addNotification: store.addNotification,
    markNotificationRead: store.markNotificationRead,
    removeNotification: store.removeNotification,
    clearNotifications: store.clearNotifications
  };
};