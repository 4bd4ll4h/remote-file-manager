import { WebSocketServer } from "ws";
import { startFolderWatcher } from "@/app/server/lib/ws/folderWatcher";

const wss = new WebSocketServer({ port: 3001 });

wss.on("connection", (ws) => {
  console.log("🔌 Client connected");

  ws.send(JSON.stringify({ type: "connected", message: "Ready to watch folders" }));

  ws.on("message", (raw) => {
    try {
      const msg = JSON.parse(raw.toString());
      if (msg.type === "watch") {
        console.log(`📂 Start watching ${msg.path} on ${msg.serverId}`);
        startFolderWatcher(ws,msg.userSessionId, msg.serverId, msg.path);
      }
    } catch (e) {
      ws.send(JSON.stringify({ type: "error", error: "Invalid message format" }));
    }
  });

  ws.on("close", () => {
    console.log("🔌 Client disconnected");
  });
});

console.log("✅ WebSocket server listening on port 3001");
