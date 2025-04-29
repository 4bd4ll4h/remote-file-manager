export interface FileItem {
    name: string;
    type: "file" | "directory" | "symlink";
    size: number;
    permissions: string;
    owner: string;
    group: string;
    date: string;     // Full ISO string
    isHidden: boolean;
  }
  