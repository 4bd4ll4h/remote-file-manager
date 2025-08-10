import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function useFileOperations(sessionId: string, currentPath: string) {
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async ({ files, destinationPath }: { 
      files: File[];  
      destinationPath?: string; 
    }) => {
      const formData = new FormData();
      
      // Append all files
      files.forEach(file => {
        formData.append("files", file);
      });
      
      formData.append("serverId", sessionId);
      if (destinationPath) {
        formData.append("destinationPath", destinationPath);
      }
      
      const res = await fetch("/server/api/upload", {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: (data) => {
      // Invalidate the exact query that matches the current directory
      queryClient.invalidateQueries({ 
        queryKey: ["fileList", sessionId, currentPath],
        exact: true 
      });
      
      const successCount = data.results?.filter((r: any) => r.success).length || 0;
      const totalCount = data.results?.length || 0;
      
      if (successCount === totalCount) {
        toast.success(`Successfully uploaded ${successCount} file(s)`);
      } else {
        toast.success(`Uploaded ${successCount}/${totalCount} files successfully`);
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Upload failed");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ path }: { path: string }) => {
      const res = await fetch("/server/api/delete", {
        method: "POST",
        body: JSON.stringify({ serverId: sessionId, path }),
        headers: { "Content-Type": "application/json" },
      });
      
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["fileList", sessionId, currentPath],
        exact: true 
      });
      toast.success("File deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Delete failed");
    },
  });

  const bulkDownloadMutation = useMutation({
    mutationFn: async ({ items, zipName }: { items: Array<{ path: string }>; zipName?: string }) => {
      const res = await fetch("/server/api/download/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ serverId: sessionId, items, zipName }),
      });
      if (!res.ok) throw new Error(await res.text());

      // Trigger browser download
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = zipName || "download.zip";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      return true;
    },
    onSuccess: () => {
      toast.success("Bulk download started");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Bulk download failed");
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async ({ 
      items, 
      onProgress 
    }: { 
      items: Array<{ name: string; type: "file" | "directory" }>;
      onProgress?: (current: number, total: number, item: string) => void;
    }) => {
      const results = [];
      
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const itemPath = `${currentPath}/${item.name}`;
        
        try {
          onProgress?.(i + 1, items.length, item.name);
          
          const res = await fetch("/server/api/delete", {
            method: "POST",
            body: JSON.stringify({ 
              serverId: sessionId, 
              path: itemPath,
              isDir: item.type === "directory"
            }),
            headers: { "Content-Type": "application/json" },
          });
          
          if (!res.ok) {
            const error = await res.text();
            throw new Error(`Failed to delete ${item.name}: ${error}`);
          }
          
          results.push({ name: item.name, success: true });
        } catch (error: any) {
          results.push({ name: item.name, success: false, error: error.message });
          throw error; // Stop on first error
        }
      }
      
      return results;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ 
        queryKey: ["fileList", sessionId, currentPath],
        exact: true 
      });
      const successCount = results.filter(r => r.success).length;
      toast.success(`Successfully deleted ${successCount} item(s)`);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Bulk delete failed");
    },
  });

  const copyMutation = useMutation({
    mutationFn: async ({ 
      sourcePath, 
      destinationPath,
      onProgress 
    }: { 
      sourcePath: string;
      destinationPath: string;
      onProgress?: (progress: number) => void;
    }) => {
      const res = await fetch("/server/api/copy", {
        method: "POST",
        body: JSON.stringify({ 
          serverId: sessionId, 
          sourcePath, 
          destinationPath 
        }),
        headers: { "Content-Type": "application/json" },
      });
      
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["fileList", sessionId, currentPath],
        exact: true 
      });
      toast.success("File copied successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Copy failed");
    },
  });

  const moveMutation = useMutation({
    mutationFn: async ({ 
      sourcePath, 
      destinationPath,
      onProgress 
    }: { 
      sourcePath: string;
      destinationPath: string;
      onProgress?: (progress: number) => void;
    }) => {
      const res = await fetch("/server/api/move", {
        method: "POST",
        body: JSON.stringify({ 
          serverId: sessionId, 
          sourcePath, 
          destinationPath 
        }),
        headers: { "Content-Type": "application/json" },
      });
      
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["fileList", sessionId, currentPath],
        exact: true 
      });
      toast.success("File moved successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Move failed");
    },
  });

  const renameMutation = useMutation({
    mutationFn: async ({ oldPath, newPath }: { oldPath: string; newPath: string }) => {
      const res = await fetch("/server/api/rename", {
        method: "POST",
        body: JSON.stringify({
          serverId: sessionId,
          oldPath,
          newPath,
        }),
        headers: { "Content-Type": "application/json" },
      });
      
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["fileList", sessionId, currentPath],
        exact: true 
      });
      toast.success("File renamed successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Rename failed");
    },
  });

  const createFolderMutation = useMutation({
    mutationFn: async ({ path }: { path: string }) => {
      const res = await fetch("/server/api/create", {
        method: "POST",
        body: JSON.stringify({ serverId: sessionId, path, isDir: true }),
        headers: { "Content-Type": "application/json" },
      });
      
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["fileList", sessionId, currentPath],
        exact: true 
      });
      toast.success("Folder created successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Create folder failed");
    },
  });

  return {
    upload: uploadMutation,
    delete: deleteMutation,
    bulkDelete: bulkDeleteMutation,
    bulkDownload: bulkDownloadMutation,
    copy: copyMutation,
    move: moveMutation,
    rename: renameMutation,
    createFolder: createFolderMutation,
  };
} 