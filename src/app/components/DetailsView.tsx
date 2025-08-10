"use client";

import { Folder, File, Edit, Download, Trash2, Copy, Scissors } from "lucide-react";
import { Button } from "./ui/Button";
import { FileItem } from "@/app/hooks/useFileListProcessing";

interface DetailsViewProps {
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

export default function DetailsView({
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
}: DetailsViewProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getFileType = (file: FileItem) => {
    if (file.type === "directory") return "Directory";
    const parts = file.name.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : "File";
  };

  const getFileIcon = (file: FileItem) => {
    if (file.type === "directory") {
      return <Folder className="h-4 w-4 text-purple-600 dark:text-purple-400" />;
    }
    return <File className="h-4 w-4 text-blue-600 dark:text-blue-400" />;
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
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-purple-200/50 dark:border-purple-500/50">
            <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">
            </th>
            <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">Name</th>
            <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">Size</th>
            <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">Type</th>
            <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">Modified</th>
            {files.some(f => f.permissions) && (
              <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">Permissions</th>
            )}
            {files.some(f => f.owner) && (
              <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">Owner</th>
            )}
            <th className="text-left p-3 font-medium text-gray-700 dark:text-gray-300">Actions</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file, index) => (
            <tr
              key={file.name}
              className={`border-b border-purple-100/50 dark:border-purple-500/20 hover:bg-white/30 dark:hover:bg-slate-800/30 transition-colors duration-150 cursor-pointer ${
                isSelected(file.name) ? 'bg-purple-100/30 dark:bg-purple-900/20' : ''
              }`}
              onClick={(e) => onFileSelectionClick(file.name, index, e)}
            >
              {/* Selection Checkbox */}
              <td className="p-3">
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
              </td>

              {/* Name */}
              <td className="p-3">
                <div className="flex items-center gap-2">
                  {getFileIcon(file)}
                  <span className="font-medium text-gray-800 dark:text-white">
                    {file.name}
                  </span>
                </div>
              </td>

              {/* Size */}
              <td className="p-3 text-sm text-gray-600 dark:text-gray-400">
                {file.type === "file" ? formatFileSize(file.size) : "—"}
              </td>

              {/* Type */}
              <td className="p-3 text-sm text-gray-600 dark:text-gray-400">
                {getFileType(file)}
              </td>

              {/* Modified Date */}
              <td className="p-3 text-sm text-gray-600 dark:text-gray-400">
                {formatDate(file.modified)}
              </td>

              {/* Permissions */}
              {files.some(f => f.permissions) && (
                <td className="p-3 text-sm text-gray-600 dark:text-gray-400 font-mono">
                  {file.permissions || "—"}
                </td>
              )}

              {/* Owner */}
              {files.some(f => f.owner) && (
                <td className="p-3 text-sm text-gray-600 dark:text-gray-400">
                  {file.owner || "—"}
                </td>
              )}

              {/* Actions */}
              <td className="p-3">
                <div className="flex gap-1">
                  <Button
                    variant="glass"
                    size="sm"
                    onClick={(e) => {
                      e?.stopPropagation();
                      onRename(file.name);
                    }}
                    disabled={isAnyOperationPending}
                    icon={<Edit size={14} />}
                    className="p-1"
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
                    icon={<Copy size={14} />}
                    className="p-1"
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
                    icon={<Scissors size={14} />}
                    className="p-1"
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
                      icon={<Download size={14} />}
                      className="p-1"
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
                    icon={<Trash2 size={14} />}
                    className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 