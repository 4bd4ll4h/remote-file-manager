"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Folder, File, Edit, Download, Trash2, RefreshCw, Upload, Loader2, FolderPlus } from "lucide-react";
import BreadcrumbNavigation from "./Breadcrumb";
import { Card } from "./ui/Card";
import { Button } from "./ui/Button";
import { GlassmorphismLayout } from "./ui/GlassmorphismLayout";
import { useFileOperations } from "@/app/hooks/useFileOperations";
import { useFileListProcessing } from "@/app/hooks/useFileListProcessing";
import { useDirectorySize } from "@/app/hooks/useDirectorySize";
import { useFileSelection } from "@/app/hooks/useFileSelection";
import { useClipboard } from "@/app/hooks/useClipboard";
import { useKeyboardShortcuts } from "@/app/hooks/useKeyboardShortcuts";
import FileToolbar from "./FileToolbar";
import BulkOperationsToolbar from "./BulkOperationsToolbar";
import ListView from "./ListView";
import GridView from "./GridView";
import DetailsView from "./DetailsView";
import { useSessionTabs } from "../hooks/useSessionTabs";
import { usePathManagement } from "../hooks/usePathManagement";

type FileItem = {
    name: string;
    type: "file" | "directory";
    size: number;
    modified: string;
    permissions?: string;
    owner?: string;
    group?: string;
    isHidden?: boolean;
};

