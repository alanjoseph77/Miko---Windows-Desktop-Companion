import React from 'react';
import { Target, CheckSquare, Settings, Smile, Bell, X, EyeOff } from 'lucide-react';
import { ActivePanel } from '../types';

interface CompanionMenuProps {
  isOpen: boolean;
  onSelectPanel: (panel: ActivePanel) => void;
  onCloseMenu: () => void;
  onHideToTray: () => void;
  onExit: () => void;
}

export const CompanionMenu: React.FC<CompanionMenuProps> = ({
  isOpen,
  onSelectPanel,
  onCloseMenu,
  onHideToTray,
  onExit,
}) => {
  if (!isOpen) return null;

  const menuItems = [
    { id: 'reminders' as const, label: 'Reminders', icon: <Bell size={16} />, emoji: '⏰' },
    { id: 'focus' as const, label: 'Focus & Timer', icon: <Target size={16} />, emoji: '🎯' },
    { id: 'tasks' as const, label: 'Tasks', icon: <CheckSquare size={16} />, emoji: '📝' },
    { id: 'mood' as const, label: 'Mood', icon: <Smile size={16} />, emoji: '😊' },
    { id: 'settings' as const, label: 'Settings', icon: <Settings size={16} />, emoji: '⚙' },
  ];

  return (
    <div className="miko-menu-overlay" onClick={onCloseMenu}>
      <div className="miko-menu-container" onClick={(e) => e.stopPropagation()}>
        <div className="miko-menu-header">
          <div className="miko-menu-title">
            <span className="miko-status-dot online" />
            <span>Miko Menu</span>
          </div>
          <button
            type="button"
            className="miko-menu-close"
            onClick={(e) => {
              e.stopPropagation();
              onCloseMenu();
            }}
            title="Close menu"
          >
            <X size={14} />
          </button>
        </div>

        <div className="miko-menu-grid">
          {menuItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className="miko-menu-item"
              onClick={(e) => {
                e.stopPropagation();
                onSelectPanel(item.id);
              }}
            >
              <span className="miko-menu-item-emoji">{item.emoji}</span>
              <span className="miko-menu-item-label">{item.label}</span>
            </button>
          ))}
        </div>

        <div className="miko-menu-footer">
          <button
            type="button"
            className="miko-menu-action-btn secondary"
            onClick={(e) => {
              e.stopPropagation();
              onHideToTray();
            }}
            title="Hide Miko to System Tray"
          >
            <EyeOff size={14} />
            <span>Hide to Tray</span>
          </button>
          <button
            type="button"
            className="miko-menu-action-btn danger"
            onClick={(e) => {
              e.stopPropagation();
              onExit();
            }}
            title="Exit Miko"
          >
            <X size={14} />
            <span>Exit</span>
          </button>
        </div>
      </div>
    </div>
  );
};
