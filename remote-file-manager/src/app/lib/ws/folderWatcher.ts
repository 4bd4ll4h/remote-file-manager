import { sshManager } from "@/app/lib/ssh/SSHManager";
import { parseLsOutput } from "@/app/utils/parseLs";

type WSClient = {
  send: (data: string) => void;
  on: (event: "close", fn: () => void) => void;
};

export function startFolderWatcher(ws: WSClient, userSessionId : string, serverId: string, path: string) {
  const client = sshManager.getClient(userSessionId, serverId);

  if (!client) {
    ws.send(JSON.stringify({ type: "error", message: "SSH session not found" }));
    return;
  }

  let previous: string[] = [];

  const interval = setInterval(async () => {
    try {
      const output = await new Promise<string>((resolve, reject) => {
        client.exec(`ls -la --full-time "${path}"`, (err, stream) => {
          if (err) return reject(err);
          let data = "";
          stream.on("data", (chunk: { toString: () => string; }) => (data += chunk.toString()));
          stream.on("close", () => resolve(data));
        });
      });

      const files = parseLsOutput(output);
      const names = files.map((f) => f.name).sort();

      const added = names.filter((name) => !previous.includes(name));
      const removed = previous.filter((name) => !names.includes(name));

      for (const name of added) {
        ws.send(JSON.stringify({ type: "file_created", name }));
      }
      for (const name of removed) {
        ws.send(JSON.stringify({ type: "file_deleted", name }));
      }

      previous = names;
    } catch (err) {
      ws.send(JSON.stringify({ type: "error", message: (err as Error).message }));
    }
  }, 5000);

  ws.on("close", () => {
    clearInterval(interval);
  });
}
