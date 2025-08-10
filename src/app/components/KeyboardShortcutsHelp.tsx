"use client";

import { useState } from "react";
import { HelpCircle, X } from "lucide-react";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";
import { ThemeToggle } from "./ThemeToggle";

export default function KeyboardShortcutsHelp() {
  const [isOpen, setIsOpen] = useState(false);

  const shortcuts = [
    { key: "Ctrl+A", description: "Select all files" },
    { key: "Escape", description: "Deselect all files" },
    { key: "Ctrl+C", description: "Copy selected files" },
    { key: "Ctrl+V", description: "Paste files from clipboard" },
    { key: "Delete/Backspace", description: "Delete selected files" },
    { key: "F5 / Ctrl+R", description: "Refresh file list" },
    { key: "Shift+Click", description: "Select range of files" },
    { key: "Ctrl+Click", description: "Toggle individual file selection" },
  ];

  if (!isOpen) {
    return (
      <div className="flex flex-col gap-2 justify-between items-center fixed bottom-4 right-4 z-50">
      <Button
        variant="glass"
        size="sm"
        onClick={() => setIsOpen(true)}
        icon={<HelpCircle size={16} />}
      >
        Shortcuts 
      </Button>
       <ThemeToggle />
       </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card variant="glass" className="max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Keyboard Shortcuts
          </h3>
          <Button
            variant="glass"
            size="sm"
            onClick={() => setIsOpen(false)}
            icon={<X size={16} />}
            className="p-1"
          >
            <span className="sr-only">Close</span>
          </Button>
        </div>
        
        <div className="space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex justify-between items-center">
              <kbd className="px-2 py-1 text-sm font-mono bg-gray-100 dark:bg-gray-700 rounded border">
                {shortcut.key}
              </kbd>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {shortcut.description}
              </span>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Note: Use Cmd instead of Ctrl on macOS
          </p>
        </div>
      </Card>
    </div>
  );
} 