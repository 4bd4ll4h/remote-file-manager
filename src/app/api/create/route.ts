import { NextRequest } from "next/server";
import { sshManager } from "@/app/lib/ssh/SSHManager";
import { getSessionId } from "@/app/lib/session";

export async function POST(req: NextRequest) {
    try {
        const { serverId, path, isDir } = await req.json();

        if (!serverId || !path || typeof isDir !== "boolean") {
            return new Response("Missing required fields", { status: 400 });
        }
        const userSessionId = await getSessionId();
        if (!userSessionId) return new Response("Unauthorized", { status: 401 });
        
        // (later from real auth session)
        const client = sshManager.getClient(userSessionId, serverId);

        if (!client) {
            return new Response("SSH session not found", { status: 400 });
        }

        const cmd = isDir ? `mkdir -p "${path}"` : `touch "${path}"`;

        await new Promise<void>((resolve, reject) => {
            client.exec(cmd, (err, stream) => {
                if (err) return reject(err);

                let stderr = "";

                stream
                    .on("close", (code: number) => {
                        if (code === 0) resolve();
                        else reject(new Error(stderr || "Failed to create"));
                    })
                    .on("data", () => { }) // ignore stdout
                    .stderr.on("data", (chunk) => {
                        stderr += chunk.toString();
                    });
            });
        });
        return Response.json({ message: "Created successfully" });

    } catch (error: any) {
        console.error("[Create Error]:", error);
        return new Response(`Create failed: ${error.message}`, { status: 500 });
    }
}
