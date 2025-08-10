import { useState, useEffect, useCallback } from 'react';
import { useSessionTabs } from './useSessionTabs';

export function usePathManagement(sessionId: string) {
  const { updateTab, tabs } = useSessionTabs();
  const [path, setPath] = useState("/");
  const [isInitialized, setIsInitialized] = useState(false);

  // Get current tab info
  const currentTab = tabs.find(tab => tab.sessionId === sessionId);

  // Initialize path when sessionId changes (tab switching)
  useEffect(() => {
    const tabPath = currentTab?.path || "/";
    setPath(tabPath);
    setIsInitialized(true);
  }, [sessionId, currentTab?.path]);

  // Update tab with current path when path changes
  const updatePath = useCallback((newPath: string) => {
    setPath(newPath);
    
    if (isInitialized && currentTab) {
      updateTab(currentTab.id, { path: newPath });
    }
  }, [isInitialized, currentTab, updateTab]);

  // Navigate to a new path
  const navigate = useCallback((newPath: string) => {
    updatePath(newPath);
  }, [updatePath]);

  // Navigate to parent directory
  const navigateUp = useCallback(() => {
    if (path === "/") return;
    
    const parentPath = path.split('/').slice(0, -1).join('/') || "/";
    updatePath(parentPath);
  }, [path, updatePath]);

  // Navigate into a directory
  const navigateInto = useCallback((dirName: string) => {
    const newPath = path.endsWith("/") 
      ? `${path}${dirName}`
      : `${path}/${dirName}`;
    updatePath(newPath);
  }, [path, updatePath]);

  return {
    path,
    navigate,
    navigateUp,
    navigateInto,
    updatePath,
    isInitialized,
    currentTab
  };
} 