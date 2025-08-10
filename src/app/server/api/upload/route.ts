import { NextRequest } from "next/server";
import { sshManager } from "@/app/server/lib/ssh/SSHManager";
import { getSessionId } from "@/app/server/lib/session";
import { Client } from "ssh2";

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const files = formData.getAll('files') as File[];
        const serverId = formData.get('serverId') as string;
        const destinationPath = formData.get('destinationPath') as string || '.';

        if (!serverId || !files || files.length === 0) {
            return new Response("Missing required fields: serverId and files", { status: 400 });
        }

        const userSessionId = await getSessionId();
        if (!userSessionId) {
            return new Response("Unauthorized", { status: 401 });
        }

        const client = sshManager.getClient(userSessionId, serverId);
        if (!client) {
            return new Response("SSH session not found", { status: 400 });
        }

        const results = await uploadFiles(client, files, destinationPath);

        return Response.json({
            message: "Upload completed",
            results
        });

    } catch (error: any) {
        console.error("[Upload Error]:", error);
        return new Response(`Upload failed: ${error.message}`, { status: 500 });
    }
}

async function uploadFiles(client: Client, files: File[], destinationPath: string) {
  console.log(`[Upload] Starting upload for ${files.length} files to: ${destinationPath}`);
  return new Promise<Array<{ filename: string; success: boolean; error?: string }>>((resolve, reject) => {
    client.sftp((err, sftp) => {
      if (err) {
        console.error("[Upload] SFTP connection failed:", err);
        return reject(err);
      }

      const uploadOneFile = (file: File, remotePath: string) => {
        return new Promise<{ filename: string; success: boolean; error?: string }>(async (res) => {
          try {
            const buffer = Buffer.from(await file.arrayBuffer());
            const ws = sftp.createWriteStream(remotePath);

            let settled = false;
            const finish = (ok: boolean, e?: unknown) => {
              if (settled) return;
              settled = true;
              if (ok) {
                res({ filename: file.name, success: true });
              } else {
                const msg = (e as any)?.message || String(e);
                res({ filename: file.name, success: false, error: msg });
              }
            };

            

            ws.once("finish", () => finish(true));
            ws.once("close", () => finish(true));
            ws.once("error", (e: unknown) => finish(false, e));

            ws.end(buffer);
          } catch (e: unknown) {
            const msg = (e as any)?.message || String(e);
            res({ filename: file.name, success: false, error: msg });
          }
        });
      };

      const results: Array<{ filename: string; success: boolean; error?: string }> = new Array(files.length);
      const concurrency = 2;
      let nextIndex = 0;
      let completed = 0;
      let active = 0;

      const startNext = () => {
        while (active < concurrency && nextIndex < files.length) {
          const current = nextIndex++;
          const file = files[current];
          const remotePath = `${destinationPath}/${file.name}`;
          active++;

          uploadOneFile(file, remotePath)
            .then((r) => {
              results[current] = r;
            })
            .finally(() => {
              active--;
              completed++;
              if (completed === files.length) {
                try { sftp.end(); } catch {}
                resolve(results);
              } else {
                startNext();
              }
            });
        }
      };

      // Edge case: no files (should not happen due to earlier guard)
      if (files.length === 0) {
        try { sftp.end(); } catch {}
        return resolve([]);
      }

      startNext();
    });
  });
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
    return new Response(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
