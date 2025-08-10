"use client";

import { useState, useEffect } from 'react';
import { List, Grid, Table, Eye, EyeOff, Search, ArrowUpDown } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Dropdown } from './ui/Dropdown';

export type ViewMode = 'list' | 'grid' | 'details';
export type SortField = 'name' | 'size' | 'date' | 'type';
export type SortDirection = 'asc' | 'desc';

interface FileToolbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  sortBy: SortField;
  sortDirection: SortDirection;
  onSortChange: (field: SortField, direction: SortDirection) => void;
  filterText: string;
  onFilterChange: (text: string) => void;
  showHiddenFiles: boolean;
  onToggleHiddenFiles: () => void;
  disabled?: boolean;
}

const viewModeOptions = [
  { value: 'list', label: 'List View', icon: <List size={16} /> },
  { value: 'grid', label: 'Grid View', icon: <Grid size={16} /> },
  { value: 'details', label: 'Details View', icon: <Table size={16} /> },
];

const sortFieldOptions = [
  { value: 'name', label: 'Name' },
  { value: 'size', label: 'Size' },
  { value: 'date', label: 'Date Modified' },
  { value: 'type', label: 'Type' },
];

export default function FileToolbar({
  viewMode,
  onViewModeChange,
  sortBy,
  sortDirection,
  onSortChange,
  filterText,
  onFilterChange,
  showHiddenFiles,
  onToggleHiddenFiles,
  disabled = false
}: FileToolbarProps) {
  const [localFilterText, setLocalFilterText] = useState(filterText);

  // Debounce filter input
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange(localFilterText);
    }, 300);

    return () => clearTimeout(timer);
  }, [localFilterText, onFilterChange]);

  const handleSortChange = (value: string) => {
    const [field, direction] = value.split('-') as [SortField, SortDirection];
    onSortChange(field, direction);
  };

  const currentSortValue = `${sortBy}-${sortDirection}`;

  const sortOptions = sortFieldOptions.flatMap(field => [
    { value: `${field.value}-asc`, label: `${field.label} (A-Z)`, icon: <ArrowUpDown size={16} /> },
    { value: `${field.value}-desc`, label: `${field.label} (Z-A)`, icon: <ArrowUpDown size={16} /> },
  ]);

  return (
    <div className="flex items-center gap-4 p-4 bg-white/30 dark:bg-slate-800/30 rounded-lg border border-purple-200/50 dark:border-purple-500/50 backdrop-blur-[10px]">
      {/* View Mode Dropdown */}
      <Dropdown
        options={viewModeOptions}
        value={viewMode}
        onChange={(value) => onViewModeChange(value as ViewMode)}
        placeholder="Select View"
        disabled={disabled}
      />

      {/* Sort Dropdown */}
      <Dropdown
        options={sortOptions}
        value={currentSortValue}
        onChange={handleSortChange}
        placeholder="Sort by"
        disabled={disabled}
      />

      {/* Filter Input */}
      <div className="flex-1 max-w-md">
        <Input
          placeholder="Filter files..."
          value={localFilterText}
          onChange={(e) => setLocalFilterText(e.target.value)}
          variant="glass"
          className="w-full"
          disabled={disabled}
        />
      </div>

      {/* Hidden Files Toggle */}
      <Button
        variant="glass"
        size="sm"
        onClick={onToggleHiddenFiles}
        disabled={disabled}
        icon={showHiddenFiles ? <Eye size={16} /> : <EyeOff size={16} />}
        className="min-w-[40px]"
      >
        <span className="sr-only">
          {showHiddenFiles ? 'Hide hidden files' : 'Show hidden files'}
        </span>
      </Button>
    </div>
  );
} 