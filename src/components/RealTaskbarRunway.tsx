import React, { useState, useEffect } from 'react';
import { soundFx } from '../utils/audioEffects';
import { ToonCat3D } from './ToonCat3D';
import { Character3DCanvas } from './Character3DCanvas';

interface RealTaskbarRunwayProps {
  reminderTitle?: string;
  runnerType?: 'cat' | 'miko' | '3d-character';
  onFinished?: () => void;
}

type AnimationPhase =
  | 'idle'
  | 'black-hole-expand'
  | 'character-emerge'
  | 'black-hole-collapse'
  | 'hopping'
  | 'leap-down'
  | 'finished';

export const RealTaskbarRunway: React.FC<RealTaskbarRunwayProps> = ({
  reminderTitle = 'Reminder Alert!',
  runnerType = 'cat',
  onFinished,
}) => {
  const [phase, setPhase] = useState<AnimationPhase>('black-hole-expand');
  const [currentStep, setCurrentStep] = useState<number>(-1);
  const [impactSparkles, setImpactSparkles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  // Screen width & center
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
  const centerX = Math.round(screenWidth / 2);

  // Real Windows 11 Taskbar Centered App Positions
  // 8 icons: Start, Antigravity, VS Code, Edge, GitHub, Explorer, AnyDesk, Miko
  // Each icon is approx 44px center-to-center
  const appXPositions = [
    centerX - 154, // Windows Start
    centerX - 110, // Antigravity IDE
    centerX - 66,  // VS Code
    centerX - 22,  // Edge
    centerX + 22,  // GitHub
    centerX + 66,  // File Explorer
    centerX + 110, // AnyDesk
    centerX + 154, // Miko
  ];

  // Landing height right on top of real physical taskbar (taskbar is 48px at screen bottom)
  const taskbarTopY = 160;

  useEffect(() => {
    soundFx.playBlackHoleSound();

    const timers: NodeJS.Timeout[] = [];

    // Phase 1: Black hole opens immediately
    setPhase('black-hole-expand');

    // Phase 2: Character emerges out of the black hole
    timers.push(
      setTimeout(() => {
        setPhase('character-emerge');
      }, 650)
    );

    // Phase 3: Black hole collapses
    timers.push(
      setTimeout(() => {
        setPhase('black-hole-collapse');
      }, 1300)
    );

    // Phase 4: Hopping across real taskbar icons
    const hopStart = 1650;
    const hopInterval = 320;

    appXPositions.forEach((xPos, idx) => {
      timers.push(
        setTimeout(() => {
          setPhase('hopping');
          setCurrentStep(idx);

          // Audio sound for jump
          soundFx.playIconJumpSound(idx);

          // Add impact sparkle right on top of the real taskbar icon
          setImpactSparkles((prev) => [
            ...prev.slice(-10),
            { id: Date.now() + idx, x: xPos, y: taskbarTopY },
          ]);
        }, hopStart + idx * hopInterval)
      );
    });

    // Phase 5: Big leap off the taskbar
    const leapTime = hopStart + appXPositions.length * hopInterval + 100;
    timers.push(
      setTimeout(() => {
        setPhase('leap-down');
        soundFx.playLandingSound();
      }, leapTime)
    );

    // Phase 6: Finished
    const finishTime = leapTime + 650;
    timers.push(
      setTimeout(() => {
        setPhase('finished');
        if (window.mikoAPI?.finishTaskbarRunway) {
          window.mikoAPI.finishTaskbarRunway();
        }
        onFinished?.();
      }, finishTime)
    );

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, [centerX, onFinished]);

  const blackHoleX = centerX - 224;
  const blackHoleY = 85;
  const blackHoleCenterX = blackHoleX + 40;
  const blackHoleCenterY = blackHoleY + 40;

  // Position of mini Miko
  const getMikoPosition = () => {
    if (phase === 'black-hole-expand') {
      return { x: blackHoleCenterX, y: blackHoleCenterY, scale: 0.2, rotate: -40, opacity: 0 };
    }
    if (phase === 'character-emerge') {
      return { x: blackHoleCenterX + 12, y: blackHoleCenterY - 10, scale: 1.15, rotate: 12, opacity: 1 };
    }
    if (phase === 'black-hole-collapse') {
      return { x: appXPositions[0] - 15, y: taskbarTopY - 20, scale: 1, rotate: 0, opacity: 1 };
    }
    if (phase === 'hopping') {
      const targetX = appXPositions[currentStep] ?? centerX;
      return { x: targetX, y: taskbarTopY, scale: 1, rotate: 6, opacity: 1 };
    }
    if (phase === 'leap-down') {
      return { x: appXPositions[appXPositions.length - 1] + 60, y: taskbarTopY - 50, scale: 1.25, rotate: 360, opacity: 1 };
    }
    return { x: centerX, y: taskbarTopY, scale: 1, rotate: 0, opacity: 0 };
  };

  const mikoPos = getMikoPosition();

  return (
    <div className="miko-real-taskbar-runway-container">
      {/* Notice Banner */}
      <div className="miko-real-taskbar-banner">
        <span className="banner-icon">⏰</span>
        <span className="banner-title">{reminderTitle}</span>
      </div>

      {/* Real Cosmic Black Hole (Floating directly above the real taskbar!) */}
      <div
        className={`miko-real-black-hole ${
          phase === 'black-hole-expand'
            ? 'expand'
            : phase === 'character-emerge'
            ? 'active'
            : phase === 'black-hole-collapse'
            ? 'collapse'
            : 'hidden'
        }`}
        style={{ left: `${blackHoleX}px`, top: `${blackHoleY}px` }}
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

      {/* Runner: 3D Toon Cat or Mini Chibi Miko hopping across real taskbar icons */}
      <div
        className={`miko-real-chibi-hopper ${phase === 'character-emerge' ? 'emerge-anim' : ''} ${
          phase === 'hopping' ? 'hopping-arc' : ''
        } ${phase === 'leap-down' ? 'leap-down-anim' : ''}`}
        style={{
          transform: runnerType === 'cat'
            ? `translate3d(${mikoPos.x - 50}px, ${mikoPos.y - 75}px, 0) scale(${mikoPos.scale})`
            : `translate3d(${mikoPos.x - 27}px, ${mikoPos.y - 60}px, 0) scale(${mikoPos.scale}) rotate(${mikoPos.rotate}deg)`,
          opacity: mikoPos.opacity,
        }}
      >
        {runnerType === 'cat' ? (
          <div className="toon-cat-hopper-box">
            <ToonCat3D
              width={100}
              height={85}
              phase={phase}
              className="toon-cat-runner"
            />
            <div className="toon-cat-shadow" />
          </div>
        ) : runnerType === '3d-character' ? (
          <div className="toon-cat-hopper-box">
            <Character3DCanvas
              width={100}
              height={95}
              mode="runway"
              phase={phase}
              state={phase === 'hopping' ? 'excited' : 'happy'}
              className="toon-cat-runner"
            />
            <div className="toon-cat-shadow" />
          </div>
        ) : (
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
        )}

        <div className="miko-mini-trail">{runnerType === 'cat' ? '🐾' : '✦'}</div>
      </div>

      {/* Impact Sparkles directly over the real physical taskbar icons */}
      {impactSparkles.map((sp) => (
        <div
          key={sp.id}
          className="miko-real-impact-sparkle"
          style={{ left: `${sp.x}px`, top: `${sp.y - 10}px` }}
        >
          <span className="sparkle-symbol">✨</span>
          <span className="impact-ripple" />
        </div>
      ))}
    </div>
  );
};
