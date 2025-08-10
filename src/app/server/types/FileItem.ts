export interface FileItem {
    name: string;
    type: "file" | "directory" | "symlink";
    size: number;
    permissions: string;
    owner: string;
    group: string;
    modified: string;     // Full ISO string
    isHidden: boolean;
  }
  