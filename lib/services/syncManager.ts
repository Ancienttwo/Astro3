'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useMutualAidStore } from '@/lib/stores/mutualAidStore';
// 使用默认导入 apiClient（互助系统专用客户端），同时保留便捷 api 方法
import apiClient, { api } from '@/lib/api/client';
import { queryKeys } from '@/lib/api/queries';
import { QueryClient } from '@tanstack/react-query';

// Sync Configuration
interface SyncConfig {
  enabled: boolean;
  interval: number; // milliseconds
  retryDelay: number;
  maxRetries: number;
  conflictResolution: 'server' | 'client' | 'manual';
}

const DEFAULT_SYNC_CONFIG: SyncConfig = {
  enabled: true,
  interval: 30 * 1000, // 30 seconds
  retryDelay: 5 * 1000, // 5 seconds
  maxRetries: 3,
  conflictResolution: 'server' // Server wins by default
};

// Data that needs synchronization
interface SyncData {
  userProfile: any;
  userStats: any;
  nftCollection: any;
  recentRequests: any[];
  recentValidations: any[];
  notifications: any[];
  lastSyncTimestamp: string;
}

// Sync state
interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSync: Date | null;
  pendingChanges: any[];
  syncErrors: string[];
  conflictsToResolve: any[];
}

class SyncManager {
  private config: SyncConfig;
  private syncState: SyncState;
  private syncInterval: NodeJS.Timeout | null = null;
  private queryClient: QueryClient | null = null;
  private eventListeners: Map<string, Function[]> = new Map();

