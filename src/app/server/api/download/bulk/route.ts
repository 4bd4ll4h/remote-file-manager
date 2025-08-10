import { NextRequest } from "next/server";
import { sshManager } from "@/app/server/lib/ssh/SSHManager";
import { getSessionId } from "@/app/server/lib/session";
import { SFTPWrapper, Stats } from "ssh2";
import archiver from "archiver";
import { PassThrough, Readable } from "stream";

export const dynamic = "force-dynamic";

type BulkItem = { path: string };

export async function POST(req: NextRequest) {
  try {
    const { serverId, items, zipName } = await req.json() as {
      serverId?: string;
      items?: BulkItem[];
      zipName?: string;
    };

    if (!serverId || !Array.isArray(items) || items.length === 0) {
      return new Response("Missing serverId or items", { status: 400 });
    }

    const userSessionId = await getSessionId();
    if (!userSessionId) return new Response("Unauthorized", { status: 401 });

    const client = sshManager.getClient(userSessionId, serverId);
    if (!client) return new Response("SSH connection not found", { status: 400 });

    const sftp: SFTPWrapper = await new Promise<any>((resolve, reject) => {
      client.sftp((err, sftp) => {
        if (err) reject(err);
        else resolve(sftp);
      });
    });

    const archive = archiver("zip", { zlib: { level: 9 } });
    const pass = new PassThrough();
    archive.on("error", (err) => {
      pass.destroy(err);
    });
    archive.pipe(pass);

    // helpers
    const stat = (path: string) => new Promise<Stats>((resolve, reject) => {
      sftp.stat(path, (err, stats) => {
        if (err) reject(err);
        else resolve(stats as unknown as Stats);
      });
    });

    const readdir = (path: string) => new Promise<Array<{ filename: string }>>((resolve, reject) => {
      sftp.readdir(path, (err, list) => {
        if (err) reject(err);
        else resolve(list.map((e: any) => ({ filename: e.filename })));
      });
    });

    async function addPathToArchive(remotePath: string, baseName: string): Promise<void> {
      const stats = await stat(remotePath);
      const isDir = (stats as any).isDirectory?.() || false;
      if (!isDir) {
        archive.append(sftp.createReadStream(remotePath), { name: baseName });
        return;
      }

      // ensure directory entry exists (for empty dirs)
      archive.append(Buffer.alloc(0), { name: baseName.endsWith("/") ? baseName : baseName + "/" });

      const entries = await readdir(remotePath);
      for (const entry of entries) {
        const childRemote = remotePath.replace(/\/$/, "") + "/" + entry.filename;
        const childBase = (baseName.endsWith("/") ? baseName : baseName + "/") + entry.filename;
        await addPathToArchive(childRemote, childBase);
      }
    }

    // Queue all selected items
    for (const item of items) {
      const baseName = item.path.split("/").pop() || "item";
      await addPathToArchive(item.path, baseName);
    }

    // finalize archive after queuing
    void archive.finalize();

    const filename = (zipName && zipName.trim()) || "download.zip";
    return new Response(Readable.toWeb(pass) as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("[Bulk Download Error]:", error);
    return new Response(`Bulk download failed: ${error.message}`, { status: 500 });
  }
}

