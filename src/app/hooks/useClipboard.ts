import { useState, useCallback } from "react";
import { FileItem } from "@/app/hooks/useFileListProcessing";

export type ClipboardOperation = "copy" | "move";

export interface ClipboardItem {
  file: FileItem;
  sourcePath: string;
}

export function useClipboard() {
  const [clipboardItems, setClipboardItems] = useState<ClipboardItem[]>([]);
  const [operation, setOperation] = useState<ClipboardOperation | null>(null);

  const copyToClipboard = useCallback((files: FileItem[], sourcePath: string) => {
    const items: ClipboardItem[] = files.map(file => ({
      file,
      sourcePath: `${sourcePath}/${file.name}`
    }));
    setClipboardItems(items);
    setOperation("copy");
  }, []);

  const moveToClipboard = useCallback((files: FileItem[], sourcePath: string) => {
    const items: ClipboardItem[] = files.map(file => ({
      file,
      sourcePath: `${sourcePath}/${file.name}`
    }));
    setClipboardItems(items);
    setOperation("move");
  }, []);

  const clearClipboard = useCallback(() => {
    setClipboardItems([]);
    setOperation(null);
  }, []);

  const hasClipboardItems = useCallback(() => {
    return clipboardItems.length > 0;
  }, [clipboardItems.length]);

  const getClipboardSummary = useCallback(() => {
    if (!hasClipboardItems()) return "";
    
    const fileCount = clipboardItems.filter(item => item.file.type === "file").length;
    const folderCount = clipboardItems.filter(item => item.file.type === "directory").length;
    
    let summary = `${operation === "copy" ? "Copy" : "Move"} `;
    if (fileCount > 0 && folderCount > 0) {
      summary += `${fileCount} file${fileCount > 1 ? "s" : ""} and ${folderCount} folder${folderCount > 1 ? "s" : ""}`;
    } else if (fileCount > 0) {
      summary += `${fileCount} file${fileCount > 1 ? "s" : ""}`;
    } else {
      summary += `${folderCount} folder${folderCount > 1 ? "s" : ""}`;
    }
    
    return summary;
  }, [clipboardItems, operation, hasClipboardItems]);

  return {
    clipboardItems,
    operation,
    copyToClipboard,
    moveToClipboard,
    clearClipboard,
    hasClipboardItems: hasClipboardItems(),
    getClipboardSummary,
  };
} 