"use client";

import { Trash2, Copy, Scissors, Loader2, X, Download } from "lucide-react";
import { Button } from "./ui/Button";
import { FileItem } from "@/app/hooks/useFileListProcessing";

interface BulkOperationsToolbarProps {
  selectedFiles: FileItem[];
  onBulkDelete: () => void;
  onBulkCopy: () => void;
  onBulkMove: () => void;
  onBulkDownload: () => void;
  onPaste: () => void;
  hasClipboardItems: boolean;
  clipboardSummary: string;
  isAnyOperationPending: boolean;
  isDeletePending: boolean;
  isCopyPending: boolean;
  isMovePending: boolean;
  isDownloadPending: boolean;
  onCancel: () => void;
}

export default function BulkOperationsToolbar({
  selectedFiles,
  onBulkDelete,
  onBulkCopy,
  onBulkMove,
  onBulkDownload,
  onPaste,
  hasClipboardItems,
  clipboardSummary,
  isAnyOperationPending,
  isDeletePending,
  isCopyPending,
  isMovePending,
  isDownloadPending,
  onCancel
}: BulkOperationsToolbarProps) {
  const selectedCount = selectedFiles.length;
  const fileCount = selectedFiles.filter(f => f.type === "file").length;
  const folderCount = selectedFiles.filter(f => f.type === "directory").length;

  const getSelectionSummary = () => {
    if (fileCount > 0 && folderCount > 0) {
      return `${fileCount} file${fileCount > 1 ? "s" : ""} and ${folderCount} folder${folderCount > 1 ? "s" : ""}`;
    } else if (fileCount > 0) {
      return `${fileCount} file${fileCount > 1 ? "s" : ""}`;
    } else {
      return `${folderCount} folder${folderCount > 1 ? "s" : ""}`;
    }
  };

  if (selectedCount === 0 && !hasClipboardItems) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 p-3 bg-purple-50/50 dark:bg-purple-900/20 border border-purple-200/50 dark:border-purple-500/50 rounded-lg">
      {selectedCount > 0 && (
        <>
          <div className="text-sm text-purple-700 dark:text-purple-300 font-medium">
            {selectedCount} item{selectedCount > 1 ? "s" : ""} selected ({getSelectionSummary()})
          </div>
          
          <div className="flex gap-1">
          
              <Button
                variant="glass"
                size="sm"
                onClick={onBulkDownload}
                disabled={isAnyOperationPending}
                icon={isDownloadPending ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                >
              {isDownloadPending ? "Downloading..." : "Download"}
            </Button>
          
            <Button
              variant="glass"
              size="sm"
              onClick={onBulkCopy}
              disabled={isAnyOperationPending}
              icon={isCopyPending ? <Loader2 size={14} className="animate-spin" /> : <Copy size={14} />}
            >
              {isCopyPending ? "Copying..." : "Copy"}
            </Button>

            <Button
              variant="glass"
              size="sm"
              onClick={onBulkMove}
              disabled={isAnyOperationPending}
              icon={isMovePending ? <Loader2 size={14} className="animate-spin" /> : <Scissors size={14} />}
            >
              {isMovePending ? "Moving..." : "Move"}
            </Button>

            <Button
              variant="glass"
              size="sm"
              onClick={onBulkDelete}
              disabled={isAnyOperationPending}
              icon={isDeletePending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              {isDeletePending ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </>
      )}

      {hasClipboardItems && (
        <>
          <div className="text-sm text-purple-700 dark:text-purple-300 font-medium">
            {clipboardSummary}
          </div>
          
          <Button
            variant="glass"
            size="sm"
            onClick={onPaste}
            disabled={isAnyOperationPending}
            icon={isCopyPending || isMovePending ? <Loader2 size={14} className="animate-spin" /> : <Copy size={14} />}
          >
            {isCopyPending || isMovePending ? "Pasting..." : "Paste"}
          </Button>
          <Button
            variant="glass"
            size="sm"
            onClick={onCancel}
            disabled={isAnyOperationPending}
            icon={<X size={14} />}
          >
            Cancel
          </Button>
        </>
      )}
    </div>
  );
} 