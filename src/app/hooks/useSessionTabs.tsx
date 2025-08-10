"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { storage, STORAGE_KEYS } from "@/app/lib/storage";

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
  path?: string;
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
  const [tabs, setTabs] = useState<SessionTab[]>(() => {
    return JSON.parse(storage.get(STORAGE_KEYS.TABS, JSON.stringify([
      {
        id: "default",
        label: "New Session",
        view: "connect" as const,
        path: "/"
      }
    ])));
  });

  const [activeTabId, setActiveTabId] = useState<string>(() => {
    return storage.get(STORAGE_KEYS.ACTIVE_TAB, "default");
  });

  // Persist tabs to localStorage
  useEffect(() => {
    storage.set(STORAGE_KEYS.TABS, tabs);
  }, [tabs]);

  // Persist active tab to localStorage
  useEffect(() => {
    storage.set(STORAGE_KEYS.ACTIVE_TAB, activeTabId);
  }, [activeTabId]);

  const addTab = () => {
    const newId = crypto.randomUUID();
    const newTab = {
      id: newId,
      label: "New Session",
      view: "connect" as const,
      path: "/" // Initialize with root path
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(newId);
  };

  const closeTab = (id: string) => {
    if (tabs.length === 1) return; // Don't close the last tab

    const closedTabIndex = tabs.findIndex((tab) => tab.id === id);
    if (closedTabIndex === -1) return; // Tab not found

    const newTabs = tabs.filter((tab) => tab.id !== id);

    // If the closed tab was the active one, determine the next active tab
    if (activeTabId === id) {
      // Select the tab that took the closed tab's place, or the new last tab.
      const newActiveTab = newTabs[closedTabIndex] ?? newTabs[closedTabIndex - 1];
      if (newActiveTab) {
        setActiveTabId(newActiveTab.id);
      } else {
        setActiveTabId(newTabs[0].id); // Fallback to first tab if no other tabs left
      }
    }
    setTabs(newTabs);
  };

  const setActiveTab = (id: string) => {
    setActiveTabId(id);
  };

  const updateTab = (id: string, updates: Partial<SessionTab>) => {
    setTabs((prev) =>
      prev.map((tab) => (tab.id === id ? { ...tab, ...updates } : tab))
    );
  };

  const activeTab = tabs.find((t) => t.id === activeTabId) || {
    id: "default",
    label: "New Session",
    view: "connect" as const,
    path: "/"
  };

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
