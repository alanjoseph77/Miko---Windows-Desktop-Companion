import React from 'react';
import { Play, Pause, RotateCcw, Coffee, Flame } from 'lucide-react';
import { FloatingPanel } from './FloatingPanel';
import { useFocusTimer, FocusMode } from '../hooks/useFocusTimer';
import { CharacterState } from '../types';

interface FocusTimerProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToMenu?: () => void;
  onCharacterStateChange: (state: CharacterState) => void;
  onSpeak: (message: string, duration?: number, newState?: CharacterState) => void;
}

export const FocusTimer: React.FC<FocusTimerProps> = ({
  isOpen,
  onClose,
  onBackToMenu,
  onCharacterStateChange,
  onSpeak,
}) => {
  const {
    mode,
    isRunning,
    secondsLeft,
    sessionsCompleted,
    formattedTime,
    startTimer,
    pauseTimer,
    resetTimer,
    switchMode,
  } = useFocusTimer({
    workMinutes: 25,
    breakMinutes: 5,
    onStart: () => {
      onCharacterStateChange('excited');
      onSpeak('Focus mode started! 🚀', 4, 'excited');
    },
    onPause: () => {
      onCharacterStateChange('thinking');
      onSpeak("Timer paused. Take a breath! I'm right here. 🍵", 3, 'thinking');
    },
    onReset: () => {
      onCharacterStateChange('idle');
      onSpeak('Timer reset. Ready when you are! ✨', 3, 'idle');
    },
    onFinish: (finishedMode: FocusMode) => {
      if (finishedMode === 'work') {
        onCharacterStateChange('happy');
        onSpeak('Great work! Take a short break. 🎉', 6, 'happy');
      } else {
        onCharacterStateChange('excited');
        onSpeak('Break is over! Ready for the next sprint? 🚀', 5, 'excited');
      }
    },
  });

  const totalSeconds = mode === 'work' ? 25 * 60 : 5 * 60;
  const progressPercent = ((totalSeconds - secondsLeft) / totalSeconds) * 100;

  return (
    <FloatingPanel
      title="Focus Timer"
      icon={<Flame size={16} className="text-amber-500" />}
      isOpen={isOpen}
      onClose={onClose}
      onBackToMenu={onBackToMenu}
      className="miko-focus-timer-container"
    >
      <div className="miko-timer-mode-tabs">
        <button
          className={`miko-timer-tab ${mode === 'work' ? 'active' : ''}`}
          onClick={() => switchMode('work')}
        >
          <Flame size={14} />
          <span>Work (25m)</span>
        </button>
        <button
          className={`miko-timer-tab ${mode === 'break' ? 'active' : ''}`}
          onClick={() => switchMode('break')}
        >
          <Coffee size={14} />
          <span>Break (5m)</span>
        </button>
      </div>

      <div className="miko-timer-display-box">
        <div className="miko-timer-progress-ring">
          <div
            className="miko-timer-bar"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className={`miko-timer-digits ${isRunning ? 'ticking' : ''}`}>
          {formattedTime}
        </div>
        <div className="miko-timer-subtext">
          {mode === 'work' ? 'Deep Work Session' : 'Relax & Hydrate'}
        </div>
      </div>

      <div className="miko-timer-controls">
        {!isRunning ? (
          <button className="miko-timer-btn primary" onClick={startTimer} title="Start Timer">
            <Play size={16} />
            <span>Start</span>
          </button>
        ) : (
          <button className="miko-timer-btn secondary" onClick={pauseTimer} title="Pause Timer">
            <Pause size={16} />
            <span>Pause</span>
          </button>
        )}
        <button className="miko-timer-btn neutral" onClick={resetTimer} title="Reset Timer">
          <RotateCcw size={16} />
          <span>Reset</span>
        </button>
      </div>

      <div className="miko-timer-stats">
        <span>Completed Focus Sessions: <strong>{sessionsCompleted}</strong> 🎯</span>
      </div>
    </FloatingPanel>
  );
};
