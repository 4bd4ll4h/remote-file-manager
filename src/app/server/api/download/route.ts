import { NextRequest } from "next/server";
import { sshManager } from "@/app/server/lib/ssh/SSHManager";
import { SFTPWrapper } from "ssh2";
import { Readable } from "stream";
import { getSessionId } from "@/app/server/lib/session";



export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const serverId = searchParams.get("serverId");
        const remotePath = searchParams.get("path");

        if (!serverId || !remotePath) {
            return new Response("Missing serverId or path", { status: 400 });
        }

        const userSessionId = await getSessionId();
        if (!userSessionId) return new Response("Unauthorized", { status: 401 });
        const client = sshManager.getClient(userSessionId, serverId);
        if (!client) {
            return new Response("SSH connection not found", { status: 400 });
        }

        const sftp: SFTPWrapper = await new Promise<any>((resolve, reject) => {
            client.sftp((err, sftp) => {
                if (err) reject(err);
                else resolve(sftp);
            });
        });

        const remoteReadStream = sftp.createReadStream(remotePath);
        const filename = remotePath.split("/").pop() || "downloaded_file";

        return new Response(Readable.toWeb(remoteReadStream) as unknown as BodyInit, {
            status: 200,
            headers: {
                "Content-Type": "application/octet-stream",
                "Content-Disposition": `attachment; filename="${filename}"`,
            },
        });
    } catch (error: any) {
        console.error("[Download Error]:", error);
        return new Response(`Download failed: ${error.message}`, { status: 500 });
    }
}