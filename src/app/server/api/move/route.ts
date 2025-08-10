import { NextRequest } from "next/server";
import { sshManager } from "@/app/server/lib/ssh/SSHManager";
import { getSessionId } from "@/app/server/lib/session";

export async function POST(req: NextRequest) {
    try {
        const { serverId, sourcePath, destinationPath } = await req.json();

        if (!serverId || !sourcePath || !destinationPath) {
            return new Response("Missing required fields", { status: 400 });
        }

        const userSessionId = await getSessionId();
        if (!userSessionId) return new Response("Unauthorized", { status: 401 });
        const client = sshManager.getClient(userSessionId, serverId);

        if (!client) {
            console.error("[MOVE API] SSH client is null", {
                userSessionId,
                serverId,
                timestamp: new Date().toISOString(),
                sessionsCount: sshManager.count()
            });
            return new Response("SSH session not found", { status: 400 });
        }

        // Use mv command for moving files and directories
        const cmd = `mv "${sourcePath}" "${destinationPath}"`;

        const output = await new Promise<string>((resolve, reject) => {
            client.exec(cmd, (err, stream) => {
                if (err) return reject(err);

                let stderr = "";

                stream
                    .on("close", (code: number) => {
                        if (code === 0) resolve("Moved successfully");
                        else reject(new Error(stderr || "Move operation failed"));
                    })
                    .on("data", () => { }) // Ignore stdout for move
                    .stderr.on("data", (chunk) => {
                        stderr += chunk.toString();
                    });
            });
        });

        return Response.json({ message: "Moved successfully" }, { status: 200 });

    } catch (error: any) {
        console.error("[Move Error]:", error);
        return new Response(`Move failed: ${error.message}`, { status: 500 });
    }
} 