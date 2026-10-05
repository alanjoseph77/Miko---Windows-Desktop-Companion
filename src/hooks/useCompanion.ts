import { useState, useEffect, useCallback, useRef } from 'react';
import { CharacterState, ActivePanel, CompanionSettings } from '../types';
import { SpeechBubbleState } from '../store/companionStore';

const IDLE_QUOTES = [
  "Let's finish this task together! ✨",
  "You're doing great! 🌸",
  "Need some help? I'm right here! (◕‿◕✿)",
  "Take a short break and drink water! 🍵",
  "Let's focus and get this done! 🚀",
  "Keep up the awesome momentum! 🌟",
  "I'm cheering for you always! (｡♥‿♥｡)",
  "One line of code at a time! 💻",
];

const CLICK_QUOTES = [
  "Yahho! Need something? ( ´ ▽ ` )ﾉ",
  "Hehe, that tickles! (⁄ ⁄> ⁄ ▽ ⁄ <⁄ ⁄)",
  "I'm all ears! Let's do this! ✨",
  "Patted Miko! Productivity +100! 🐾",
  "Ready whenever you are! 💖",
];

export function useCompanion(settings: CompanionSettings) {
  const [characterState, setCharacterState] = useState<CharacterState>('idle');
  const [activePanel, setActivePanel] = useState<ActivePanel>('none');
  const [speechBubble, setSpeechBubble] = useState<SpeechBubbleState>({
    id: 0,
    text: "Let's finish this task together! ✨",
    visible: true,
    duration: 5,
  });

  const stateResetTimerRef = useRef<NodeJS.Timeout | null>(null);
  const idleSpeechTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showMessage = useCallback(
    (text: string, durationSeconds?: number, newState?: CharacterState) => {
      if (!settings.enableSpeechBubbles) return;

      const duration = durationSeconds ?? settings.speechDurationSeconds;

      setSpeechBubble({
        id: Date.now(),
        text,
        visible: true,
        duration,
      });

      if (newState) {
        setCharacterState(newState);

        if (stateResetTimerRef.current) {
          clearTimeout(stateResetTimerRef.current);
        }

        // Return to idle after a few seconds unless in talking state
        stateResetTimerRef.current = setTimeout(() => {
          setCharacterState('idle');
        }, Math.max(3000, duration * 1000));
      }
    },
    [settings.enableSpeechBubbles, settings.speechDurationSeconds]
  );

  const dismissMessage = useCallback(() => {
    setSpeechBubble((prev) => ({ ...prev, visible: false }));
  }, []);

  // Handle companion click
  const handleCharacterClick = useCallback(() => {
    const randomQuote = CLICK_QUOTES[Math.floor(Math.random() * CLICK_QUOTES.length)];
    const reactions: CharacterState[] = ['happy', 'excited', 'surprised'];
    const chosenReaction = reactions[Math.floor(Math.random() * reactions.length)];

    showMessage(randomQuote, 4, chosenReaction);
  }, [showMessage]);

  // Periodic idle messages
  useEffect(() => {
    if (!settings.idleMessagesEnabled || !settings.enableSpeechBubbles) {
      if (idleSpeechTimerRef.current) clearInterval(idleSpeechTimerRef.current);
      return;
    }

    const intervalMs = Math.max(15, settings.idleIntervalSeconds) * 1000;
    idleSpeechTimerRef.current = setInterval(() => {
      // Only speak if no panels are open and character is idle
      if (activePanel === 'none') {
        const quote = IDLE_QUOTES[Math.floor(Math.random() * IDLE_QUOTES.length)];
        showMessage(quote, settings.speechDurationSeconds, 'happy');
      }
    }, intervalMs);

    return () => {
      if (idleSpeechTimerRef.current) clearInterval(idleSpeechTimerRef.current);
    };
  }, [settings.idleMessagesEnabled, settings.idleIntervalSeconds, settings.enableSpeechBubbles, settings.speechDurationSeconds, activePanel, showMessage]);

  // Close speech bubble timer
  useEffect(() => {
    if (!speechBubble.visible || speechBubble.duration <= 0) return;

    const timer = setTimeout(() => {
      dismissMessage();
    }, speechBubble.duration * 1000);

    return () => clearTimeout(timer);
  }, [speechBubble.id, speechBubble.visible, speechBubble.duration, dismissMessage]);

  return {
    characterState,
    setCharacterState,
    activePanel,
    setActivePanel,
    speechBubble,
    showMessage,
    dismissMessage,
    handleCharacterClick,
  };
}
