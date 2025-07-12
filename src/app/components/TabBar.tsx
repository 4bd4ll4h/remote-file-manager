"use client";

import { useSessionTabs } from "@/app/hooks/useSessionTabs";
import { ThemeToggle } from "./ThemeToggle";

export default function TabBar() {
  const { tabs, activeTabId, setActiveTab, closeTab, addTab } =
    useSessionTabs();

  return (
    <nav className="relative flex items-center gap-2 backdrop-blur-sm bg-white/20 p-1 overflow-hidden">
      <div className="max-w-fit overflow-x-auto flex-1 scrollbar-hide">
        <div className="flex  gap-1 ">
          {tabs.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`@container min-w-20 w-48 flex justify-between relative px-2 py-2 rounded-md border 
            ${activeTabId === tab.id ? "bg-white border-b-white font-semibold" : "bg-gray-100 hover:bg-gray-200"}`}
            >
              <span className="text-sm whitespace-nowrap truncate">{tab.label}</span>
              {tabs.length > 1 && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                  className={`ml-2 px-2  text-sm text-white hover:text-red-500  transition-colors cursor-pointer hover:bg-gray-300 rounded-md ${activeTabId !== tab.id && "[@container(max-width:5rem)]:hidden"}`}
                >
                  ×
                </span>
              )}
            </button>
          ))}
         
          
        </div>
         
      </div>
      <button
            onClick={addTab}
            className=" ml-2 px-3 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 text-sm transition"
          >
            +
          </button>
        <ThemeToggle />
        
    </nav>
  );
}
