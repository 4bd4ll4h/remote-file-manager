import { useState, useCallback } from "react";
import { FileItem } from "@/app/hooks/useFileListProcessing";

export function useFileSelection() {
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);

  const toggleFileSelection = useCallback((fileName: string, index: number) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileName)) {
        newSet.delete(fileName);
      } else {
        newSet.add(fileName);
      }
      return newSet;
    });
    setLastSelectedIndex(index);
  }, []);

  const selectFileRange = useCallback((startIndex: number, endIndex: number, files: FileItem[]) => {
    const start = Math.min(startIndex, endIndex);
    const end = Math.max(startIndex, endIndex);
    
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      for (let i = start; i <= end; i++) {
        newSet.add(files[i].name);
      }
      return newSet;
    });
  }, []);

  const handleFileClick = useCallback((
    fileName: string, 
    index: number, 
    files: FileItem[], 
    event: React.MouseEvent
  ) => {
    if (event.shiftKey && lastSelectedIndex == null) {
      setLastSelectedIndex(index);
      return false;
    } 
    else if (event.shiftKey && lastSelectedIndex !== null) {
      selectFileRange(lastSelectedIndex, index, files);
      return false;
    }else if (event.ctrlKey || event.metaKey) {
      // Ctrl/Cmd+click: toggle individual selection
      toggleFileSelection(fileName, index);
      return false;
    } else return true;
    

  }, [lastSelectedIndex, selectFileRange, toggleFileSelection]);

  const handleCheckboxChange = useCallback((fileName: string, checked: boolean) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(fileName);
      } else {
        newSet.delete(fileName);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback((files: FileItem[]) => {
    setSelectedFiles(new Set(files.map(f => f.name)));
  }, []);

  const deselectAll = useCallback(() => {
    setSelectedFiles(new Set());
    setLastSelectedIndex(null);
  }, []);

  const isAllSelected = useCallback((files: FileItem[]) => {
    return files.length > 0 && files.every(f => selectedFiles.has(f.name));
  }, [selectedFiles]);

  const isPartiallySelected = useCallback((files: FileItem[]) => {
    return files.some(f => selectedFiles.has(f.name)) && !isAllSelected(files);
  }, [selectedFiles, isAllSelected]);

  const getSelectedFiles = useCallback((files: FileItem[]) => {
    return files.filter(f => selectedFiles.has(f.name));
  }, [selectedFiles]);

  const getSelectedCount = useCallback(() => {
    return selectedFiles.size;
  }, [selectedFiles]);

  return {
    selectedFiles,
    selectedCount: getSelectedCount(),
    isSelected: (fileName: string) => selectedFiles.has(fileName),
    handleFileClick,
    handleCheckboxChange,
    selectAll,
    deselectAll,
    isAllSelected,
    isPartiallySelected,
    getSelectedFiles,
  };
} 