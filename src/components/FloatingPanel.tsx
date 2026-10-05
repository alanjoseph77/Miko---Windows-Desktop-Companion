import React, { ReactNode } from 'react';
import { X, ChevronLeft } from 'lucide-react';

interface FloatingPanelProps {
  title: string;
  icon?: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  onBackToMenu?: () => void;
  children: ReactNode;
  className?: string;
  width?: string | number;
}

export const FloatingPanel: React.FC<FloatingPanelProps> = ({
  title,
  icon,
  isOpen,
  onClose,
  onBackToMenu,
  children,
  className = '',
  width = 380,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className={`miko-floating-panel ${className}`}
      style={{ maxWidth: width }}
      role="dialog"
      aria-label={title}
    >
      <div className="miko-panel-header">
        <div className="miko-panel-title">
          {onBackToMenu && (
            <button
              type="button"
              className="miko-panel-back-btn"
              onClick={onBackToMenu}
              title="Back to Menu"
              aria-label="Back to Menu"
            >
              <ChevronLeft size={18} />
            </button>
          )}
          {icon && <span className="miko-panel-icon">{icon}</span>}
          <span>{title}</span>
        </div>
        <button
          type="button"
          className="miko-panel-close-btn"
          onClick={onClose}
          title="Close panel"
          aria-label="Close panel"
        >
          <X size={16} />
        </button>
      </div>

      <div className="miko-panel-content">
        {children}
      </div>
    </div>
  );
};
