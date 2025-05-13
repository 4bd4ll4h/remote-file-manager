import { NextRequest } from "next/server";
import { sshManager } from "@/app/server/lib/ssh/SSHManager";
import formidable from "formidable";
import { createReadStream } from "fs";
import { promisify } from "util";
import { getSessionId } from "@/app/server/lib/session";

export const config = {
    api: {
        bodyParser: false, // Important: we will parse manually
    },
};

export async function POST(req: NextRequest) {
    try {
        const form = formidable({ multiples: false });

        const formData = await new Promise<any>((resolve, reject) => {
            form.parse(req as any, (err, fields, files) => {
                if (err) reject(err);
                else resolve({ fields, files });
            });
        });

        const { fields, files } = formData;

        const serverId = fields.serverId?.[0];
        const remotePath = fields.path?.[0];
        const file = files.file?.[0];

        if (!serverId || !remotePath || !file) {
            return new Response("Missing fields", { status: 400 });
        }

        const userSessionId = await getSessionId();
        if (!userSessionId) return new Response("Unauthorized", { status: 401 });
        const client = sshManager.getClient(userSessionId, serverId);

        if (!client) {
            return new Response("SSH session not found", { status: 400 });
        }
        const sftp = await new Promise<any>((resolve, reject) => {
            client.sftp((err, sftp) => {
                if (err) reject(err);
                else resolve(sftp);
            });
        });
        const fileName = file.originalFilename || "uploaded_file";
        const remoteFullPath = remotePath.endsWith('/')
            ? `${remotePath}${fileName}`
            : `${remotePath}/${fileName}`;

        const fileStream = createReadStream(file.filepath); // Local temporary upload

        await new Promise<void>((resolve, reject) => {
            const remoteWriteStream = sftp.createWriteStream(remoteFullPath);

            fileStream.pipe(remoteWriteStream)
                .on('close', resolve)
                .on('error', reject);
        });

        return new Response("File uploaded successfully", { status: 200 });


    } catch (error: any) {
        console.error("[Upload Error]:", error);
        return new Response(`Upload failed: ${error.message}`, { status: 500 });
    }
}
