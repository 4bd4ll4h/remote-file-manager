"use client";

import { createContext, useContext, useState } from "react";

type TabView = "connect" | "browse";

type SSHFormState = {
  name: string;
  host: string;
  port: number;
  username: string;
  password: string;
  privateKey: string;
  passphrase: string;
  authMethod: "password" | "ssh";
};

type SessionTab = {
  id: string;
  label: string;
  view: "connect" | "browse";
  sessionId?: string;
  formState?: SSHFormState;
};
type SessionTabContextType = {
  tabs: SessionTab[];
  activeTabId: string;
  activeTab: SessionTab;
  addTab: () => void;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateTab: (id: string, updates: Partial<SessionTab>) => void;
};

const SessionTabsContext = createContext<SessionTabContextType | null>(null);

export function SessionTabsProvider({ children }: { children: React.ReactNode }) {
  const [tabs, setTabs] = useState<SessionTab[]>([
    { id: "default", label: "New Session", view: "connect" },
  ]);
  const [activeTabId, setActiveTabId] = useState("default");

  const addTab = () => {
    const newId = crypto.randomUUID();
    setTabs((prev) => [...prev, { id: newId, label: "New Session", view: "connect" }]);
    setActiveTabId(newId);
  };

  const closeTab = (id: string) => {
    if (id === "default" && tabs.length === 1) return; // never remove default tab

    setTabs((prev) => prev.filter((tab) => tab.id !== id));

    if (activeTabId === id) {
      const fallback = tabs.find((t) => t.id !== id);
      if (fallback) setActiveTabId(fallback.id);
    }
  };

  const setActiveTab = (id: string) => {
    setActiveTabId(id);
  };

  const updateTab = (id: string, updates: Partial<SessionTab>) => {
    setTabs((prev) =>
      prev.map((tab) => (tab.id === id ? { ...tab, ...updates } : tab))
    );
  };

  const activeTab = tabs.find((t) => t.id === activeTabId)!;

  return (
    <SessionTabsContext.Provider
      value={{ tabs, activeTabId, activeTab, addTab, closeTab, setActiveTab, updateTab }}
    >
      {children}
    </SessionTabsContext.Provider>
  );
}

export function useSessionTabs() {
  const context = useContext(SessionTabsContext);
  if (!context) throw new Error("useSessionTabs must be used inside SessionTabsProvider");
  return context;
}
