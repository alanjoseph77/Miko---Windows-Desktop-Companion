import { useState, useEffect, useCallback, useRef } from 'react';
import { ReminderItem, CharacterState } from '../types';
import { loadStoredReminders, saveStoredReminders } from '../store/companionStore';

// Play a pleasant chime sound synthesized via Web Audio API
function playChimeSound(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // Harmonic bell chime chords (D5, F#5, A5)
    const notes = [587.33, 739.99, 880.0];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);

      gain.gain.setValueAtTime(0, now + idx * 0.1);
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.1 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 1.3);
    });
  } catch (err) {
    console.warn('Audio chime playback error:', err);
  }
}

interface UseRemindersOptions {
  onTriggerAlert?: (reminder: ReminderItem) => void;
  onCharacterStateChange?: (state: CharacterState) => void;
  onSpeak?: (text: string, durationSeconds?: number, state?: CharacterState) => void;
}

export function useReminders(options: UseRemindersOptions = {}) {
  const [reminders, setReminders] = useState<ReminderItem[]>(() => loadStoredReminders());
  const [activeAlert, setActiveAlert] = useState<ReminderItem | null>(null);

  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    saveStoredReminders(reminders);
  }, [reminders]);

  // Check for expired reminders every second
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();

      setReminders((prev) => {
        let hasUpdated = false;
        const next = prev.map((item) => {
          if (!item.completed && now >= item.targetTimestamp) {
            hasUpdated = true;

            // Trigger alert actions
            setActiveAlert(item);
            playChimeSound();

            // Bring Miko window to front on desktop even if hidden
            if (window.mikoAPI?.bringToFront) {
              window.mikoAPI.bringToFront();
            }

            optionsRef.current.onCharacterStateChange?.('excited');
            optionsRef.current.onSpeak?.(
              `⏰ Reminder: ${item.title}!`,
              8,
              'excited'
            );
            optionsRef.current.onTriggerAlert?.(item);

            return { ...item, completed: true };
          }
          return item;
        });

        return hasUpdated ? next : prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const addReminder = useCallback((title: string, minutesFromNow: number) => {
    const targetTimestamp = Date.now() + Math.max(1, Math.round(minutesFromNow * 60 * 1000));
    const newReminder: ReminderItem = {
      id: `rem-${Date.now()}`,
      title: title.trim(),
      targetTimestamp,
      createdAt: Date.now(),
      completed: false,
    };

    setReminders((prev) => [newReminder, ...prev]);

    // Cheerful confirmation
    const minsText = minutesFromNow === 1 ? '1 minute' : `${minutesFromNow} minutes`;
    optionsRef.current.onSpeak?.(
      `Got it! I'll remind you in ${minsText}: "${title.trim()}"! ⏰`,
      4,
      'happy'
    );
  }, []);

  const snoozeReminder = useCallback((reminderId: string, minutes: number = 5) => {
    setReminders((prev) =>
      prev.map((r) => {
        if (r.id === reminderId) {
          return {
            ...r,
            completed: false,
            targetTimestamp: Date.now() + minutes * 60 * 1000,
          };
        }
        return r;
      })
    );
    setActiveAlert(null);
    optionsRef.current.onSpeak?.(`Snoozed for ${minutes} minutes! 💤`, 3, 'idle');
  }, []);

  const dismissAlert = useCallback(() => {
    setActiveAlert(null);
  }, []);

  const deleteReminder = useCallback((reminderId: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== reminderId));
    setActiveAlert((curr) => (curr?.id === reminderId ? null : curr));
  }, []);

  return {
    reminders,
    activeAlert,
    addReminder,
    snoozeReminder,
    dismissAlert,
    deleteReminder,
  };
}
