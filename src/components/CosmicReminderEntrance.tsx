import React, { useState, useEffect, useRef } from 'react';
import { TASKBAR_APPS } from './TaskbarAppIcons';
import { soundFx } from '../utils/audioEffects';

interface CosmicReminderEntranceProps {
  active: boolean;
  reminderTitle: string;
  onComplete: () => void;
}

type AnimationPhase =
  | 'idle'
  | 'black-hole-expand'
  | 'character-emerge'
  | 'black-hole-collapse'
  | 'hopping'
  | 'jump-down'
  | 'landed';

export const CosmicReminderEntrance: React.FC<CosmicReminderEntranceProps> = ({
  active,
  reminderTitle,
  onComplete,
}) => {
  const [phase, setPhase] = useState<AnimationPhase>('idle');
  const [currentIconIndex, setCurrentIconIndex] = useState<number>(-1);
  const [squashedIconIndex, setSquashedIconIndex] = useState<number>(-1);
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (!active) {
      setPhase('idle');
      setCurrentIconIndex(-1);
      hasTriggeredRef.current = false;
      return;
    }

    if (hasTriggeredRef.current) return;
    hasTriggeredRef.current = true;

    // Start sequence
    setPhase('black-hole-expand');
    soundFx.playBlackHoleSound();

    const timers: NodeJS.Timeout[] = [];

    // Phase 2: Character emerges from black hole
    timers.push(
      setTimeout(() => {
        setPhase('character-emerge');
      }, 700)
    );

    // Phase 3: Black hole collapses
    timers.push(
      setTimeout(() => {
        setPhase('black-hole-collapse');
      }, 1300)
    );

    // Phase 4: Start hopping across taskbar app icons
    const hopStartTime = 1700;
    const hopInterval = 320; // 320ms per icon

    TASKBAR_APPS.forEach((_, index) => {
      timers.push(
        setTimeout(() => {
          setPhase('hopping');
          setCurrentIconIndex(index);
          setSquashedIconIndex(index);

          // Audio sound for jump
          soundFx.playIconJumpSound(index);

          // Create sparkles at icon spot
          const iconLeft = 32 + index * 44;
          setSparkles((prev) => [
            ...prev.slice(-10),
            { id: Date.now() + index, x: iconLeft, y: 190 },
          ]);

          // Release squash after 120ms
          setTimeout(() => {
            setSquashedIconIndex(-1);
          }, 140);
        }, hopStartTime + index * hopInterval)
      );
    });

    // Phase 5: Big triumphant leap down
    const jumpDownTime = hopStartTime + TASKBAR_APPS.length * hopInterval + 150;
    timers.push(
      setTimeout(() => {
        setPhase('jump-down');
        soundFx.playIconJumpSound(TASKBAR_APPS.length);
      }, jumpDownTime)
    );

    // Phase 6: Landing & finish
    const landTime = jumpDownTime + 650;
    timers.push(
      setTimeout(() => {
        setPhase('landed');
        soundFx.playLandingSound();
        onComplete();
      }, landTime)
    );

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [active, onComplete]);

  if (!active || phase === 'idle') return null;

  // Calculate character position during hopping
  const getCharacterCoords = () => {
    if (phase === 'black-hole-expand') {
      return { x: 38, y: 70, scale: 0.2, rotate: -45, opacity: 0 };
    }
    if (phase === 'character-emerge') {
      return { x: 44, y: 85, scale: 0.9, rotate: 10, opacity: 1 };
    }
    if (phase === 'black-hole-collapse') {
      return { x: 46, y: 120, scale: 1, rotate: 0, opacity: 1 };
    }
    if (phase === 'hopping') {
      const targetX = 30 + currentIconIndex * 44;
      return { x: targetX, y: 150, scale: 1, rotate: 5, opacity: 1 };
    }
    if (phase === 'jump-down') {
      return { x: 210, y: 310, scale: 1.15, rotate: 360, opacity: 1 };
    }
    // landed
    return { x: 210, y: 380, scale: 1.2, rotate: 0, opacity: 0 };
  };

  const charPos = getCharacterCoords();

  return (
    <div className="miko-cosmic-runway-overlay">
      {/* Skip Button */}
      <button
        type="button"
        className="miko-cosmic-skip-btn"
        onClick={onComplete}
        title="Skip animation"
      >
        ✕ Skip
      </button>

      {/* Reminder Notification Banner */}
      <div className="miko-cosmic-banner">
        <span className="miko-cosmic-banner-icon">⏰</span>
        <span className="miko-cosmic-banner-text">{reminderTitle}</span>
      </div>

      {/* Cosmic Black Hole */}
      <div
        className={`miko-black-hole ${
          phase === 'black-hole-expand'
            ? 'expand'
            : phase === 'character-emerge'
            ? 'active'
            : phase === 'black-hole-collapse'
            ? 'collapse'
            : 'hidden'
        }`}
      >
        <div className="miko-bh-glow" />
        <div className="miko-bh-accretion" />
        <div className="miko-bh-core" />
        <div className="miko-bh-distortion" />
        <div className="miko-bh-sparkles">
          <span className="sp1">✨</span>
          <span className="sp2">✦</span>
          <span className="sp3">⋆</span>
        </div>
      </div>

      {/* Mini Chibi Miko Character */}
      <div
        className={`miko-mini-character ${phase === 'hopping' ? 'hopping-arc' : ''} ${
          phase === 'jump-down' ? 'leap-down-anim' : ''
        }`}
        style={{
          transform: `translate3d(${charPos.x}px, ${charPos.y}px, 0) scale(${charPos.scale}) rotate(${charPos.rotate}deg)`,
          opacity: charPos.opacity,
        }}
      >
        <svg viewBox="0 0 60 70" width="54" height="63" className="miko-mini-svg">
          {/* Twin tails */}
          <path
            d="M15 28 C 4 35, 2 54, 8 60 C 13 62, 18 50, 19 36 Z"
            fill="#a78bfa"
            className="mini-twintail-left"
          />
          <path
            d="M45 28 C 56 35, 58 54, 52 60 C 47 62, 42 50, 41 36 Z"
            fill="#a78bfa"
            className="mini-twintail-right"
          />

          {/* Little Body & dress */}
          <path d="M22 38 L38 38 L42 56 L18 56 Z" fill="#7c3aed" rx="3" />
          <ellipse cx="30" cy="46" rx="4" ry="5" fill="#fdf4ff" />
          <polygon points="30,41 28,45 32,45" fill="#f43f5e" />

          {/* Little Boots */}
          <ellipse cx="25" cy="58" rx="4.5" ry="3" fill="#1e1b4b" />
          <ellipse cx="35" cy="58" rx="4.5" ry="3" fill="#1e1b4b" />

          {/* Little Arms */}
          <ellipse cx="19" cy="44" rx="3" ry="5" fill="#fde2e4" transform="rotate(25 19 44)" />
          <ellipse cx="41" cy="44" rx="3" ry="5" fill="#fde2e4" transform="rotate(-25 41 44)" />

          {/* Cute Chibi Head */}
          <circle cx="30" cy="24" r="16" fill="#fff1f2" />

          {/* Hair back / bangs */}
          <path
            d="M14 22 C 14 11, 21 8, 30 8 C 39 8, 46 11, 46 22 C 43 20, 40 23, 37 18 C 34 23, 30 19, 27 21 C 24 18, 20 22, 14 22 Z"
            fill="#8b5cf6"
          />

          {/* Hair Ribbon */}
          <ellipse cx="30" cy="9" rx="5" ry="3" fill="#ec4899" />
          <circle cx="30" cy="9" r="2" fill="#f43f5e" />

          {/* Cute Eyes */}
          <ellipse cx="24" cy="23" rx="3" ry="4" fill="#6d28d9" />
          <ellipse cx="36" cy="23" rx="3" ry="4" fill="#6d28d9" />
          <circle cx="23" cy="21.5" r="1.3" fill="#ffffff" />
          <circle cx="35" cy="21.5" r="1.3" fill="#ffffff" />

          {/* Blushing cheeks */}
          <ellipse cx="20" cy="27" rx="3" ry="1.5" fill="#fca5a5" opacity="0.8" />
          <ellipse cx="40" cy="27" rx="3" ry="1.5" fill="#fca5a5" opacity="0.8" />

          {/* Smiling open mouth */}
          <path d="M28 27 Q 30 30 32 27" fill="#f43f5e" stroke="#be123c" strokeWidth="0.8" />
        </svg>

        {/* Mid-air sparkle trail */}
        <div className="miko-mini-trail">✦</div>
      </div>

      {/* Impact Sparkles on landing */}
      {sparkles.map((sp) => (
        <div
          key={sp.id}
          className="miko-impact-sparkle"
          style={{ left: `${sp.x + 14}px`, top: `${sp.y}px` }}
        >
          ✨
        </div>
      ))}

      {/* Windows Taskbar Apps Platform Dock */}
      <div className="miko-taskbar-runway-dock">
        <div className="miko-taskbar-dock-track">
          {TASKBAR_APPS.map((app, index) => {
            const isTarget = currentIconIndex === index;
            const isSquashed = squashedIconIndex === index;
            const isPassed = currentIconIndex > index;

            return (
              <div
                key={app.id}
                className={`miko-taskbar-app-icon-slot ${
                  isTarget ? 'active-target' : ''
                } ${isSquashed ? 'squashed' : ''} ${isPassed ? 'passed' : ''}`}
                title={app.name}
              >
                {/* Stepping stone pedestal */}
                <div className="miko-taskbar-icon-wrapper">
                  {app.renderIcon(isTarget)}
                </div>

                {/* Active indicator dot under current active app */}
                <span className={`miko-taskbar-dot ${isTarget ? 'glowing' : ''}`} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
