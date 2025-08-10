"use client";

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';
import { cn } from '@/app/lib/utils';

interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface DropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function Dropdown({ options, value, onChange, placeholder = "Select option", className, disabled = false }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const [mounted, setMounted] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement | null>(null);

  const selectedOption = options.find(option => option.value === value);

  // Handle mounting for portal
  useEffect(() => {
    setMounted(true);
    return () => {
      console.log('[Dropdown] Component unmounting, cleaning up portal');
      setMounted(false);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      console.log('[Dropdown] Click detected outside check', {
        isOpen,
        clickTarget: event.target,
        dropdownContains: dropdownRef.current?.contains(event.target as Node),
        portalContains: portalRef.current?.contains(event.target as Node)
      });

      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        // Check if click is inside portal content
        if (portalRef.current && portalRef.current.contains(event.target as Node)) {
          console.log('[Dropdown] Click inside portal content, ignoring');
          return;
        }
        console.log('[Dropdown] Closing dropdown due to outside click');
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      console.log('[Dropdown] Removing click outside listener');
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleButtonClick = () => {
    if (disabled) return;
    
    console.log('[Dropdown] Button clicked', { isOpen, disabled });
    
    if (!isOpen && dropdownRef.current) {
      // Calculate position for portal
      const rect = dropdownRef.current.getBoundingClientRect();
      const position = {
        top: rect.bottom + window.scrollY + 4, // Add small gap
        left: rect.left + window.scrollX,
        width: rect.width
      };
      
      console.log('[Dropdown] Calculating position', {
        rect,
        scrollY: window.scrollY,
        scrollX: window.scrollX,
        finalPosition: position
      });
      
      setDropdownPosition(position);
    }
    
    setIsOpen(!isOpen);
  };

  const renderPortalContent = () => {
    if (!isOpen || !mounted) return null;

    console.log('[Dropdown] Rendering portal content', { 
      position: dropdownPosition,
      optionsCount: options.length 
    });

    return createPortal(
      <div
        ref={portalRef}
        style={{
          position: 'fixed',
          top: `${dropdownPosition.top}px`,
          left: `${dropdownPosition.left}px`,
          minWidth: `${dropdownPosition.width}px`,
          zIndex: 9999,
          pointerEvents: 'auto'
        }}
      >
        <Card 
          variant="glass" 
          className="shadow-lg border border-purple-200/50 dark:border-purple-500/50 whitespace-nowrap"
          style={{
            backdropFilter: 'blur(20px) saturate(180%)',
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          }}
        >
          <div className="py-1">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  console.log('[Dropdown] Option selected', { value: option.value, label: option.label });
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors duration-150 text-slate-700 dark:text-purple-300",
                  value === option.value && "bg-purple-100 dark:bg-purple-800/30 text-purple-700 dark:text-purple-600"
                )}
              >
                <span className="flex items-center gap-2 flex-1">
                  {option.icon}
                  <span>{option.label}</span>
                </span>
                {value === option.value && (
                  <Check size={16} className="text-purple-600 dark:text-purple-400 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </Card>
      </div>,
      document.body
    );
  };

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      <Button
        variant="glass"
        size="sm"
        onClick={handleButtonClick}
        disabled={disabled}
        className="justify-between w-full min-w-[140px]"
        icon={null}
      >
        <span className="flex items-center gap-2">
          {selectedOption?.icon}
          {selectedOption?.label || placeholder}
        </span>
        <ChevronDown 
          size={16} 
          className={cn(
            "transition-transform duration-200 flex-shrink-0",
            isOpen && "rotate-180"
          )} 
        />
      </Button>

      {renderPortalContent()}
    </div>
  );
}