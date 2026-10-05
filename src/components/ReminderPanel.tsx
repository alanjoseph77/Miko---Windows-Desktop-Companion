import React, { useState, useEffect } from 'react';
import { Bell, Clock, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { FloatingPanel } from './FloatingPanel';
import { ReminderItem } from '../types';

interface ReminderPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToMenu?: () => void;
  reminders: ReminderItem[];
  onAddReminder: (title: string, minutes: number) => void;
  onDeleteReminder: (id: string) => void;
  onTestCosmicAlert?: () => void;
}

const QUICK_PRESETS = [
  { label: '5m Water', title: 'Drink a glass of water 🍵', minutes: 5 },
  { label: '15m Stretch', title: 'Stretch and move around 🧘', minutes: 15 },
  { label: '25m Break', title: 'Take a quick 5m break 🌿', minutes: 25 },
  { label: '45m Eyes', title: 'Rest your eyes for 20 seconds 👀', minutes: 45 },
  { label: '60m Meeting', title: 'Check upcoming meeting / schedule 📅', minutes: 60 },
];

export const ReminderPanel: React.FC<ReminderPanelProps> = ({
  isOpen,
  onClose,
  onBackToMenu,
  reminders,
  onAddReminder,
  onDeleteReminder,
  onTestCosmicAlert,
}) => {
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customMinutes, setCustomMinutes] = useState<number>(10);
  const [currentTime, setCurrentTime] = useState<number>(Date.now());

  // Update countdown clock every second while open
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    onAddReminder(customTitle.trim(), customMinutes);
    setCustomTitle('');
  };

  const formatRemainingTime = (targetTimestamp: number): string => {
    const diffSeconds = Math.max(0, Math.floor((targetTimestamp - currentTime) / 1000));
    if (diffSeconds === 0) return 'Due now!';

    const hours = Math.floor(diffSeconds / 3600);
    const minutes = Math.floor((diffSeconds % 3600) / 60);
    const seconds = diffSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  const activeReminders = reminders.filter((r) => !r.completed && r.targetTimestamp > currentTime);
  const pastReminders = reminders.filter((r) => r.completed || r.targetTimestamp <= currentTime).slice(0, 5);

  return (
    <FloatingPanel
      title="Reminders"
      icon={<Bell size={16} className="text-purple-600" />}
      isOpen={isOpen}
      onClose={onClose}
      onBackToMenu={onBackToMenu}
      className="miko-reminder-panel-container"
    >
      {onTestCosmicAlert && (
        <button
          type="button"
          className="miko-cosmic-test-trigger-btn"
          onClick={onTestCosmicAlert}
          title="Watch the black hole & taskbar app jumping animation!"
        >
          <span>🌌</span>
          <span>Test Cosmic Black Hole & App Jump!</span>
        </button>
      )}

      {/* Quick 1-Click Preset Chips */}
      <div className="miko-reminder-section">
        <label className="miko-group-title">
          <Clock size={12} />
          <span>Quick 1-Click Reminders</span>
        </label>
        <div className="miko-reminder-preset-chips">
          {QUICK_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              className="miko-reminder-preset-btn"
              onClick={() => onAddReminder(preset.title, preset.minutes)}
            >
              <span className="preset-time">+{preset.minutes}m</span>
              <span className="preset-name">{preset.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Reminder Form */}
      <form className="miko-reminder-form" onSubmit={handleCustomSubmit}>
        <label className="miko-group-title">
          <Plus size={12} />
          <span>Custom One-Time Reminder</span>
        </label>
        <div className="miko-reminder-input-row">
          <input
            type="text"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            placeholder="e.g. Check oven, call mom, join standup..."
            className="miko-reminder-text-input"
          />
        </div>
        <div className="miko-reminder-time-row">
          <div className="miko-quick-minute-chips">
            {[1, 5, 10, 15, 30, 60].map((m) => (
              <button
                type="button"
                key={m}
                className={`miko-min-pill ${customMinutes === m ? 'active' : ''}`}
                onClick={() => setCustomMinutes(m)}
              >
                {m}m
              </button>
            ))}
          </div>

          <div className="miko-reminder-custom-input-group">
            <span className="miko-reminder-label">Or:</span>
            <input
              type="number"
              min="1"
              max="720"
              value={customMinutes}
              onChange={(e) => setCustomMinutes(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="miko-reminder-min-input"
            />
            <span className="miko-reminder-label">min</span>
          </div>
        </div>

        <button
          type="submit"
          className="miko-reminder-submit-btn"
          disabled={!customTitle.trim()}
        >
          <Bell size={14} />
          <span>Set Reminder ({customMinutes} min)</span>
        </button>
      </form>

      {/* Active Reminders List */}
      <div className="miko-reminder-list-section">
        <div className="miko-group-title">
          <Clock size={12} />
          <span>Active Reminders ({activeReminders.length})</span>
        </div>

        <div className="miko-reminder-list">
          {activeReminders.length === 0 ? (
            <div className="miko-empty-reminders">
              <span>No upcoming reminders. Enjoy your peaceful time! 🌸</span>
            </div>
          ) : (
            activeReminders.map((r) => (
              <div key={r.id} className="miko-reminder-card active">
                <div className="miko-reminder-card-icon">
                  <Clock size={16} />
                </div>
                <div className="miko-reminder-card-info">
                  <span className="miko-reminder-title">{r.title}</span>
                  <span className="miko-reminder-countdown">
                    ⏰ in {formatRemainingTime(r.targetTimestamp)}
                  </span>
                </div>
                <button
                  className="miko-reminder-delete-btn"
                  onClick={() => onDeleteReminder(r.id)}
                  title="Cancel reminder"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}

          {pastReminders.length > 0 && (
            <div className="miko-past-reminders-wrap">
              <span className="miko-sub-label">Recently Alerted</span>
              {pastReminders.map((r) => (
                <div key={r.id} className="miko-reminder-card completed">
                  <div className="miko-reminder-card-icon">
                    <CheckCircle2 size={14} />
                  </div>
                  <div className="miko-reminder-card-info">
                    <span className="miko-reminder-title">{r.title}</span>
                    <span className="miko-reminder-countdown completed">Alerted</span>
                  </div>
                  <button
                    className="miko-reminder-delete-btn"
                    onClick={() => onDeleteReminder(r.id)}
                    title="Remove from history"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </FloatingPanel>
  );
};
