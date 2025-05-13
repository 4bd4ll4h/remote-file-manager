"use client";

import { useConnect } from "@/app/hooks/useConnect";
import { useSessionTabs } from "@/app/hooks/useSessionTabs";
import { toast } from "sonner";
import { DragEvent } from "react";

export default function ConnectForm({ tabId }: { tabId: string }) {
  const { mutate, isPending } = useConnect();
  const { activeTab, updateTab } = useSessionTabs();

  const form = activeTab.formState || {
    name: "",
    host: "",
    port: 22,
    username: "",
    password: "",
    privateKey: "",
    passphrase: "",
    authMethod: "password",
  };

  const updateField = (name: string, value: string | number) => {
    updateTab(tabId, {
      formState: { ...form, [name]: value },
    });
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    updateField(name, name === "port" ? Number(value) : value);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      updateField("privateKey", e.target?.result as string);
    };
    reader.readAsText(file);
  };

  const handleAuthSwitch = (method: "password" | "ssh") => {
    updateField("authMethod", method);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const { name, host, username, password, privateKey, port, authMethod } = form;

    if (!host || !username || !name) {
      toast.error("Name, host, and username are required.");
      return;
    }

    if (authMethod === "password" && !password) {
      toast.error("Password is required.");
      return;
    }

    if (authMethod === "ssh" && !privateKey) {
      toast.error("Private key is required.");
      return;
    }

    mutate(form, {
      onSuccess: (res) => {
        const sessionId = res.serverId || `${host}_${port}_${username}`;
        updateTab(tabId, {
          label: name || host,
          view: "browse",
          sessionId,
        });
        toast.success(`Connected to ${host}`);
      },
      onError: (err: any) => {
        toast.error(err.message || "Failed to connect.");
      },
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-xl mx-auto p-6 bg-white space-y-5"
    >
      <div className="blink">
      <h1 className="text-3xl  font-bold bg-gradient-to-r from-[#F3C623]  to-[#ec650a] text-transparent bg-clip-text font-mono  ">Remote File Manager</h1>
      <span className="text-3xl  font-bold bg-gradient-to-r from-[#F3C623]  to-[#ec650a] text-transparent bg-clip-text font-mono   typewriter">New SSH Connection</span>
      </div>
      <div>
        <label className="block text-sm font-medium">Name</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          className="input"
        />
      </div>

      <div className="flex gap-4">
        <div className="w-2/3">
          <label className="block text-sm font-medium">Host / IP</label>
          <input
            name="host"
            value={form.host}
            onChange={handleChange}
            className="input"
          />
        </div>
        <div className="w-1/3">
          <label className="block text-sm font-medium">Port</label>
          <input
            name="port"
            type="number"
            value={form.port}
            onChange={handleChange}
            className="input"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Username</label>
        <input
          name="username"
          value={form.username}
          onChange={handleChange}
          className="input"
        />
      </div>

      {/* Auth tabs */}
      <div className="flex gap-2 border-b mt-2">
        {["password", "ssh"].map((method) => (
          <button
            key={method}
            type="button"
            onClick={() => handleAuthSwitch(method as "password" | "ssh")}
            className={`px-4 py-2 text-sm border-b-2 transition ${
              form.authMethod === method
                ? "border-blue-500 font-semibold"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {method === "password" ? "Password" : "SSH Key"}
          </button>
        ))}
      </div>

      {form.authMethod === "password" ? (
        <div>
          <label className="block text-sm font-medium">Password</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            className="input"
          />
        </div>
      ) : (
        <>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-dashed border-2 rounded p-4 text-sm text-gray-500 hover:bg-gray-50"
          >
            Drag and drop your private key file here, or paste below:
          </div>

          <textarea
            name="privateKey"
            rows={4}
            placeholder="Paste your private key here..."
            value={form.privateKey}
            onChange={handleChange}
            className="input font-mono"
          />

          <div>
            <label className="block text-sm font-medium">Passphrase (if key is encrypted)</label>
            <input
              name="passphrase"
              type="password"
              value={form.passphrase}
              onChange={handleChange}
              className="input"
            />
          </div>
        </>
      )}

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
