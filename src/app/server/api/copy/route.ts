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
            console.error("[COPY API] SSH client is null", {
                userSessionId,
                serverId,
                timestamp: new Date().toISOString(),
                sessionsCount: sshManager.count()
            });
            return new Response("SSH session not found", { status: 400 });
        }

        // Use cp command with -r flag for recursive copying (handles both files and directories)
        const cmd = `cp -r "${sourcePath}" "${destinationPath}"`;

        const output = await new Promise<string>((resolve, reject) => {
            client.exec(cmd, (err, stream) => {
                if (err) return reject(err);

                let stderr = "";

                stream
                    .on("close", (code: number) => {
                        if (code === 0) resolve("Copied successfully");
                        else reject(new Error(stderr || "Copy operation failed"));
                    })
                    .on("data", () => { }) // Ignore stdout for copy
                    .stderr.on("data", (chunk) => {
                        stderr += chunk.toString();
                    });
            });
        });

        return Response.json({ message: "Copied successfully" }, { status: 200 });

    } catch (error: any) {
        console.error("[Copy Error]:", error);
        return new Response(`Copy failed: ${error.message}`, { status: 500 });
    }
} 