import { useState, useEffect, useCallback, useRef } from 'react';

export type FocusMode = 'work' | 'break';

export interface FocusTimerOptions {
  workMinutes?: number;
  breakMinutes?: number;
  onStart?: () => void;
  onPause?: () => void;
  onReset?: () => void;
  onFinish?: (mode: FocusMode) => void;
}

export function useFocusTimer(options: FocusTimerOptions = {}) {
  const workMinutes = options.workMinutes ?? 25;
  const breakMinutes = options.breakMinutes ?? 5;

  const [mode, setMode] = useState<FocusMode>('work');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [secondsLeft, setSecondsLeft] = useState<number>(workMinutes * 60);
  const [sessionsCompleted, setSessionsCompleted] = useState<number>(0);

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const startTimer = useCallback(() => {
    setIsRunning(true);
    optionsRef.current.onStart?.();
  }, []);

  const pauseTimer = useCallback(() => {
    setIsRunning(false);
    optionsRef.current.onPause?.();
  }, []);

  const resetTimer = useCallback(() => {
    setIsRunning(false);
    const initialSeconds = (mode === 'work' ? workMinutes : breakMinutes) * 60;
    setSecondsLeft(initialSeconds);
    optionsRef.current.onReset?.();
  }, [mode, workMinutes, breakMinutes]);

  const switchMode = useCallback(
    (newMode: FocusMode) => {
      setIsRunning(false);
      setMode(newMode);
      setSecondsLeft((newMode === 'work' ? workMinutes : breakMinutes) * 60);
    },
    [workMinutes, breakMinutes]
  );

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsRunning(false);

          // Trigger finish callback
          optionsRef.current.onFinish?.(mode);

          // Auto switch to other mode
          if (mode === 'work') {
            setSessionsCompleted((s) => s + 1);
            setMode('break');
            return breakMinutes * 60;
          } else {
            setMode('work');
            return workMinutes * 60;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, mode, workMinutes, breakMinutes]);

  // Format MM:SS
  const formatTime = useCallback((): string => {
    const mins = Math.floor(secondsLeft / 60);
    const secs = secondsLeft % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, [secondsLeft]);

  return {
    mode,
    isRunning,
    secondsLeft,
    sessionsCompleted,
    formattedTime: formatTime(),
    startTimer,
    pauseTimer,
    resetTimer,
    switchMode,
  };
}
