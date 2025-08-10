"use client";

import { useSessionTabs } from "@/app/hooks/useSessionTabs";
import ConnectForm from "@/app/components/ConnectForm";
import FileBrowser from "@/app/components/FileBrowser"; 
import KeyboardShortcutsHelp from "./KeyboardShortcutsHelp";
import { GlassmorphismLayout } from "./ui/GlassmorphismLayout";

export default function TabContent() {
  const { activeTab } = useSessionTabs();

  return (
    <GlassmorphismLayout variant="full">
      {activeTab.view === "connect" &&  <ConnectForm tabId={activeTab.id} />}
      {activeTab.view === "browse" && activeTab.sessionId && (
        <FileBrowser sessionId={activeTab.sessionId} />
      )}
      <KeyboardShortcutsHelp />
    </GlassmorphismLayout>
  );
}