  constructor(config: Partial<SyncConfig> = {}) {
    this.config = { ...DEFAULT_SYNC_CONFIG, ...config };
    this.syncState = {
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      isSyncing: false,
      lastSync: null,
      pendingChanges: [],
      syncErrors: [],
      conflictsToResolve: []
    };

    // Listen for online/offline events
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline.bind(this));
      window.addEventListener('offline', this.handleOffline.bind(this));
    }
  }

  // Initialize sync manager with query client
  init(queryClient: QueryClient) {
    this.queryClient = queryClient;
    
    if (this.config.enabled) {
      this.startSync();
    }
  }

  // Start periodic sync
  startSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      if (this.syncState.isOnline && !this.syncState.isSyncing) {
        this.performSync();
      }
    }, this.config.interval);

    // Perform immediate sync
    if (this.syncState.isOnline) {
      this.performSync();
    }
  }

  // Stop periodic sync
  stopSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // Handle online event
  private handleOnline() {
    this.syncState.isOnline = true;
    this.emit('online');
    
    // Perform immediate sync when coming back online
    if (this.config.enabled) {
      this.performSync();
    }
  }

  // Handle offline event
  private handleOffline() {
    this.syncState.isOnline = false;
    this.syncState.isSyncing = false;
    this.emit('offline');
  }

  // Main sync function
  async performSync(): Promise<boolean> {
    if (!this.syncState.isOnline || this.syncState.isSyncing) {
      return false;
    }

    this.syncState.isSyncing = true;
    this.emit('syncStart');

    try {
      // 1. Upload pending changes first
      await this.uploadPendingChanges();

      // 2. Download latest data
      await this.downloadLatestData();

      // 3. Resolve any conflicts
      await this.resolveConflicts();

      this.syncState.lastSync = new Date();
      this.syncState.syncErrors = [];
      
      this.emit('syncSuccess');
      return true;

    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('Sync failed:', msg);
      this.syncState.syncErrors.push(msg);
      this.emit('syncError', msg);
      return false;

    } finally {
      this.syncState.isSyncing = false;
      this.emit('syncEnd');
    }
  }

  // Upload pending changes to server
  private async uploadPendingChanges() {
    if (this.syncState.pendingChanges.length === 0) {
      return;
    }

    const changes = [...this.syncState.pendingChanges];
    
    for (const change of changes) {
      try {
        await this.uploadChange(change);
        
        // Remove successfully uploaded change
        this.syncState.pendingChanges = this.syncState.pendingChanges.filter(
          c => c.id !== change.id
        );
        
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error('Failed to upload change:', change, msg);
        
        // Check if it's a conflict
        const status = (error as any)?.status;
        if (status === 409) {
          this.syncState.conflictsToResolve.push({
            local: change,
            error: msg
          });
        }
      }
    }
  }

  // Upload individual change
  private async uploadChange(change: any) {
    switch (change.type) {
      case 'user_preferences':
        // 对应服务端 PUT /api/user/preferences
        return apiClient.put('/user/preferences', change.data);
      
      case 'validation_submit':
        return api.submitValidation(change.requestId, change.data);
      
      case 'aid_request_submit':
        return api.submitAidRequest(change.data);
      
      case 'notification_read':
        return api.markNotificationRead(change.notificationId);
      
      default:
        throw new Error(`Unknown change type: ${change.type}`);
    }
  }

  // Download latest data from server (graceful, section-isolated)
  private async downloadLatestData() {
    const store = useMutualAidStore.getState();

    // Get latest server timestamps (with fallback)
    const serverTimestamps = await this.getServerTimestamps();
    const localTimestamps = this.getLocalTimestamps();

    let anySectionSucceeded = false;

    // 1) User profile
    if (this.needsUpdate(localTimestamps.userProfile, serverTimestamps.userProfile)) {
      try {
        const userProfile = await api.getUserStats();
        if (userProfile?.data) {
          store.setUserProfile(userProfile.data);
          this.queryClient?.setQueryData(queryKeys.userProfile(), userProfile.data);
          anySectionSucceeded = true;
        }
      } catch (e) {
        console.warn('[Sync] 忽略用户画像更新错误:', e instanceof Error ? e.message : e);
      }
    }

    // 2) NFT collection (route可能不存在，失败时忽略)
    if (this.needsUpdate(localTimestamps.nftCollection, serverTimestamps.nftCollection)) {
      try {
        const nftCollection = await api.getNFTCollection();
        if (nftCollection?.data) {
          store.updateNFTCollection(nftCollection.data);
          this.queryClient?.setQueryData(queryKeys.nftCollection(), nftCollection.data);
          anySectionSucceeded = true;
        }
      } catch (e) {
        console.warn('[Sync] NFT合集接口不可用，已跳过:', e instanceof Error ? e.message : e);
      }
    }

    // 3) My recent requests
    if (this.needsUpdate(localTimestamps.requests, serverTimestamps.requests)) {
      try {
        const requests: any = await api.getMyRequests();
        if (requests?.data) {
          requests.data.forEach((request: any) => {
            const existing = store.user.mutualAidHistory.find(r => r.id === request.id);
            if (existing) {
              store.updateAidRequest(request.id, request);
            } else {
              store.addAidRequest(request);
            }
          });
          anySectionSucceeded = true;
        }
      } catch (e) {
        console.warn('[Sync] 忽略互助请求更新错误:', e instanceof Error ? e.message : e);
      }
    }

    // 4) Notifications (route可能不存在，失败时忽略)
    if (this.needsUpdate(localTimestamps.notifications, serverTimestamps.notifications)) {
      try {
        const notifications: any = await api.getNotifications(1, 20);
        if (notifications?.data) {
          notifications.data.forEach((notification: any) => {
            const existing = store.ui.notifications.find(n => n.id === notification.id);
            if (!existing) {
              store.addNotification(notification);
            }
          });
          anySectionSucceeded = true;
        }
      } catch (e) {
        console.warn('[Sync] 通知接口不可用，已跳过:', e instanceof Error ? e.message : e);
      }
    }

    if (!anySectionSucceeded) {
      console.warn('[Sync] 无数据项成功更新（可能接口未就绪或无权限）。');
    }
  }

  // Get server timestamps for data freshness check
  private async getServerTimestamps(): Promise<Record<string, string>> {
    // No dedicated endpoint yet; force refresh by returning current timestamps.
    const now = new Date().toISOString();
    return {
      userProfile: now,
      nftCollection: now,
      requests: now,
      notifications: now,
    };
  }

  // Get local timestamps from store
  private getLocalTimestamps(): Record<string, string> {
    const syncData = localStorage.getItem('mutual-aid-sync-timestamps');
    return syncData ? JSON.parse(syncData) : {};
  }

  // Check if data needs updating
  private needsUpdate(localTimestamp?: string, serverTimestamp?: string): boolean {
    if (!localTimestamp || !serverTimestamp) {
      return true;
    }
    
    return new Date(serverTimestamp) > new Date(localTimestamp);
  }

  // Resolve conflicts
  private async resolveConflicts() {
    if (this.syncState.conflictsToResolve.length === 0) {
      return;
    }

    for (const conflict of this.syncState.conflictsToResolve) {
      try {
        await this.resolveConflict(conflict);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error('Failed to resolve conflict:', conflict, msg);
      }
    }

    this.syncState.conflictsToResolve = [];
  }

  // Resolve individual conflict
  private async resolveConflict(conflict: any) {
    switch (this.config.conflictResolution) {
      case 'server':
        // Server wins - discard local changes
        this.discardLocalChange(conflict.local);
        break;
        
      case 'client':
        // Client wins - force upload
        await this.forceUploadChange(conflict.local);
        break;
        
      case 'manual':
        // Requires manual resolution
        this.emit('conflict', conflict);
        break;
    }
  }

  // Discard local change
  private discardLocalChange(change: any) {
    console.log('Discarding local change due to server conflict:', change);
    // Remove from pending changes if still there
    this.syncState.pendingChanges = this.syncState.pendingChanges.filter(
      c => c.id !== change.id
    );
  }

  // Force upload change (client wins)
  private async forceUploadChange(change: any) {
    const forceChange = { ...change, force: true };
    await this.uploadChange(forceChange);
  }

  // Add change to pending queue
  addPendingChange(change: any) {
    const changeWithId = {
      ...change,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    };

    this.syncState.pendingChanges.push(changeWithId);
    
    // Try immediate sync if online
    if (this.syncState.isOnline && this.config.enabled) {
      setTimeout(() => this.performSync(), 100);
    }
  }

  // Get sync state
  getSyncState(): SyncState {
    return { ...this.syncState };
  }

  // Update sync configuration
  updateConfig(config: Partial<SyncConfig>) {
    this.config = { ...this.config, ...config };
    
    if (this.config.enabled) {
      this.startSync();
    } else {
      this.stopSync();
    }
  }

  // Event system
  on(event: string, callback: Function) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  // Cleanup
  destroy() {
    this.stopSync();
    
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }
    
    this.eventListeners.clear();
  }
}

