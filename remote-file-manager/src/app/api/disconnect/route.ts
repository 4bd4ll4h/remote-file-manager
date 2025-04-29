import { NextRequest } from "next/server";
import { sshManager } from "@/app/lib/ssh/SSHManager";
import { getSessionId } from "@/app/lib/session";

export async function POST(req: NextRequest) {
  try {
    const { serverId } = await req.json();

    if (!serverId) {
      return new Response("Missing serverId", { status: 400 });
    }

      const userSessionId = await getSessionId();
            if (!userSessionId) return new Response("Unauthorized", { status: 401 });
    const client = sshManager.getClient(userSessionId, serverId);

    if (!client) {
      return new Response("No active connection found", { status: 400 });
    }

    sshManager.disconnect(userSessionId, serverId);

    return Response.json({ message: "Disconnected successfully" });
  } catch (error: any) {
    console.error("[Disconnect Error]:", error);
    return new Response(`Disconnect failed: ${error.message}`, { status: 500 });
  }
}
