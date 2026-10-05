import React from 'react';
import { Smile } from 'lucide-react';
import { FloatingPanel } from './FloatingPanel';
import { CharacterState } from '../types';

interface MoodPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToMenu?: () => void;
  currentState: CharacterState;
  onSelectMood: (state: CharacterState) => void;
  onSpeak: (message: string, duration?: number, newState?: CharacterState) => void;
}

const MOODS: Array<{ state: CharacterState; label: string; emoji: string; quote: string }> = [
  { state: 'idle', label: 'Idle / Calm', emoji: '🌸', quote: "Feeling serene and ready! 🌸" },
  { state: 'happy', label: 'Happy & Cheerful', emoji: '✨', quote: "Yay! Today is going to be amazing! ✨" },
  { state: 'excited', label: 'Hyped & Excited', emoji: '🚀', quote: "Woohoo! Let's power through this! 🚀" },
  { state: 'thinking', label: 'Deep in Thought', emoji: '💡', quote: "Hmm... let me analyze this problem! 💡" },
  { state: 'talking', label: 'Chatty & Lively', emoji: '💬', quote: "Listen listen! I've got so much to tell you! 💬" },
  { state: 'surprised', label: 'Surprised', emoji: '😲', quote: "Whoa! I didn't see that coming! 😲" },
  { state: 'sleepy', label: 'Cozy & Sleepy', emoji: '💤', quote: "Fwaaah... time for a gentle nap... zZz" },
  { state: 'sad', label: 'Pouty / Teary', emoji: '🥺', quote: "Aww... did something go wrong? I'm here for you! 🥺" },
];

export const MoodPanel: React.FC<MoodPanelProps> = ({
  isOpen,
  onClose,
  onBackToMenu,
  currentState,
  onSelectMood,
  onSpeak,
}) => {
  return (
    <FloatingPanel
      title="Miko's Mood"
      icon={<Smile size={16} />}
      isOpen={isOpen}
      onClose={onClose}
      onBackToMenu={onBackToMenu}
      className="miko-mood-panel-container"
    >
      <div className="miko-mood-grid">
        {MOODS.map((m) => {
          const isSelected = currentState === m.state;
          return (
            <button
              key={m.state}
              className={`miko-mood-btn ${isSelected ? 'active' : ''}`}
              onClick={() => {
                onSelectMood(m.state);
                onSpeak(m.quote, 4, m.state);
              }}
            >
              <span className="miko-mood-emoji">{m.emoji}</span>
              <span className="miko-mood-label">{m.label}</span>
            </button>
          );
        })}
      </div>
    </FloatingPanel>
  );
};
