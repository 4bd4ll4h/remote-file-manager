import { NextRequest } from "next/server";
import { sshManager } from "@/app/server/lib/ssh/SSHManager";
import { getSessionId } from "@/app/server/lib/session";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const path = searchParams.get("path");
        const serverId = searchParams.get("serverId");

        if (!serverId || !path) {
            return new Response("Missing serverId or path", { status: 400 });
        }

        const userSessionId = await getSessionId();
        if (!userSessionId) return new Response("Unauthorized", { status: 401 });
        
        const client = sshManager.getClient(userSessionId, serverId);

        if (!client) {
            return new Response("SSH session not found", { status: 400 });
        }

        // Use du command to get directory size
        const duCommand = `du -sb "${path}" 2>/dev/null || echo "0"`;

        const output = await new Promise<string>((resolve, reject) => {
            client.exec(duCommand, (err, stream) => {
                if (err) {
                    // If du fails, return 0 size
                    resolve("0");
                    return;
                }

                let data = "";
                stream.on('data', (chunk: { toString: () => string; }) => {
                    data += chunk.toString();
                });

                stream.on('close', () => {
                    resolve(data.trim());
                });

                stream.stderr.on('data', () => {
                    // Ignore stderr, just resolve with 0
                    resolve("0");
                });
            });
        });

        // Parse du output (format: "size\tpath")
        const sizeMatch = output.match(/^(\d+)/);
        const size = sizeMatch ? parseInt(sizeMatch[1], 10) : 0;

        // Get file count using find command
        const findCommand = `find "${path}" -type f 2>/dev/null | wc -l`;
        
        const fileCountOutput = await new Promise<string>((resolve, reject) => {
            client.exec(findCommand, (err, stream) => {
                if (err) {
                    resolve("0");
                    return;
                }

                let data = "";
                stream.on('data', (chunk: { toString: () => string; }) => {
                    data += chunk.toString();
                });

                stream.on('close', () => {
                    resolve(data.trim());
                });

                stream.stderr.on('data', () => {
                    resolve("0");
                });
            });
        });

        const fileCount = parseInt(fileCountOutput, 10) || 0;

        return Response.json({
            size,
            fileCount,
            path
        });

    } catch (error: any) {
        console.error("[Directory Size Error]:", error);
        // Return 0 size on any error
        return Response.json({
            size: 0,
            fileCount: 0,
            path: ""
        });
    }
} 