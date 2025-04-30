"use client";

import { useState } from "react";
import { useConnect } from "@/frontend/hooks/useConnect";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function ConnectForm() {
  const router = useRouter();
  const { mutate, isPending } = useConnect();

  const [form, setForm] = useState({
    host: "",
    port: 22,
    username: "",
    password: "",
    privateKey: "",
    passphrase: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: name === "port" ? Number(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.host || !form.username || (!form.password && !form.privateKey)) {
      toast.error("Host, username, and password or private key are required");
      return;
    }

    mutate(form, {
      onSuccess: () => {
        toast.success("Connected successfully!");
        router.push("/browse"); // default path — can redirect to first folder
      },
      onError: (err: any) => {
        toast.error(err.message);
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-6 bg-white border rounded shadow space-y-4">
      <h2 className="text-xl font-semibold text-center">Connect to Remote Server</h2>

      <div>
        <label className="block text-sm font-medium">Host / IP</label>
        <input name="host" value={form.host} onChange={handleChange} className="input" required />
      </div>

      <div>
        <label className="block text-sm font-medium">Port</label>
        <input name="port" type="number" value={form.port} onChange={handleChange} className="input" />
      </div>

      <div>
        <label className="block text-sm font-medium">Username</label>
        <input name="username" value={form.username} onChange={handleChange} className="input" required />
      </div>

      <hr className="my-2" />
      <p className="text-xs text-gray-500">Auth method: Password or Private Key required</p>

      <div>
        <label className="block text-sm font-medium">Password</label>
        <input name="password" type="password" value={form.password} onChange={handleChange} className="input" />
      </div>

      <div>
        <label className="block text-sm font-medium">Private Key</label>
        <textarea name="privateKey" rows={3} value={form.privateKey} onChange={handleChange} className="input" />
      </div>

      <div>
        <label className="block text-sm font-medium">Passphrase (if key encrypted)</label>
        <input name="passphrase" type="password" value={form.passphrase} onChange={handleChange} className="input" />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isPending ? "Connecting..." : "Connect"}
      </button>
    </form>
  );
}
