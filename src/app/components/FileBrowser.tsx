"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import Breadcrumb from "./Breadcrumb";

type FileItem = {
    name: string;
    type: "file" | "directory";
    size: number;
    modified: string;
};

export default function FileBrowser({ sessionId }: { sessionId: string }) {
    const handleDropUpload = async (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (!file) return;
        await uploadFile(file);
    };

    const handleFileInputUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        await uploadFile(file);
    };

    const uploadFile = async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("sessionId", sessionId);
        formData.append("path", path);

        const res = await fetch("/server/api/upload", {
            method: "POST",
            body: formData,
        });

        if (!res.ok) {
            toast.error(await res.text());
            return;
        }

        toast.success("Uploaded.");
        refetch();
    };

    const handleDelete = async (name: string) => {
        const confirmed = confirm(`Delete ${name}?`);
        if (!confirmed) return;

        const res = await fetch("/server/api/delete", {
            method: "POST",
            body: JSON.stringify({ sessionId, path: `${path}/${name}` }),
            headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
            toast.error(await res.text());
            return;
        }

        toast.success("Deleted.");
        refetch();
    };

    const handleRename = async (oldName: string) => {
        const newName = prompt("New name:", oldName);
        if (!newName || newName === oldName) return;

        const res = await fetch("/server/api/rename", {
            method: "POST",
            body: JSON.stringify({
                sessionId,
                oldPath: `${path}/${oldName}`,
                newPath: `${path}/${newName}`,
            }),
            headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
            toast.error(await res.text());
            return;
        }

        toast.success("Renamed.");
        refetch();
    };

    const handleDownload = (name: string) => {
        const url = `/server/api/download?serverId=${sessionId}&path=${encodeURIComponent(
            `${path}/${name}`
        )}`;
        window.open(url, "_blank");
    };

    const [path, setPath] = useState("/");

    const { data, isLoading, isError, refetch } = useQuery<FileItem[]>({
        queryKey: ["fileList", sessionId, path],
        queryFn: async () => {
            const res = await fetch(`/server/api/list?serverId=${sessionId}&path=${encodeURIComponent(path)}`);
            if (!res.ok) throw new Error(await res.text());
            return res.json();
        },
    });

    const handleFolderClick = (name: string) => {
        const newPath = path.endsWith("/")
            ? `${path}${name}`
            : `${path}/${name}`;
        setPath(newPath);
    };

    return (
        <div className="space-y-4">
            <Breadcrumb path={path} onNavigate={setPath} />

            <div className="flex justify-between">
                <h3 className="text-lg font-semibold">Path: {path}</h3>
                <button onClick={() => refetch()} className="text-sm text-blue-500 hover:underline">
                    Refresh
                </button>
            </div>

            {isLoading && <p className="text-gray-500">Loading...</p>}
            {isError && <p className="text-red-500">Failed to load files</p>}
            {data?.length === 0 && <p className="text-gray-400">This folder is empty.</p>}

            <ul className="divide-y border rounded bg-white">
                {data?.map((file) => (
                    <li
                        key={file.name}
                        className="flex items-center justify-between p-3 hover:bg-gray-50"
                    >
                        <span
                            onClick={() => file.type === "directory" && handleFolderClick(file.name)}
                            className="flex gap-2 items-center cursor-pointer"
                        >
                            <span className="text-blue-600">
                                {file.type === "directory" ? "📁" : "📄"}
                            </span>
                            {file.name}
                        </span>

                        <div className="flex gap-2 text-sm text-gray-500">
                            <button onClick={() => handleRename(file.name)} className="hover:text-blue-600">✏️</button>
                            <button onClick={() => handleDownload(file.name)} className="hover:text-green-600">⬇️</button>
                            <button onClick={() => handleDelete(file.name)} className="hover:text-red-600">🗑️</button>
                        </div>
                    </li>
                ))}

            </ul>
            <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDropUpload}
                className="border-dashed border-2 rounded p-4 text-center text-sm text-gray-500 hover:bg-gray-50"
            >
                Drag and drop files to upload, or
                <label className="underline cursor-pointer ml-1">
                    select a file
                    <input type="file" hidden onChange={handleFileInputUpload} />
                </label>
            </div>

        </div>
    );
}