// Global sync manager instance
export const syncManager = new SyncManager();

// React hook for sync manager
export function useSyncManager() {
  const [syncState, setSyncState] = useState(syncManager.getSyncState());

  useEffect(() => {
    const updateSyncState = () => {
      setSyncState(syncManager.getSyncState());
    };

    syncManager.on('syncStart', updateSyncState);
    syncManager.on('syncEnd', updateSyncState);
    syncManager.on('online', updateSyncState);
    syncManager.on('offline', updateSyncState);

    return () => {
      syncManager.off('syncStart', updateSyncState);
      syncManager.off('syncEnd', updateSyncState);
      syncManager.off('online', updateSyncState);
      syncManager.off('offline', updateSyncState);
    };
  }, []);

  return {
    syncState,
    performSync: () => syncManager.performSync(),
    addPendingChange: (change: any) => syncManager.addPendingChange(change),
    updateConfig: (config: Partial<SyncConfig>) => syncManager.updateConfig(config)
  };
}

// Helper hook for offline-first operations
export function useOfflineFirst() {
  const { syncState, addPendingChange } = useSyncManager();

  const executeOfflineFirst = useCallback(async (
    operation: () => Promise<any>,
    fallbackData: any,
    changeType: string
  ) => {
    if (syncState.isOnline) {
      try {
        // Try online operation first
        return await operation();
      } catch (error) {
        // If failed, queue for later and return fallback
        addPendingChange({
          type: changeType,
          data: fallbackData,
          operation: 'retry'
        });
        return fallbackData;
      }
    } else {
      // Offline - queue for later sync
      addPendingChange({
        type: changeType,
        data: fallbackData,
        operation: 'execute'
      });
      return fallbackData;
    }
  }, [syncState.isOnline, addPendingChange]);

  return {
    executeOfflineFirst,
    isOffline: !syncState.isOnline,
    hasPendingChanges: syncState.pendingChanges.length > 0
  };
}

export default syncManager;
