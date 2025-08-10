import { WebSocketServer } from "ws";
import { startFolderWatcher } from "@/app/server/lib/ws/folderWatcher";

let wss: WebSocketServer | null = null;

// Only create WebSocket server if not already running
if (!wss) {
  try {
    wss = new WebSocketServer({ port: 3001 });

    wss.on("connection", (ws) => {
      console.log("🔌 Client connected");

      ws.send(JSON.stringify({ type: "connected", message: "Ready to watch folders" }));

      ws.on("message", (raw) => {
        try {
          const msg = JSON.parse(raw.toString());
          if (msg.type === "watch") {
            console.log(`📂 Start watching ${msg.path} on ${msg.serverId}`);
            startFolderWatcher(ws, msg.userSessionId, msg.serverId, msg.path);
          }
        } catch (e) {
          ws.send(JSON.stringify({ type: "error", error: "Invalid message format" }));
        }
      });

      ws.on("close", () => {
        console.log("🔌 Client disconnected");
      });
    });

    wss.on("error", (error) => {
      if (error.message.includes('EADDRINUSE')) {
        console.log("⚠️ WebSocket server already running on port 3001");
      } else {
        console.error("❌ WebSocket server error:", error);
      }
    });

    console.log("✅ WebSocket server listening on port 3001");
  } catch (error) {
    console.log("⚠️ WebSocket server initialization skipped (likely during build)");
  }
}

// Export a dummy function to satisfy Next.js API route requirements
export async function GET() {
  return new Response("WebSocket server is running", { status: 200 });
}
