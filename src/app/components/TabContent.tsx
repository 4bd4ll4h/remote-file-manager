"use client";

import { useSessionTabs } from "@/app/hooks/useSessionTabs";
import ConnectForm from "./ConnectForm";
import FileBrowser from "./FileBrowser"; // to be built

export default function TabContent() {
  const { activeTab } = useSessionTabs();

  return (
    <div className="p-4">
      {activeTab.view === "connect" && <ConnectForm tabId={activeTab.id} />}
      {activeTab.view === "browse" && activeTab.sessionId && (
        <FileBrowser sessionId={activeTab.sessionId} />
      )}
    </div>
  );
}
