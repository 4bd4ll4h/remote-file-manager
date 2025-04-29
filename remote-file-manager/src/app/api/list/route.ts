import { NextRequest } from "next/server";
import { sshManager } from "@/app/lib/ssh/SSHManager"; // Import your SSHManager instanc
import { parseLsOutput } from "@/app/utils/parseLs";
import { getSessionId } from "@/app/lib/session";

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
        const client = sshManager.getClient(userSessionId, serverId);
        if (!client) {
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
