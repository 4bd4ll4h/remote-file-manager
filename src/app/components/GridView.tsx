"use client";

import { Folder, File, Edit, Download, Trash2, Copy, Scissors } from "lucide-react";
import { Button } from "./ui/Button";
import { FileItem } from "@/app/hooks/useFileListProcessing";
import { useState } from "react";

interface GridViewProps {
  files: FileItem[];
  
  onRename: (fileName: string) => void;
  onDelete: (fileName: string) => void;
  onDownload: (fileName: string) => void;
  onCopy: (fileName: string) => void;
  onMove: (fileName: string) => void;
  isAnyOperationPending: boolean;
  // Selection props
  selectedFiles: Set<string>;
  onFileSelectionClick: (fileName: string, index: number, event: React.MouseEvent) => void;
  onCheckboxChange: (fileName: string, checked: boolean) => void;
  isSelected: (fileName: string) => boolean;
}

export default function GridView({
  files,
  onRename,
  onDelete,
  onDownload,
  onCopy,
  onMove,
  isAnyOperationPending,
  selectedFiles,
  onFileSelectionClick,
  onCheckboxChange,
  isSelected
}: GridViewProps) {
  const [hoveredFile, setHoveredFile] = useState<string | null>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file: FileItem) => {
    if (file.type === "directory") {
      return <Folder className="h-8 w-8 text-purple-600 dark:text-purple-400" />;
    }
    return <File className="h-8 w-8 text-blue-600 dark:text-blue-400" />;
  };

  if (files.length === 0) {
    return (
      <div className="text-center py-8">
        <Folder className="mx-auto h-12 w-12 text-gray-400" />
        <p className="text-gray-400 dark:text-gray-500 mt-2">No files found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
      {files.map((file, index) => (
        <div
          key={file.name}
          className={`relative group p-4 rounded-lg bg-white/30 dark:bg-slate-800/30 border border-purple-200/50 dark:border-purple-500/50 backdrop-blur-[10px] hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all duration-200 cursor-pointer text-center ${
            isSelected(file.name) ? 'bg-purple-100/50 dark:bg-purple-900/30 border-purple-300 dark:border-purple-400' : ''
          }`}
          onClick={(e) => onFileSelectionClick(file.name, index, e)}
          onMouseEnter={() => setHoveredFile(file.name)}
          onMouseLeave={() => setHoveredFile(null)}
        >
          {/* Selection Checkbox */}
          <div className="absolute top-2 left-2 z-10">
            <input
              type="checkbox"
              checked={isSelected(file.name)}
              onChange={(e) => {
                e.stopPropagation();
                onCheckboxChange(file.name, e.target.checked);
              }}
              onClick={(e) => {
                e.stopPropagation();
              }}
              className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
          </div>

          {/* File Icon */}
          <div className="mb-3">
            {getFileIcon(file)}
          </div>

          {/* File Name */}
          <div className="mb-2">
            <p className="text-sm font-medium text-gray-800 dark:text-white truncate">
              {file.name}
            </p>
          </div>

          {/* File Size */}
          <div className="mb-3">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {file.type === "file" ? formatFileSize(file.size) : "—"}
            </p>
          </div>

          {/* Action Buttons - Show on hover */}
          {hoveredFile === file.name && (
            <div className="absolute top-2 right-2 flex gap-1">
              <Button
                variant="glass"
                size="sm"
                onClick={(e) => {
                  e?.stopPropagation();
                  onRename(file.name);
                }}
                disabled={isAnyOperationPending}
                icon={<Edit size={12} />}
                className="p-1 min-w-[24px] h-6"
              >
                <span className="sr-only">Rename</span>
              </Button>

              <Button
                variant="glass"
                size="sm"
                onClick={(e) => {
                  e?.stopPropagation();
                  onCopy(file.name);
                }}
                disabled={isAnyOperationPending}
                icon={<Copy size={12} />}
                className="p-1 min-w-[24px] h-6"
              >
                <span className="sr-only">Copy</span>
              </Button>

              <Button
                variant="glass"
                size="sm"
                onClick={(e) => {
                  e?.stopPropagation();
                  onMove(file.name);
                }}
                disabled={isAnyOperationPending}
                icon={<Scissors size={12} />}
                className="p-1 min-w-[24px] h-6"
              >
                <span className="sr-only">Move</span>
              </Button>
              
              {file.type === "file" && (
                <Button
                  variant="glass"
                  size="sm"
                  onClick={(e) => {
                    e?.stopPropagation();
                    onDownload(file.name);
                  }}
                  disabled={isAnyOperationPending}
                  icon={<Download size={12} />}
                  className="p-1 min-w-[24px] h-6"
                >
                  <span className="sr-only">Download</span>
                </Button>
              )}
              
              <Button
                variant="glass"
                size="sm"
                onClick={(e) => {
                  e?.stopPropagation();
                  onDelete(file.name);
                }}
                disabled={isAnyOperationPending}
                icon={<Trash2 size={12} />}
                className="p-1 min-w-[24px] h-6 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                <span className="sr-only">Delete</span>
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 