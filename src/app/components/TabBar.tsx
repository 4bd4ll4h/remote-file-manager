"use client";

import { useSessionTabs } from "@/app/hooks/useSessionTabs";

export default function TabBar() {
  const { tabs, activeTabId, setActiveTab, closeTab, addTab } = useSessionTabs();

  return (
    <div className="flex items-center gap-1 overflow-x-auto bg-white border-b shadow-sm px-2 py-1">
      {tabs.map((tab,index) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`relative px-4 py-2 rounded-t-md border text-sm whitespace-nowrap truncate
            ${activeTabId === tab.id ? "bg-white border-b-white font-semibold" : "bg-gray-100 hover:bg-gray-200"}`}
        >
          {tab.label}
          {index !=0 && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                closeTab(tab.id);
              }}
              className="ml-2 text-gray-400 hover:text-red-500 absolute right-2 top-1"
            >
              ×
            </span>
          )}
        </button>
      ))}
      <button onClick={addTab} className="px-3 py-2 text-lg font-bold hover:bg-gray-100">
        +
      </button>
    </div>
  );
}
