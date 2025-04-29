import { NextRequest } from "next/server";
import { sshManager } from "@/app/lib/ssh/SSHManager";
import { getSessionId } from "@/app/lib/session";

export async function POST(req: NextRequest) {

    try {
        const { serverId, oldPath, newPath } = await req.json();

        if (!serverId || !oldPath || !newPath) {
            return new Response("Missing required fields", { status: 400 });
        }

        const userSessionId = await getSessionId();
        if (!userSessionId) return new Response("Unauthorized", { status: 401 });
        const client = sshManager.getClient(userSessionId, serverId);

        if (!client) {
            return new Response("SSH session not found", { status: 400 });
        }

        const cmd = `mv "${oldPath}" "${newPath}"`;

        await new Promise<void>((resolve, reject) => {
            client.exec(cmd, (err, stream) => {
                if (err) return reject(err);

                let stderr = "";

                stream
                    .on("close", (code: number) => {
                        if (code === 0) resolve();
                        else reject(new Error(stderr || "Failed to rename/move"));
                    })
                    .on("data", () => { }) // ignore stdout
                    .stderr.on("data", (chunk) => {
                        stderr += chunk.toString();
                    });
            });
        });
        return Response.json({ message: "Renamed/moved successfully" });


    } catch (error: any) {
        console.error("[Rename Error]:", error);
        return new Response(`Rename failed: ${error.message}`, { status: 500 });
    }
}
