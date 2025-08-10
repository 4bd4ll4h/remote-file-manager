// Centralized storage utilities for safe localStorage access

export const storage = {
  // Safely get item from localStorage
  get: (key: string, defaultValue: any = null) => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const item = localStorage.getItem(key);
      return item ? item : defaultValue;
    } catch (error) {
      console.warn(`Failed to read from localStorage key "${key}":`, error);
      return defaultValue;
    }
  },

  // Safely set item in localStorage
  set: (key: string, value: any) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(
        key,
        typeof value === 'string' ? value : JSON.stringify(value)
      );
    } catch (error) {
      console.warn(`Failed to write to localStorage key "${key}":`, error);
    }
  },

  // Safely remove item from localStorage
  remove: (key: string) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove from localStorage key "${key}":`, error);
    }
  },

  // Check if localStorage is available
  isAvailable: () => {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }
};

// Specific storage keys for type safety
export const STORAGE_KEYS = {
  TABS: 'tabs',
  ACTIVE_TAB: 'activeTabId',
  THEME: 'theme',
  FILE_VIEW_MODE: 'fileViewMode',
  FILE_SORT_BY: 'fileSortBy',
  FILE_SORT_DIRECTION: 'fileSortDirection',
  SHOW_HIDDEN_FILES: 'showHiddenFiles',
} as const; 