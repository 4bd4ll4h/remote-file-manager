import { useEffect } from "react";

interface KeyboardShortcutsProps {
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onDelete: () => void;
  onRefresh: () => void;
  hasSelection: boolean;
  hasClipboardItems: boolean;
  isAnyOperationPending: boolean;
}

export function useKeyboardShortcuts({
  onSelectAll,
  onDeselectAll,
  onCopy,
  onPaste,
  onDelete,
  onRefresh,
  hasSelection,
  hasClipboardItems,
  isAnyOperationPending
}: KeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't handle shortcuts if user is typing in an input field
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Don't handle shortcuts if operations are pending
      if (isAnyOperationPending) {
        return;
      }

      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlKey = isMac ? event.metaKey : event.ctrlKey;

      switch (event.key.toLowerCase()) {
        case 'a':
          if (ctrlKey) {
            event.preventDefault();
            onSelectAll();
          }
          break;
        case 'escape':
          event.preventDefault();
          onDeselectAll();
          break;
        case 'c':
          if (ctrlKey && hasSelection) {
            event.preventDefault();
            onCopy();
          }
          break;
        case 'v':
          if (ctrlKey && hasClipboardItems) {
            event.preventDefault();
            onPaste();
          }
          break;
        case 'delete':
        case 'backspace':
          if (hasSelection) {
            event.preventDefault();
            onDelete();
          }
          break;
        case 'f5':
          event.preventDefault();
          onRefresh();
          break;
        case 'r':
          if (ctrlKey) {
            event.preventDefault();
            onRefresh();
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    onSelectAll,
    onDeselectAll,
    onCopy,
    onPaste,
    onDelete,
    onRefresh,
    hasSelection,
    hasClipboardItems,
    isAnyOperationPending
  ]);
} 