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
    
    // Parse and clean the date
    const dateStr = `${parts[5]} ${parts[6]} ${parts[7]}`;
    const modified = cleanAndFormatDate(dateStr);
    
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
      modified,
      isHidden,
    });
  }

  return files;
}

// Helper function to clean the date format
function cleanAndFormatDate(dateStr: string): string {
  try {
    // Remove nanoseconds and keep only milliseconds
    // From: "2025-03-06 09:30:38.853026488 +0000"
    // To: "2025-03-06 09:30:38.853 +0000"
    const cleanedDate = dateStr.replace(/(\.\d{3})\d{6}/, '$1');
    
    // Convert to ISO format for better JS compatibility
    const date = new Date(cleanedDate);
    return date.toISOString();
  } catch (error) {
    console.warn('Failed to parse date:', dateStr, error);
    return new Date().toISOString(); // Fallback to current time
  }
}
