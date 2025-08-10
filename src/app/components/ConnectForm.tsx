"use client";

import { useConnect } from "@/app/hooks/useConnect";
import { useSessionTabs } from "@/app/hooks/useSessionTabs";
import { toast } from "sonner";
import { DragEvent } from "react";
import { Card } from "./ui/Card";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { GlassmorphismLayout } from "./ui/GlassmorphismLayout";

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
          path: "/", // Initialize path when transitioning to browse view
        });
        toast.success(`Connected to ${host}`);
      },
      onError: (err: any) => {
        toast.error(err.message || "Failed to connect.");
      },
    });
  };

  return (
    <GlassmorphismLayout variant="content">
      <div className="max-w-xl mx-auto">
        <Card variant="glass" className="space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#F3C623] to-[#ec650a] text-transparent bg-clip-text font-mono">
              Remote File Manager
            </h1>
            <span className="text-2xl font-bold bg-gradient-to-r from-[#F3C623] to-[#ec650a] text-transparent bg-clip-text font-mono typewriter">
              New SSH Connection
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              variant="glass"
              placeholder="Connection name"
            />

            <div className="flex gap-4">
              <div className="w-2/3">
                <Input
                  label="Host / IP"
                  name="host"
                  value={form.host}
                  onChange={handleChange}
                  variant="glass"
                  placeholder="192.168.1.100"
                />
              </div>
              <div className="w-1/3">
                <Input
                  label="Port"
                  name="port"
                  type="number"
                  value={form.port}
                  onChange={handleChange}
                  variant="glass"
                  placeholder="22"
                />
              </div>
            </div>

            <Input
              label="Username"
              name="username"
              value={form.username}
              onChange={handleChange}
              variant="glass"
              placeholder="root"
            />

            {/* Auth tabs */}
            <div className="flex justify-center gap-2 border-b border-gray-200 dark:border-gray-700 mt-2">
              {["password", "ssh"].map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => handleAuthSwitch(method as "password" | "ssh")}
                  className={`px-4 py-2 text-sm border-b-2 transition-colors duration-200 ${
                    form.authMethod === method
                      ? "border-purple-500 font-semibold text-purple-600 dark:text-purple-400"
                      : "border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  {method === "password" ? "Password" : "SSH Key"}
                </button>
              ))}
            </div>

            {form.authMethod === "password" ? (
              <Input
                label="Password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                variant="glass"
                placeholder="Enter password"
              />
            ) : (
              <>
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  className="border-dashed border-2 border-purple-300 dark:border-purple-500 rounded-lg p-4 text-sm text-gray-500 dark:text-gray-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors duration-200"
                >
                  Drag and drop your private key file here, or paste below:
                </div>

                <textarea
                  name="privateKey"
                  rows={4}
                  placeholder="Paste your private key here..."
                  value={form.privateKey}
                  onChange={handleChange}
                  className="w-full border border-purple-300/40 dark:border-purple-500/40 rounded-md px-3 py-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-[10px] focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/60 dark:focus:border-purple-400/60 font-mono text-sm transition-all duration-200"
                />

                <Input
                  label="Passphrase (if key is encrypted)"
                  name="passphrase"
                  type="password"
                  value={form.passphrase}
                  onChange={handleChange}
                  variant="glass"
                  placeholder="Enter passphrase"
                />
              </>
            )}

            <Button
              type="submit"
              variant="primary"
              disabled={isPending}
              className="w-full"
            >
              {isPending ? "Connecting..." : "Connect"}
            </Button>
          </form>
        </Card>
      </div>
    </GlassmorphismLayout>
  );
}
