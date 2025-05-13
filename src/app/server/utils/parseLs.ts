import type { FileItem } from "@/app/server/types/FileItem";

export function parseLsOutput(output: string): FileItem[] {
  const lines = output.split("\n").slice(1); // Skip first "total XYZ" line
  const files: FileItem[] = [];

  for (const line of lines) {
    if (!line.trim()) continue;

    const parts = line.trim().split(/\s+/);

    // Permissions are always first
    const permissions = parts[0];
    const owner = parts[2];
    const group = parts[3];
    const size = parseInt(parts[4], 10);
    const date = `${parts[5]} ${parts[6]} ${parts[7]}`; // Example: 2025-04-26 09:55:01.123456789
    const name = parts.slice(8).join(' ');

    if (!name) continue; // skip invalid entries

    let type: "file" | "directory" | "symlink" = "file";
    if (permissions.startsWith('d')) {
      type = "directory";
    } else if (permissions.startsWith('l')) {
      type = "symlink";
    }

    const isHidden = name.startsWith('.');

    files.push({
      name,
      type,
      size: isNaN(size) ? 0 : size,
      permissions,
      owner,
      group,
      date,
      isHidden,
    });
  }

  return files;
}
