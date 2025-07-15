import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface DropdownItem {
  label: string;
  value: string;
  icon?: React.ComponentType<any>;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
}

interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  className?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  align = 'right',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const alignmentClasses = align === 'left' ? 'left-0' : 'right-0';

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div className={`absolute top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 ${alignmentClasses}`}>
          {items.map((item, index) => {
            const ItemIcon = item.icon;
            
            if (item.href) {
              return (
                <a
                  key={index}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors ${
                    item.disabled ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  onClick={() => {
                    if (!item.disabled) {
                      item.onClick?.();
                      setIsOpen(false);
                    }
                  }}
                >
                  {ItemIcon && <ItemIcon className="h-4 w-4" />}
                  <span>{item.label}</span>
                </a>
              );
            }

            return (
              <button
                key={index}
                className={`flex items-center space-x-3 w-full px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors ${
                  item.disabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                onClick={() => {
                  if (!item.disabled) {
                    item.onClick?.();
                    setIsOpen(false);
                  }
                }}
                disabled={item.disabled}
              >
                {ItemIcon && <ItemIcon className="h-4 w-4" />}
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Dropdown;