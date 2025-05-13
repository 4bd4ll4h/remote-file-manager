import { NextRequest } from "next/server"; // Import NextRequest for type safet
import { sshManager } from "@/app/server/lib/ssh/SSHManager"; // Import your SSHManager instance
import { randomUUID } from "crypto"; // For generating IDs
import { createSessionId, getSessionId } from "@/app/server/lib/session";

// We assume this type is shared in /types/
interface ConnectPayload {
    host: string;
    port?: number;
    username: string;
    password?: string;
    privateKey?: string;
    passphrase?: string;
}

// Helper: parse body safely
async function parseBody(req: NextRequest): Promise<ConnectPayload> {
    const body = await req.json();
    return {
        host: body.host,
        port: body.port ?? 22,
        username: body.username,
        password: body.password,
        privateKey: body.privateKey,
        passphrase: body.passphrase // optional
    };
}

export async function POST(req: NextRequest) {
    try {
        const { host, port, username, password, privateKey, passphrase } = await parseBody(req);

        if (!host || !username || (!password && !privateKey)) {
            return new Response("Missing required fields", { status: 400 });
        }

        // Generate a unique serverId if not provided
        const finalServerId = randomUUID().toString(); // Use randomUUID for unique server ID

        // For now, fake userSessionId (later: real auth system)
        let userSessionId = await getSessionId();
        if (!userSessionId) {
            userSessionId = await createSessionId();
        }

        const connectOptions: any = {
            host,
            port,
            username,
        };

        // Auth method
        if (privateKey) {
            connectOptions.privateKey = privateKey;
            if (passphrase) {
                connectOptions.passphrase = passphrase;
            }
        } else {
            connectOptions.password = password;
        }

        // Start connecting
        const client = sshManager.connect(userSessionId, finalServerId, connectOptions);

        // We wait until 'ready' event
        await new Promise((resolve, reject) => {
            (client as any).on('ready', resolve);
            client.on('error', reject);
        });
        return Response.json({ message: "Connected successfully", serverId: finalServerId }, { status: 200 });

    } catch (error: any) {
        console.error("[SSH Connect Error]:", error);
        return new Response(`SSH connection failed: ${error.message}`, { status: 500 });
    }
}
