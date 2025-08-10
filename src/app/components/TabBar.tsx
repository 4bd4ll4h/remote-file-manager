"use client";

import { useSessionTabs } from "@/app/hooks/useSessionTabs";
import { ThemeToggle } from "./ThemeToggle";
import { Circle, Plus, X } from "lucide-react";
import { designTokens, getThemeClasses } from "@/app/lib/design-system";
import { useTheme } from "@/app/hooks/useTheme";
import { GlassmorphismLayout } from "./ui/GlassmorphismLayout";

export default function TabBar() {
  const { tabs, activeTabId, setActiveTab, closeTab, addTab } =
    useSessionTabs();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <GlassmorphismLayout variant="nav">
    <nav className="p-1"> 
      <div className="max-w-full max-h-full relative flex items-center gap-2 p-1">
        <div className="max-w-fit overflow-x-auto flex-1 scrollbar-hide">
          <div className="flex gap-1 m-1">
            {tabs.map((tab, index) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center content-between @container min-w-20 w-48 justify-between relative px-2 py-2 rounded-md
      ${
        activeTabId === tab.id
          ? getThemeClasses(
              isDark,
              'bg-tab dark:bg-tab-dark text-purple-900 dark:text-white transform scale-[1.07] mx-1 border font-semibold dark:shadow-purple-500/30 backdrop-blur-[30px] backdrop-saturate-[200%]',
              'border-purple-600/30',
              'border-purple-500/60'
            )
          : getThemeClasses(
              isDark,
              'hover:scale-102 text-gray-800 dark:text-white border backdrop-blur-[15px] backdrop-saturate-[150%]',
              'bg-white/40 border-pink-300/60 hover:bg-white/10',
              'bg-slate-900/40 border-purple-500/60 hover:bg-black/20'
            )
      } ${designTokens.effects.transitions.default}`}
              >
                <div className="flex items-center gap-1 overflow-hidden">
                <Circle fill={tab.view=='browse'?"green":"red"} size={10} color={tab.view=='browse'?"green":"red"}/>
                <span className="text-sm whitespace-nowrap truncate">
                  {tab.label}
                </span>
                </div>
                {tabs.length > 1 && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(tab.id);
                    }}
                    className={`p-1 text-sm hover:bg-gray-600/10 dark:hover:bg-gray-500/50 transition-colors cursor-pointer rounded-[.200rem] ${
                      activeTabId !== tab.id ? "[@container(max-width:5rem)]:hidden " : ""
                    } ${getThemeClasses(
                      isDark,
                      'hover:text-purple-900 hover:dark:text-white',
                      'text-gray-600',
                      'text-white/60'
                    )}`}
                  >
                    <X size={12} />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={addTab}
          className={getThemeClasses(
            isDark,
            'ml-2 px-3 py-2 rounded-lg border backdrop-blur-[20px] backdrop-saturate-[180%] hover:scale-110 text-md transition-all duration-300',
            'text-purple-800 hover:text-purple-900 border-pink-300/30 bg-pink-300/30',
            'text-purple-200 hover:text-white border-purple-500/30 bg-purple-500/30'
          )}
        >
          <Plus size={18} />
        </button>
      </div>
    </nav>
    </GlassmorphismLayout>
  );
}