export default function FileBrowser({ sessionId }: { sessionId: string }) {
    const { path, navigate, navigateInto } = usePathManagement(sessionId);

    const { data: rawFiles, isFetching, isError, refetch } = useQuery<FileItem[]>({
        queryKey: ["fileList", sessionId, path],
        queryFn: async () => {
            const res = await fetch(`/server/api/list?serverId=${sessionId}&path=${encodeURIComponent(path)}`);
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
         
    });

    // Process files through filtering, sorting, and view mode
    const {
        viewMode,
        sortBy,
        sortDirection,
        filterText,
        showHiddenFiles,
        processedFiles,
        setViewMode,
        handleSortChange,
        setFilterText,
        toggleHiddenFiles,
    } = useFileListProcessing(rawFiles || []);

    // Get directory size for current path
    const { data: directorySize } = useDirectorySize(sessionId, path);

    const fileOps = useFileOperations(sessionId, path);
    
    // File selection and clipboard management
    const fileSelection = useFileSelection();
    const clipboard = useClipboard();

    const handleDropUpload = async (e: React.DragEvent) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (!files) return;
        fileOps.upload.mutate({ files: Array.from(files), destinationPath: path });
    };

    const handleFileInputUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        fileOps.upload.mutate({ files: Array.from(files), destinationPath: path });
        // Clear the input so the same file can be uploaded again
        e.target.value = '';
    };

    const handleDelete = async (name: string) => {
        const confirmed = confirm(`Delete ${name}?`);
        if (!confirmed) return;
        
        fileOps.delete.mutate({ path: `${path}/${name}` });
    };

    const handleBulkDelete = async () => {
        const selectedFiles = fileSelection.getSelectedFiles(processedFiles);
        if (selectedFiles.length === 0) return;

        const fileCount = selectedFiles.filter(f => f.type === "file").length;
        const folderCount = selectedFiles.filter(f => f.type === "directory").length;
        
        let summary = `Delete ${selectedFiles.length} item${selectedFiles.length > 1 ? "s" : ""}?`;
        if (fileCount > 0 && folderCount > 0) {
            summary += `\n\nThis will delete:\n• ${fileCount} file${fileCount > 1 ? "s" : ""}\n• ${folderCount} folder${folderCount > 1 ? "s" : ""} and all their contents`;
        } else if (fileCount > 0) {
            summary += `\n\nThis will delete ${fileCount} file${fileCount > 1 ? "s" : ""}`;
        } else {
            summary += `\n\nThis will delete ${folderCount} folder${folderCount > 1 ? "s" : ""} and all their contents`;
        }
        
        const confirmed = confirm(summary);
        if (!confirmed) return;

        fileOps.bulkDelete.mutate({ 
            items: selectedFiles,
            onProgress: (current, total, item) => {
                // Could show progress toast here
            }
        });
        
        fileSelection.deselectAll();
    };

  const handleBulkDownload = () => {
    const selectedFiles = fileSelection.getSelectedFiles(processedFiles);
    if (selectedFiles.length === 0) return;
    const items = selectedFiles.map(f => ({ path: `${path}/${f.name}` }));
    fileOps.bulkDownload.mutate({ items, zipName: `${path.split('/').pop() || 'download'}.zip` });
  };

    const handleCopy = (name: string) => {
        const file = processedFiles.find(f => f.name === name);
        if (!file) return;
        
        clipboard.copyToClipboard([file], path);
        toast.success(`${file.name} copied to clipboard`);
    };

    const handleMove = (name: string) => {
        const file = processedFiles.find(f => f.name === name);
        if (!file) return;
        
        clipboard.moveToClipboard([file], path);
        toast.success(`${file.name} moved to clipboard`);
    };

    const handleBulkCopy = () => {
        const selectedFiles = fileSelection.getSelectedFiles(processedFiles);
        if (selectedFiles.length === 0) return;
        
        clipboard.copyToClipboard(selectedFiles, path);
        toast.success(`${selectedFiles.length} item${selectedFiles.length > 1 ? "s" : ""} copied to clipboard`);
        fileSelection.deselectAll();
    };

    const handleBulkMove = () => {
        const selectedFiles = fileSelection.getSelectedFiles(processedFiles);
        if (selectedFiles.length === 0) return;
        
        clipboard.moveToClipboard(selectedFiles, path);
        toast.success(`${selectedFiles.length} item${selectedFiles.length > 1 ? "s" : ""} moved to clipboard`);
        fileSelection.deselectAll();
    };

    const handlePaste = async () => {
        if (!clipboard.hasClipboardItems || clipboard.clipboardItems.length === 0) return;

        const destinationPath = path;
        
        for (const item of clipboard.clipboardItems) {
            const destinationItemPath = `${destinationPath}/${item.file.name}`;
            
            try {
                if (clipboard.operation === "copy") {
                    await fileOps.copy.mutateAsync({
                        sourcePath: item.sourcePath,
                        destinationPath: destinationItemPath
                    });
                } else if (clipboard.operation === "move") {
                    await fileOps.move.mutateAsync({
                        sourcePath: item.sourcePath,
                        destinationPath: destinationItemPath
                    });
                }
            } catch (error: any) {
                toast.error(`Failed to ${clipboard.operation} ${item.file.name}: ${error.message}`);
                return; // Stop on first error
            }
        }
        
        clipboard.clearClipboard();
        toast.success(`Successfully ${clipboard.operation === "copy" ? "copied" : "moved"} ${clipboard.clipboardItems.length} item${clipboard.clipboardItems.length > 1 ? "s" : ""}`);
    };

    const handleRename = async (oldName: string) => {
        const newName = prompt("New name:", oldName);
        if (!newName || newName === oldName) return;

        const oldPath = `${path}/${oldName}`;
        const newPath = `${path}/${newName}`;
        
        fileOps.rename.mutate({ oldPath, newPath });
    };

    const handleCreateFolder = async () => {
        const folderName = prompt("Folder name:");
        if (!folderName) return;

        const folderPath = `${path}/${folderName}`;
        fileOps.createFolder.mutate({ path: folderPath });
    };

    const handleDownload = (name: string) => {
        const url = `/server/api/download?serverId=${sessionId}&path=${encodeURIComponent(
            `${path}/${name}`
        )}`;
        window.open(url, "_blank");
    };

    const handleFolderClick = (name: string) => {
        navigateInto(name);
        // Clear selection when navigating to a new folder
        fileSelection.deselectAll();
    };

    const handleFileClick = (file: FileItem) => {
        if (file.type === "directory") {
            handleFolderClick(file.name);
        }
    };

    const handleFileSelectionClick = (fileName: string, index: number, event: React.MouseEvent) => {
        const isOnefile = fileSelection.handleFileClick(fileName, index, processedFiles, event);
        if (isOnefile) {
            handleFileClick(processedFiles[index]);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Keyboard shortcuts
    useKeyboardShortcuts({
        onSelectAll: () => fileSelection.selectAll(processedFiles),
        onDeselectAll: () => fileSelection.deselectAll(),
        onCopy: handleBulkCopy,
        onPaste: handlePaste,
        onDelete: handleBulkDelete,
        onRefresh: () => refetch(),
        hasSelection: fileSelection.selectedCount > 0,
        hasClipboardItems: clipboard.hasClipboardItems,
        isAnyOperationPending: fileOps.upload.isPending || fileOps.delete.isPending || 
                               fileOps.bulkDelete.isPending || fileOps.copy.isPending ||
                               fileOps.move.isPending || fileOps.rename.isPending || 
                               fileOps.createFolder.isPending
    });

    // Check if any operation is pending
    const isAnyOperationPending = fileOps.upload.isPending || fileOps.delete.isPending || 
                                 fileOps.bulkDelete.isPending || fileOps.copy.isPending ||
                                 fileOps.move.isPending || fileOps.rename.isPending || 
                                 fileOps.createFolder.isPending;

    // Render the appropriate view component
    const renderViewComponent = () => {
        const viewProps = {
            files: processedFiles,
            onRename: handleRename,
            onDelete: handleDelete,
            onDownload: handleDownload,
            onCopy: handleCopy,
            onMove: handleMove,
            isAnyOperationPending,
            selectedFiles: fileSelection.selectedFiles,
            onFileSelectionClick: handleFileSelectionClick,
            onCheckboxChange: fileSelection.handleCheckboxChange,
            isSelected: fileSelection.isSelected,
        };

        switch (viewMode) {
            case 'list':
                return <ListView {...viewProps} />;
            case 'grid':
                return <GridView {...viewProps} />;
            case 'details':
                return <DetailsView {...viewProps} />;
            default:
                return <ListView {...viewProps} />;
        }
    };

    return (
        <GlassmorphismLayout variant="content">
            <div className="space-y-6">
                <Card variant="glass" className="space-y-4">
                    <BreadcrumbNavigation path={path} onNavigate={navigate} />

                    {/* File Toolbar */}
                    <FileToolbar
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                        sortBy={sortBy}
                        sortDirection={sortDirection}
                        onSortChange={handleSortChange}
                        filterText={filterText}
                        onFilterChange={setFilterText}
                        showHiddenFiles={showHiddenFiles}
                        onToggleHiddenFiles={toggleHiddenFiles}
                        disabled={isAnyOperationPending}
                    />

                    {/* Bulk Operations Toolbar */}
                    <BulkOperationsToolbar
                        selectedFiles={fileSelection.getSelectedFiles(processedFiles)}
                        onBulkDeleteAction={handleBulkDelete}
                        onBulkCopyAction={handleBulkCopy}
                        onBulkMoveAction={handleBulkMove}
                        onBulkDownloadAction={handleBulkDownload}
                        onPasteAction={handlePaste}
                        hasClipboardItems={clipboard.hasClipboardItems}
                        clipboardSummary={clipboard.getClipboardSummary()}
                        isAnyOperationPending={isAnyOperationPending}
                        isDeletePending={fileOps.bulkDelete.isPending}
                        isCopyPending={fileOps.copy.isPending}
                        isMovePending={fileOps.move.isPending}
                        isDownloadPending={fileOps.bulkDownload.isPending}
                        onCancelAction={() => {
                            clipboard.clearClipboard();
                            fileSelection.deselectAll();
                        }}
                    />

                    {/* Directory Info */}
                    {directorySize && directorySize.size > 0 && (
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            Directory size: {formatFileSize(directorySize.size)} 
                            {directorySize.fileCount > 0 && ` (${directorySize.fileCount} files)`}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center gap-4">
                        {/* Select All Checkbox */}
                        <div className="relative group flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="select-all"
                                checked={processedFiles.length > 0 && processedFiles.every(f => fileSelection.isSelected(f.name))}
                                onChange={(e) => {
                                    if (e.target.checked) {
                                        fileSelection.selectAll(processedFiles);
                                    } else {
                                        fileSelection.deselectAll();
                                    }
                                }}
                                disabled={processedFiles.length === 0}
                                className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                            />
                            
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleCreateFolder}
                                disabled={fileOps.createFolder.isPending}
                                icon={fileOps.createFolder.isPending ? <Loader2 size={16} className="animate-spin" /> : <FolderPlus size={16} />}
                            >
                                {fileOps.createFolder.isPending ? "Creating..." : "New Folder"}
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={async () => await refetch({ cancelRefetch: true })}
                                disabled={isFetching}
                                icon={isFetching ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                            >
                                {isFetching ? "Loading..." : "Refresh"}
                            </Button>
                        </div>
                    </div>

                    {/* Loading State */}
                    {isFetching && (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
                            <p className="text-gray-500 dark:text-gray-400 mt-2">Loading files...</p>
                        </div>
                    )}
                    
                    {/* Error State */}
                    {isError && (
                        <div className="text-center py-8">
                            <p className="text-red-500 dark:text-red-400">Failed to load files</p>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => refetch()}
                                className="mt-2"
                            >
                                Try Again
                            </Button>
                        </div>
                    )}

                    {/* File List */}
                    {!isFetching && !isError && renderViewComponent()}
                </Card>

                {/* Upload Area */}
                <Card variant="glass">
                    <div
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={handleDropUpload}
                        className={`border-dashed border-2 border-purple-300 dark:border-purple-500 rounded-lg p-6 text-center transition-colors duration-200 ${
                            fileOps.upload.isPending 
                                ? "bg-purple-100 dark:bg-purple-900/30" 
                                : "hover:bg-purple-50 dark:hover:bg-purple-900/20"
                        }`}
                    >
                        {fileOps.upload.isPending ? (
                            <>
                                <Loader2 className="mx-auto h-8 w-8 text-purple-500 mb-2 animate-spin" />
                                <p className="text-sm text-purple-600 dark:text-purple-400">
                                    Uploading file...
                                </p>
                            </>
                        ) : (
                            <>
                                <Upload className="mx-auto h-8 w-8 text-purple-500 mb-2" />
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Drag and drop files to upload, or
                                    <label className="underline cursor-pointer ml-1 text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300">
                                        select file(s)
                                        <input 
                                            type="file" 
                                            hidden 
                                            multiple
                                            onChange={handleFileInputUpload}
                                            disabled={fileOps.upload.isPending}
                                        />
                                    </label>
                                </p>
                            </>
                        )}
                    </div>
                </Card>
            </div>
        </GlassmorphismLayout>
    );
}
