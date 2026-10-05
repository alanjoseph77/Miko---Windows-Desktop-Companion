import React, { useEffect, useCallback, useState } from 'react';
import { Menu, EyeOff, X, Bell, Check, Clock, Minus } from 'lucide-react';
import { CompanionCharacter } from './components/CompanionCharacter';
import { SpeechBubble } from './components/SpeechBubble';
import { CompanionMenu } from './components/CompanionMenu';
import { FocusTimer } from './components/FocusTimer';
import { TaskPanel } from './components/TaskPanel';
import { SettingsPanel } from './components/SettingsPanel';
import { MoodPanel } from './components/MoodPanel';
import { ReminderPanel } from './components/ReminderPanel';
import { RealTaskbarRunway } from './components/RealTaskbarRunway';
import { useSettings } from './hooks/useSettings';
import { useCompanion } from './hooks/useCompanion';
import { useReminders } from './hooks/useReminders';
import { ActivePanel, TrayAction, ReminderItem } from './types';
import './styles/cosmicEntrance.css';

export const App: React.FC = () => {
  const { settings, updateSettings, resetSettings } = useSettings();
  const {
    characterState,
    setCharacterState,
    activePanel,
    setActivePanel,
    speechBubble,
    showMessage,
    dismissMessage,
    handleCharacterClick,
  } = useCompanion(settings);

  const {
    reminders,
    activeAlert,
    addReminder,
    snoozeReminder,
    dismissAlert,
    deleteReminder,
  } = useReminders({
    onCharacterStateChange: setCharacterState,
    onSpeak: showMessage,
  });

  // Set color theme attribute
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }, [settings.theme]);

  // Handle tray actions from Electron IPC
  useEffect(() => {
    if (!window.mikoAPI?.onTrayAction) return;

    const cleanup = window.mikoAPI.onTrayAction((action: TrayAction) => {
      switch (action) {
        case 'show':
          window.mikoAPI?.bringToFront();
          break;
        case 'hide':
          window.mikoAPI?.hideToTray();
          break;
        case 'focus':
          setActivePanel('focus');
          window.mikoAPI?.bringToFront();
          break;
        case 'reminders':
          setActivePanel('reminders');
          window.mikoAPI?.bringToFront();
          break;
        case 'settings':
          setActivePanel('settings');
          window.mikoAPI?.bringToFront();
          break;
        case 'exit':
          window.mikoAPI?.closeWindow();
          break;
      }
    });

    return cleanup;
  }, [setActivePanel]);

  const handleMinimizeWindow = useCallback(() => {
    if (window.mikoAPI?.minimizeWindow) {
      window.mikoAPI.minimizeWindow();
    }
  }, []);

  const handleCloseWindow = useCallback(() => {
    if (window.mikoAPI?.closeWindow) {
      window.mikoAPI.closeWindow();
    } else {
      window.close();
    }
  }, []);

  const handleHideToTray = useCallback(() => {
    setActivePanel('none');
    if (window.mikoAPI?.hideToTray) {
      window.mikoAPI.hideToTray();
    } else {
      showMessage("I'm resting in your system tray! 🌸", 2500);
    }
  }, [showMessage, setActivePanel]);

  const handlePanelClose = useCallback(() => {
    setActivePanel('none');
  }, [setActivePanel]);

  const handleBackToMenu = useCallback(() => {
    setActivePanel('menu');
  }, [setActivePanel]);

  // Cosmic Black Hole & Taskbar App Jumping Sequence State
  const [cosmicAlertItem, setCosmicAlertItem] = useState<ReminderItem | null>(null);
  const [isCosmicActive, setIsCosmicActive] = useState<boolean>(false);
  const [showReminderAlertBox, setShowReminderAlertBox] = useState<boolean>(false);

  // Listen for Electron real taskbar runway completion
  useEffect(() => {
    if (!window.mikoAPI?.onRunwayCompleted) return;

    const cleanup = window.mikoAPI.onRunwayCompleted(() => {
      setIsCosmicActive(false);
      setShowReminderAlertBox(true);
      setCharacterState('excited');
      if (cosmicAlertItem) {
        showMessage(`⏰ Ding-dong! Time for: "${cosmicAlertItem.title}"! ✨`, 8, 'excited');
      }
    });

    return cleanup;
  }, [cosmicAlertItem, showMessage, setCharacterState]);

  // When activeAlert arrives from useReminders
  useEffect(() => {
    if (activeAlert) {
      setCosmicAlertItem(activeAlert);
      setShowReminderAlertBox(false);
      setActivePanel('none');

      if (window.mikoAPI?.startTaskbarRunway) {
        window.mikoAPI.startTaskbarRunway(activeAlert.title);
      } else {
        setIsCosmicActive(true);
      }
    }
  }, [activeAlert, setActivePanel]);

  const handleCosmicComplete = useCallback(() => {
    setIsCosmicActive(false);
    setShowReminderAlertBox(true);
    setCharacterState('excited');
    if (cosmicAlertItem) {
      showMessage(`⏰ Ding-dong! Time for: "${cosmicAlertItem.title}"! ✨`, 8, 'excited');
    }
  }, [cosmicAlertItem, showMessage, setCharacterState]);

  const handleTestCosmicAlert = useCallback(() => {
    const sampleItem: ReminderItem = {
      id: `test-${Date.now()}`,
      title: 'Take a break & stretch! 🧘✨',
      targetTimestamp: Date.now(),
      createdAt: Date.now(),
      completed: false,
    };
    setCosmicAlertItem(sampleItem);
    setShowReminderAlertBox(false);
    setActivePanel('none');

    if (window.mikoAPI?.startTaskbarRunway) {
      window.mikoAPI.startTaskbarRunway(sampleItem.title);
    } else {
      setIsCosmicActive(true);
    }
  }, [setActivePanel]);

  const handleDismissReminder = useCallback(() => {
    setShowReminderAlertBox(false);
    setCosmicAlertItem(null);
    dismissAlert();
  }, [dismissAlert]);

  const handleSnoozeReminder = useCallback((id: string, mins: number) => {
    setShowReminderAlertBox(false);
    setCosmicAlertItem(null);
    snoozeReminder(id, mins);
  }, [snoozeReminder]);

  return (
    <main className="miko-app-root">
      {/* Real Taskbar Hopping Sequence (Rendered in browser mode fallback when not in Electron multi-window) */}
      {!window.mikoAPI?.startTaskbarRunway && isCosmicActive && cosmicAlertItem && (
        <RealTaskbarRunway
          reminderTitle={cosmicAlertItem.title}
          onFinished={handleCosmicComplete}
        />
      )}

      {/* Floating Sub-Panels */}
      <CompanionMenu
        isOpen={activePanel === 'menu'}
        onSelectPanel={(panel: ActivePanel) => setActivePanel(panel)}
        onCloseMenu={handlePanelClose}
        onHideToTray={handleHideToTray}
        onExit={handleCloseWindow}
      />

      {/* ChatPanel hidden as requested */}

      <FocusTimer
        isOpen={activePanel === 'focus'}
        onClose={handlePanelClose}
        onBackToMenu={handleBackToMenu}
        onCharacterStateChange={setCharacterState}
        onSpeak={showMessage}
      />

      <TaskPanel
        isOpen={activePanel === 'tasks'}
        onClose={handlePanelClose}
        onBackToMenu={handleBackToMenu}
        onCharacterStateChange={setCharacterState}
        onSpeak={showMessage}
      />

      <SettingsPanel
        isOpen={activePanel === 'settings'}
        onClose={handlePanelClose}
        onBackToMenu={handleBackToMenu}
        settings={settings}
        onUpdateSettings={updateSettings}
        onResetSettings={resetSettings}
      />

      <MoodPanel
        isOpen={activePanel === 'mood'}
        onClose={handlePanelClose}
        onBackToMenu={handleBackToMenu}
        currentState={characterState}
        onSelectMood={setCharacterState}
        onSpeak={showMessage}
      />

      <ReminderPanel
        isOpen={activePanel === 'reminders'}
        onClose={handlePanelClose}
        onBackToMenu={handleBackToMenu}
        reminders={reminders}
        onAddReminder={addReminder}
        onDeleteReminder={deleteReminder}
        onTestCosmicAlert={handleTestCosmicAlert}
      />

      {/* Prominent Reminder Alert Popup (Appears once Miko completes the jump down) */}
      {showReminderAlertBox && cosmicAlertItem && (
        <div className="miko-alert-overlay">
          <div className="miko-alert-box">
            <div className="miko-alert-header">
              <div className="miko-alert-icon-ring">
                <Bell size={16} />
              </div>
              <span>⏰ Reminder Alert!</span>
            </div>
            <div className="miko-alert-message">
              {cosmicAlertItem.title}
            </div>
            <div className="miko-alert-actions">
              <button
                type="button"
                className="miko-alert-btn done"
                onClick={handleDismissReminder}
              >
                <Check size={14} />
                <span>Done</span>
              </button>
              <button
                type="button"
                className="miko-alert-btn snooze"
                onClick={() => handleSnoozeReminder(cosmicAlertItem.id, 5)}
              >
                <Clock size={14} />
                <span>Snooze 5m</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Companion Character & Speech Area */}
      <div className="miko-companion-wrapper">
        {/* Sleek Companion Dock directly attached to Miko (only visible when no menu or panel is open) */}
        {activePanel === 'none' && !isCosmicActive && (
          <div className="miko-companion-dock">
            <button
              className="miko-dock-btn"
              onClick={() => setActivePanel('menu')}
              title="Open Miko Menu"
              aria-label="Open Miko Menu"
            >
              <Menu size={13} />
              <span className="miko-dock-label">Menu</span>
            </button>
            <button
              className="miko-dock-btn"
              onClick={handleTestCosmicAlert}
              title="Test Cosmic Black Hole & Taskbar App Jump"
              aria-label="Test Cosmic Jump"
            >
              <span>🌌</span>
            </button>
            <button
              className="miko-dock-btn"
              onClick={() => setActivePanel('reminders')}
              title="Reminders & Timers"
              aria-label="Reminders"
            >
              <Bell size={13} />
              {reminders.filter((r) => !r.completed && r.targetTimestamp > Date.now()).length > 0 && (
                <span className="miko-dock-badge" />
              )}
            </button>
            <button
              className="miko-dock-btn"
              onClick={handleMinimizeWindow}
              title="Minimize to Taskbar"
              aria-label="Minimize"
            >
              <Minus size={13} />
            </button>
            <button
              className="miko-dock-btn"
              onClick={handleHideToTray}
              title="Hide to System Tray (Click Miko in tray to restore)"
              aria-label="Hide to Tray"
            >
              <EyeOff size={13} />
            </button>
            <button
              className="miko-dock-btn danger"
              onClick={handleCloseWindow}
              title="Close Miko"
              aria-label="Close Miko"
            >
              <X size={13} />
            </button>
          </div>
        )}

        <SpeechBubble
          text={speechBubble.text}
          visible={speechBubble.visible && activePanel === 'none'}
          onDismiss={dismissMessage}
        />

        <CompanionCharacter
          state={characterState}
          scale={settings.characterScale}
          modelMode={settings.characterModel}
          enableAnimations={settings.enableAnimations && !settings.reduceMotion}
          onClick={handleCharacterClick}
          onContextMenu={(e: React.MouseEvent) => {
            e.preventDefault();
            setActivePanel('menu');
          }}
        />
      </div>
    </main>
  );
};
export default App;
