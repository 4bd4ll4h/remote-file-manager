import { NextRequest } from "next/server";
import { sshManager } from "@/app/lib/ssh/SSHManager";
import { getSessionId } from "@/app/lib/session";

export async function DELETE(req: NextRequest) {
    try {
        const { serverId, path, isDir } = await req.json();

        if (!serverId || !path || typeof isDir !== "boolean") {
            return new Response("Missing required fields", { status: 400 });
        }

        const userSessionId = await getSessionId();
        if (!userSessionId) return new Response("Unauthorized", { status: 401 });
        const client = sshManager.getClient(userSessionId, serverId);

        if (!client) {
            return new Response("SSH session not found", { status: 400 });
        }
        const cmd = isDir ? `rm -rf "${path}"` : `rm "${path}"`;

        const output = await new Promise<string>((resolve, reject) => {
            client.exec(cmd, (err, stream) => {
                if (err) return reject(err);

                let stderr = "";

                stream
                    .on("close", (code: number) => {
                        if (code === 0) resolve("Deleted");
                        else reject(new Error(stderr || "Unknown error"));
                    })
                    .on("data", () => { }) // Ignore stdout for delete
                    .stderr.on("data", (chunk) => {
                        stderr += chunk.toString();
                    });
            });
        });

        return Response.json({ message: "Deleted successfully" }, { status: 200 });

    } catch (error: any) {
        console.error("[Delete Error]:", error);
        return new Response(`Delete failed: ${error.message}`, { status: 500 });
    }
}
