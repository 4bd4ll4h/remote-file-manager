import { useQuery } from "@tanstack/react-query";

interface DirectorySize {
  size: number;
  fileCount: number;
  path: string;
}

export function useDirectorySize(sessionId: string, path: string, enabled: boolean = true) {
  return useQuery<DirectorySize>({
    queryKey: ["directorySize", sessionId, path],
    queryFn: async () => {
      const res = await fetch(`/server/api/directory-size?serverId=${sessionId}&path=${encodeURIComponent(path)}`);
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    enabled: enabled && Boolean(sessionId) && Boolean(path) && path !== "/",
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: 1, // Only retry once
    retryDelay: 1000,
  });
} 