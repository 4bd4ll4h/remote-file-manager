import { NextRequest } from "next/server";
import { sshManager } from "@/app/server/lib/ssh/SSHManager"; // Import your SSHManager instanc
import { parseLsOutput } from "@/app/server/utils/parseLs";
import { getSessionId } from "@/app/server/lib/session";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const path = searchParams.get("path") || ".";
        const serverId = searchParams.get("serverId");

        if (!serverId) {
            return new Response("Missing serverId", { status: 400 });
        }

        const userSessionId = await getSessionId();
        if (!userSessionId) return new Response("Unauthorized", { status: 401 });
        console.log(userSessionId,":::::",serverId);
        
        const client = sshManager.getClient(userSessionId, serverId);
        console.log("SSH Client:", sshManager.count());
        if (!client) {
            console.error("[LIST API] SSH client is null", {
                userSessionId,
                serverId,
                timestamp: new Date().toISOString(),
                sessionsCount: sshManager.count(),
                debugInfo: sshManager.debug()
            });
            return new Response("Not connected to server", { status: 400 });
        }

        // Execute "ls" command on remote server
        const lsCommand = `ls -la --full-time ${path}`;

        const output = await new Promise<string>((resolve, reject) => {
            client.exec(lsCommand, (err, stream) => {
                if (err) return reject(err);

                let data = "";

                stream.on('data', (chunk: { toString: () => string; }) => {
                    data += chunk.toString();
                    console.log("SSH List Output:", data);
                });


                stream.on('close', () => {
                    resolve(data);
                });

                stream.stderr.on('data', (error) => {
                    reject(new Error(error.toString()));
                });
            });
        });

        const parsedList = parseLsOutput(output);

        return Response.json(parsedList);

    } catch (error: any) {
        console.error("[SSH List Error]:", error);
        return new Response(`SSH list failed: ${error.message}`, { status: 500 });
    }
}
