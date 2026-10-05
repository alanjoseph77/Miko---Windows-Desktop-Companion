import React, { useState } from 'react';
import { Settings, Sliders, MessageCircle, Sparkles, Monitor, RotateCcw, Info } from 'lucide-react';
import { FloatingPanel } from './FloatingPanel';
import { CompanionSettings, CharacterModelMode } from '../types';
import { Live2DManager } from '../live2d/Live2DManager';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToMenu?: () => void;
  settings: CompanionSettings;
  onUpdateSettings: (partial: Partial<CompanionSettings>) => void;
  onResetSettings: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  isOpen,
  onClose,
  onBackToMenu,
  settings,
  onUpdateSettings,
  onResetSettings,
}) => {
  const [showLive2DInfo, setShowLive2DInfo] = useState<boolean>(false);

  const handleResetPosition = async () => {
    if (window.mikoAPI?.setPosition) {
      // Reposition to standard bottom right
      await window.mikoAPI.setPosition(1200, 350);
    }
  };

  const live2DInstructions = Live2DManager.getInstance().getSetupInstructions();

  return (
    <FloatingPanel
      title="Settings"
      icon={<Settings size={16} />}
      isOpen={isOpen}
      onClose={onClose}
      onBackToMenu={onBackToMenu}
      className="miko-settings-panel-container"
    >
      <div className="miko-settings-list">
        {/* Character Section */}
        <div className="miko-settings-group">
          <div className="miko-group-title">
            <Sliders size={14} />
            <span>Character Appearance</span>
          </div>

          <div className="miko-setting-item">
            <label className="miko-setting-label">Model Type</label>
            <select
              value={settings.characterModel}
              onChange={(e) => onUpdateSettings({ characterModel: e.target.value as CharacterModelMode })}
              className="miko-setting-select"
            >
              <option value="3d-character">3D Character (character.glb)</option>
              <option value="svg-anime">Anime Vector SVG (Dynamic Animations)</option>
              <option value="art-anime">Anime Sticker Art (PNG/JPG)</option>
              <option value="live2d">Live2D Cubism Model (SDK Ready)</option>
            </select>
          </div>

          {settings.characterModel === 'live2d' && (
            <div className="miko-live2d-notice">
              <div className="miko-live2d-notice-header">
                <Info size={14} />
                <span>Live2D Integration Active</span>
              </div>
              <button
                className="miko-sub-btn"
                onClick={() => setShowLive2DInfo(!showLive2DInfo)}
              >
                {showLive2DInfo ? 'Hide Setup Guide' : 'View Setup Guide'}
              </button>

              {showLive2DInfo && (
                <div className="miko-live2d-steps">
                  {live2DInstructions.instructions.map((step, idx) => (
                    <div key={idx} className="miko-step-line">{step}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="miko-setting-item">
            <div className="miko-setting-col">
              <label className="miko-setting-label">Character Scale: {Math.round(settings.characterScale * 100)}%</label>
              <input
                type="range"
                min="0.75"
                max="1.35"
                step="0.05"
                value={settings.characterScale}
                onChange={(e) => onUpdateSettings({ characterScale: parseFloat(e.target.value) })}
                className="miko-range-slider"
              />
            </div>
          </div>

          <div className="miko-setting-item row">
            <label className="miko-setting-label">Always on Top</label>
            <input
              type="checkbox"
              checked={settings.alwaysOnTop}
              onChange={(e) => onUpdateSettings({ alwaysOnTop: e.target.checked })}
              className="miko-toggle"
            />
          </div>

          <div className="miko-setting-item row">
            <label className="miko-setting-label">Enable Character Animations</label>
            <input
              type="checkbox"
              checked={settings.enableAnimations}
              onChange={(e) => onUpdateSettings({ enableAnimations: e.target.checked })}
              className="miko-toggle"
            />
          </div>

          <div className="miko-setting-item">
            <button className="miko-setting-button" onClick={handleResetPosition}>
              <RotateCcw size={14} />
              <span>Reset Screen Position</span>
            </button>
          </div>
        </div>

        {/* Speech Section */}
        <div className="miko-settings-group">
          <div className="miko-group-title">
            <MessageCircle size={14} />
            <span>Speech Bubbles</span>
          </div>

          <div className="miko-setting-item row">
            <label className="miko-setting-label">Enable Speech Bubbles</label>
            <input
              type="checkbox"
              checked={settings.enableSpeechBubbles}
              onChange={(e) => onUpdateSettings({ enableSpeechBubbles: e.target.checked })}
              className="miko-toggle"
            />
          </div>

          <div className="miko-setting-item">
            <div className="miko-setting-col">
              <label className="miko-setting-label">Speech Duration: {settings.speechDurationSeconds}s</label>
              <input
                type="range"
                min="2"
                max="10"
                step="1"
                value={settings.speechDurationSeconds}
                onChange={(e) => onUpdateSettings({ speechDurationSeconds: parseInt(e.target.value, 10) })}
                className="miko-range-slider"
              />
            </div>
          </div>
        </div>

        {/* Behavior Section */}
        <div className="miko-settings-group">
          <div className="miko-group-title">
            <Sparkles size={14} />
            <span>Companion Behavior</span>
          </div>

          <div className="miko-setting-item row">
            <label className="miko-setting-label">Idle Chatter Messages</label>
            <input
              type="checkbox"
              checked={settings.idleMessagesEnabled}
              onChange={(e) => onUpdateSettings({ idleMessagesEnabled: e.target.checked })}
              className="miko-toggle"
            />
          </div>

          <div className="miko-setting-item row">
            <label className="miko-setting-label">Random Click Reactions</label>
            <input
              type="checkbox"
              checked={settings.randomReactions}
              onChange={(e) => onUpdateSettings({ randomReactions: e.target.checked })}
              className="miko-toggle"
            />
          </div>

          <div className="miko-setting-item row">
            <label className="miko-setting-label">Start with Windows</label>
            <input
              type="checkbox"
              checked={settings.startWithWindows}
              onChange={(e) => onUpdateSettings({ startWithWindows: e.target.checked })}
              className="miko-toggle"
            />
          </div>
        </div>

        {/* Appearance & Performance */}
        <div className="miko-settings-group">
          <div className="miko-group-title">
            <Monitor size={14} />
            <span>Theme & Performance</span>
          </div>

          <div className="miko-setting-item">
            <label className="miko-setting-label">Color Theme</label>
            <select
              value={settings.theme}
              onChange={(e) => onUpdateSettings({ theme: e.target.value as 'lavender' | 'dark' | 'light' })}
              className="miko-setting-select"
            >
              <option value="lavender">Pastel Lavender (Default)</option>
              <option value="dark">Midnight Dark Glass</option>
              <option value="light">Pure Blossom Light</option>
            </select>
          </div>

          <div className="miko-setting-item row">
            <label className="miko-setting-label">Reduce Motion / Battery Saver</label>
            <input
              type="checkbox"
              checked={settings.reduceMotion}
              onChange={(e) => onUpdateSettings({ reduceMotion: e.target.checked })}
              className="miko-toggle"
            />
          </div>
        </div>

        {/* Reset */}
        <div className="miko-settings-group reset-group">
          <button className="miko-reset-all-btn" onClick={onResetSettings}>
            Reset All Settings to Defaults
          </button>
        </div>
      </div>
    </FloatingPanel>
  );
};
