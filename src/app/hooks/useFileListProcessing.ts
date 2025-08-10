import { useState, useEffect, useMemo } from 'react';
import { ViewMode, SortField, SortDirection } from '@/app/components/FileToolbar';
import { storage, STORAGE_KEYS } from '@/app/lib/storage';

export interface FileItem {
  name: string;
  type: "file" | "directory";
  size: number;
  modified: string;
  permissions?: string;
  owner?: string;
  group?: string;
  isHidden?: boolean;
}

export function useFileListProcessing(files: FileItem[] = []) {
  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return storage.get(STORAGE_KEYS.FILE_VIEW_MODE, 'list') as ViewMode;
  });

  // Sort state
  const [sortBy, setSortBy] = useState<SortField>(() => {
    return storage.get(STORAGE_KEYS.FILE_SORT_BY, 'name') as SortField;
  });

  const [sortDirection, setSortDirection] = useState<SortDirection>(() => {
    return storage.get(STORAGE_KEYS.FILE_SORT_DIRECTION, 'asc') as SortDirection;
  });

  // Filter state
  const [filterText, setFilterText] = useState('');

  // Hidden files state
  const [showHiddenFiles, setShowHiddenFiles] = useState(() => {
    const saved = storage.get(STORAGE_KEYS.SHOW_HIDDEN_FILES, null);
    return saved === null ? false : saved === 'true';
  });

  // Persist view mode
  useEffect(() => {
    storage.set(STORAGE_KEYS.FILE_VIEW_MODE, viewMode);
  }, [viewMode]);

  // Persist sort preferences
  useEffect(() => {
    storage.set(STORAGE_KEYS.FILE_SORT_BY, sortBy);
  }, [sortBy]);

  useEffect(() => {
    storage.set(STORAGE_KEYS.FILE_SORT_DIRECTION, sortDirection);
  }, [sortDirection]);

  // Persist hidden files preference
  useEffect(() => {
    storage.set(STORAGE_KEYS.SHOW_HIDDEN_FILES, showHiddenFiles.toString());
  }, [showHiddenFiles]);

  // Helper function to get file extension
  const getFileExtension = (filename: string): string => {
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  };

  // Helper function to get file type for sorting
  const getFileType = (filename: string): string => {
    if (filename.includes('.')) {
      return getFileExtension(filename);
    }
    return 'no-extension';
  };

  // Filter files by text (name and extension)
  const filterByText = (files: FileItem[], text: string): FileItem[] => {
    if (!text.trim()) return files;
    
    const searchText = text.toLowerCase();
    return files.filter(file => {
      const name = file.name.toLowerCase();
      const extension = getFileExtension(file.name);
      
      return name.includes(searchText) || extension.includes(searchText);
    });
  };

  // Filter hidden files
  const filterHiddenFiles = (files: FileItem[], showHidden: boolean): FileItem[] => {
    if (showHidden) return files;
    return files.filter(file => !file.name.startsWith('.'));
  };

  // Sort files
  const sortFiles = (files: FileItem[], sortBy: SortField, direction: SortDirection): FileItem[] => {
    const sorted = [...files].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          // Natural sort for names (file2.txt comes before file10.txt)
          comparison = a.name.localeCompare(b.name, undefined, { numeric: true });
          break;
        
        case 'size':
          // Directories first, then by size
          if (a.type === 'directory' && b.type !== 'directory') return -1;
          if (a.type !== 'directory' && b.type === 'directory') return 1;
          comparison = a.size - b.size;
          break;
        
        case 'date':
          comparison = new Date(a.modified).getTime() - new Date(b.modified).getTime();
          break;
        
        case 'type':
          const aType = a.type === 'directory' ? 'directory' : getFileType(a.name);
          const bType = b.type === 'directory' ? 'directory' : getFileType(b.name);
          comparison = aType.localeCompare(bType);
          break;
      }

      return direction === 'desc' ? -comparison : comparison;
    });

    return sorted;
  };

  // Process files through the pipeline
  const processedFiles = useMemo(() => {
    let result = [...files];

    // 1. Filter hidden files
    result = filterHiddenFiles(result, showHiddenFiles);

    // 2. Filter by text
    result = filterByText(result, filterText);

    // 3. Sort files
    result = sortFiles(result, sortBy, sortDirection);

    return result;
  }, [files, showHiddenFiles, filterText, sortBy, sortDirection]);

  // Toggle hidden files
  const toggleHiddenFiles = () => {
    setShowHiddenFiles(prev => !prev);
  };

  // Handle sort change
  const handleSortChange = (field: SortField, direction: SortDirection) => {
    setSortBy(field);
    setSortDirection(direction);
  };

  return {
    // State
    viewMode,
    sortBy,
    sortDirection,
    filterText,
    showHiddenFiles,
    
    // Processed data
    processedFiles,
    
    // Actions
    setViewMode,
    handleSortChange,
    setFilterText,
    toggleHiddenFiles,
  };
} 