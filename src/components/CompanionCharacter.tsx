import React, { useState, useEffect, useRef } from 'react';
import { CharacterState, CharacterModelMode } from '../types';
import { Character3DCanvas } from './Character3DCanvas';

interface CompanionCharacterProps {
  state: CharacterState;
  scale?: number;
  modelMode?: CharacterModelMode;
  enableAnimations?: boolean;
  onClick?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}

export const CompanionCharacter: React.FC<CompanionCharacterProps> = ({
  state,
  scale = 1.0,
  modelMode = 'svg-anime',
  enableAnimations = true,
  onClick,
  onContextMenu,
}) => {
  const [isBlinking, setIsBlinking] = useState<boolean>(false);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isBounceActive, setIsBounceActive] = useState<boolean>(false);
  const [particles, setParticles] = useState<Array<{ id: number; symbol: string; x: number; y: number }>>([]);

  // Mouse drag tracking for moving the window when dragging directly on character
  const isDraggingRef = useRef<boolean>(false);
  const startPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const hasMovedRef = useRef<boolean>(false);

  // Auto blinking effect
  useEffect(() => {
    if (!enableAnimations || state === 'sleepy' || state === 'happy') return;

    let blinkTimer: NodeJS.Timeout;
    const scheduleNextBlink = () => {
      const delay = Math.random() * 3500 + 2500;
      blinkTimer = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => {
          setIsBlinking(false);
          scheduleNextBlink();
        }, 180);
      }, delay);
    };

    scheduleNextBlink();
    return () => clearTimeout(blinkTimer);
  }, [enableAnimations, state]);

  // Click bounce reaction
  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return; // Only primary button
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    startPosRef.current = { x: e.screenX, y: e.screenY };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.screenX - startPosRef.current.x;
    const deltaY = e.screenY - startPosRef.current.y;

    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
      hasMovedRef.current = true;
      startPosRef.current = { x: e.screenX, y: e.screenY };
      if (window.mikoAPI?.moveBy) {
        window.mikoAPI.moveBy(deltaX, deltaY);
      }
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);

    // If mouse didn't drag past threshold, it's an intentional click/pet!
    if (!hasMovedRef.current) {
      triggerClickReaction();
      onClick?.();
    }
  };

  const triggerClickReaction = () => {
    if (!enableAnimations) return;

    setIsBounceActive(true);
    setTimeout(() => setIsBounceActive(false), 550);

    // Spawn cute heart or sparkle particles
    const symbols = ['💖', '✨', '🌸', '⭐'];
    const newParticles = [
      { id: Date.now() + 1, symbol: symbols[Math.floor(Math.random() * symbols.length)], x: 25 + Math.random() * 20, y: 15 },
      { id: Date.now() + 2, symbol: symbols[Math.floor(Math.random() * symbols.length)], x: 55 + Math.random() * 20, y: 20 },
    ];
    setParticles((prev) => [...prev, ...newParticles]);

    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => !newParticles.some((np) => np.id === p.id)));
    }, 900);
  };

  // Expression SVGs based on state with realistic anime rendering
  const renderEyes = () => {
    if (isBlinking) {
      return (
        <g className="miko-eyes blinking">
          {/* Left closed eye */}
          <path d="M 72 120 Q 84 128 96 119" stroke="#3B0764" strokeWidth="4.2" strokeLinecap="round" fill="none" />
          <path d="M 94 119 L 98 116" stroke="#3B0764" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 74 114 Q 84 110 94 114" stroke="#A78BFA" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" fill="none" />
          {/* Right closed eye */}
          <path d="M 124 119 Q 136 128 148 120" stroke="#3B0764" strokeWidth="4.2" strokeLinecap="round" fill="none" />
          <path d="M 126 119 L 122 116" stroke="#3B0764" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M 126 114 Q 136 110 146 114" stroke="#A78BFA" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" fill="none" />
        </g>
      );
    }

    switch (state) {
      case 'happy':
        return (
          <g className="miko-eyes happy-eyes">
            {/* Happy smiling eye curves (anime ^_^) */}
            <path d="M 72 122 Q 84 108 96 121" stroke="#3B0764" strokeWidth="4.5" strokeLinecap="round" fill="none" />
            <path d="M 95 120 L 99 116" stroke="#3B0764" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 124 121 Q 136 108 148 122" stroke="#3B0764" strokeWidth="4.5" strokeLinecap="round" fill="none" />
            <path d="M 125 120 L 121 116" stroke="#3B0764" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="84" cy="112" r="2.5" fill="#F472B6" />
            <circle cx="136" cy="112" r="2.5" fill="#F472B6" />
          </g>
        );

      case 'sad':
        return (
          <g className="miko-eyes sad-eyes">
            {/* Left Eye */}
            <ellipse cx="84" cy="118" rx="12" ry="14" fill="#FFFFFF" />
            <ellipse cx="84" cy="120" rx="10" ry="12" fill="url(#mikoIrisGradSad)" />
            <circle cx="84" cy="121" r="5" fill="#1E1035" />
            <circle cx="80" cy="114" r="3.5" fill="#FFFFFF" opacity="0.9" />
            <circle cx="88" cy="124" r="2" fill="#FFFFFF" opacity="0.8" />
            <path d="M 71 115 Q 84 113 97 122" stroke="#3B0764" strokeWidth="4" strokeLinecap="round" fill="none" />
            {/* Right Eye */}
            <ellipse cx="136" cy="118" rx="12" ry="14" fill="#FFFFFF" />
            <ellipse cx="136" cy="120" rx="10" ry="12" fill="url(#mikoIrisGradSad)" />
            <circle cx="136" cy="121" r="5" fill="#1E1035" />
            <circle cx="132" cy="114" r="3.5" fill="#FFFFFF" opacity="0.9" />
            <circle cx="140" cy="124" r="2" fill="#FFFFFF" opacity="0.8" />
            <path d="M 123 122 Q 136 113 149 115" stroke="#3B0764" strokeWidth="4" strokeLinecap="round" fill="none" />
            {/* Glossy teardrop */}
            <path d="M 98 128 C 101 133, 98 138, 95 138 C 92 138, 90 133, 93 128 Z" fill="#60A5FA" opacity="0.85" />
          </g>
        );

      case 'thinking':
        return (
          <g className="miko-eyes thinking-eyes">
            <ellipse cx="84" cy="118" rx="12" ry="14" fill="#FFFFFF" />
            <ellipse cx="136" cy="118" rx="12" ry="14" fill="#FFFFFF" />
            {/* Glancing upward-right */}
            <ellipse cx="86" cy="115" rx="9.5" ry="11.5" fill="url(#mikoIrisGrad)" />
            <ellipse cx="138" cy="115" rx="9.5" ry="11.5" fill="url(#mikoIrisGrad)" />
            <circle cx="87" cy="114" r="4.5" fill="#1E1035" />
            <circle cx="139" cy="114" r="4.5" fill="#1E1035" />
            <circle cx="89" cy="110" r="3.5" fill="#FFFFFF" />
            <circle cx="141" cy="110" r="3.5" fill="#FFFFFF" />
            <circle cx="82" cy="119" r="2" fill="#FFFFFF" opacity="0.75" />
            <circle cx="134" cy="119" r="2" fill="#FFFFFF" opacity="0.75" />
            <path d="M 71 114 Q 84 108 97 114" stroke="#3B0764" strokeWidth="4.2" strokeLinecap="round" fill="none" />
            <path d="M 123 114 Q 136 108 149 114" stroke="#3B0764" strokeWidth="4.2" strokeLinecap="round" fill="none" />
          </g>
        );

      case 'surprised':
        return (
          <g className="miko-eyes surprised-eyes">
            <circle cx="84" cy="118" r="14" fill="#FFFFFF" stroke="#3B0764" strokeWidth="2.5" />
            <circle cx="136" cy="118" r="14" fill="#FFFFFF" stroke="#3B0764" strokeWidth="2.5" />
            <circle cx="84" cy="118" r="8" fill="url(#mikoIrisGrad)" />
            <circle cx="136" cy="118" r="8" fill="url(#mikoIrisGrad)" />
            <circle cx="84" cy="118" r="4" fill="#1E1035" />
            <circle cx="136" cy="118" r="4" fill="#1E1035" />
            <circle cx="81" cy="113" r="3" fill="#FFFFFF" />
            <circle cx="133" cy="113" r="3" fill="#FFFFFF" />
          </g>
        );

      case 'sleepy':
        return (
          <g className="miko-eyes sleepy-eyes">
            <path d="M 72 119 Q 84 127 96 120" stroke="#3B0764" strokeWidth="4" strokeLinecap="round" fill="none" />
            <path d="M 124 120 Q 136 127 148 119" stroke="#3B0764" strokeWidth="4" strokeLinecap="round" fill="none" />
            <ellipse cx="84" cy="124" rx="6" ry="3" fill="#9333EA" opacity="0.35" />
            <ellipse cx="136" cy="124" rx="6" ry="3" fill="#9333EA" opacity="0.35" />
          </g>
        );

      case 'excited':
        return (
          <g className="miko-eyes excited-eyes">
            <ellipse cx="84" cy="118" rx="12.5" ry="14.5" fill="#FFFFFF" />
            <ellipse cx="136" cy="118" rx="12.5" ry="14.5" fill="#FFFFFF" />
            <ellipse cx="84" cy="118" rx="10" ry="12.5" fill="url(#mikoIrisGrad)" />
            <ellipse cx="136" cy="118" rx="10" ry="12.5" fill="url(#mikoIrisGrad)" />
            {/* Star Sparkle Catchlights */}
            <path d="M 84 110 L 85.5 115 L 90 115 L 86.5 118 L 88 123 L 84 120 L 80 123 L 81.5 118 L 78 115 L 82.5 115 Z" fill="#FFFFFF" />
            <path d="M 136 110 L 137.5 115 L 142 115 L 138.5 118 L 140 123 L 136 120 L 132 123 L 133.5 118 L 130 115 L 134.5 115 Z" fill="#FFFFFF" />
            <circle cx="89" cy="123" r="2" fill="#FFFFFF" />
            <circle cx="141" cy="123" r="2" fill="#FFFFFF" />
            <path d="M 70 115 Q 84 107 98 114" stroke="#3B0764" strokeWidth="4.5" strokeLinecap="round" fill="none" />
            <path d="M 122 114 Q 136 107 150 115" stroke="#3B0764" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          </g>
        );

      default: // Idle & Talking: Ultra-realistic glossy anime eyes matching miko_art1.png
        return (
          <g className="miko-eyes default-eyes">
            {/* Left Eye */}
            <g className="miko-eye-left">
              {/* Sclera */}
              <ellipse cx="84" cy="118" rx="12.5" ry="14.5" fill="#FFFFFF" />
              {/* Eyelid shadow across top sclera */}
              <path d="M 72 114 Q 84 108 96 114 Q 84 118 72 114 Z" fill="#DDD6FE" opacity="0.6" />
              {/* Rich multi-stop Iris */}
              <ellipse cx="84" cy="119" rx="10" ry="12.5" fill="url(#mikoIrisGrad)" />
              {/* Deep dark pupil */}
              <ellipse cx="84" cy="117.5" rx="4.5" ry="5.5" fill="#1E1035" />
              {/* Luminous pinkish-violet lower iris reflection */}
              <path d="M 76 123 Q 84 130 92 123 Q 84 127 76 123 Z" fill="#F472B6" opacity="0.85" />
              {/* Major glossy specular highlight */}
              <circle cx="80" cy="113" r="3.8" fill="#FFFFFF" />
              {/* Secondary specular highlight */}
              <circle cx="88.5" cy="122.5" r="2.2" fill="#FFFFFF" opacity="0.9" />
              {/* Micro sparkle dot */}
              <circle cx="81.5" cy="122" r="1.2" fill="#FFFFFF" opacity="0.75" />
              {/* Dark violet winged upper eyelash line */}
              <path d="M 70 115 Q 84 107 98 114" stroke="#3B0764" strokeWidth="4.5" strokeLinecap="round" fill="none" />
              <path d="M 97 114 L 100 111" stroke="#3B0764" strokeWidth="2.5" strokeLinecap="round" />
              {/* Lower lash accent */}
              <path d="M 78 132 Q 85 133 91 131" stroke="#6D28D9" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" fill="none" />
              {/* Upper eyelid crease */}
              <path d="M 74 107 Q 84 103 94 107" stroke="#A78BFA" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" fill="none" />
            </g>

            {/* Right Eye */}
            <g className="miko-eye-right">
              {/* Sclera */}
              <ellipse cx="136" cy="118" rx="12.5" ry="14.5" fill="#FFFFFF" />
              {/* Eyelid shadow across top sclera */}
              <path d="M 124 114 Q 136 108 148 114 Q 136 118 124 114 Z" fill="#DDD6FE" opacity="0.6" />
              {/* Rich multi-stop Iris */}
              <ellipse cx="136" cy="119" rx="10" ry="12.5" fill="url(#mikoIrisGrad)" />
              {/* Deep dark pupil */}
              <ellipse cx="136" cy="117.5" rx="4.5" ry="5.5" fill="#1E1035" />
              {/* Luminous pinkish-violet lower iris reflection */}
              <path d="M 128 123 Q 136 130 144 123 Q 136 127 128 123 Z" fill="#F472B6" opacity="0.85" />
              {/* Major glossy specular highlight */}
              <circle cx="132" cy="113" r="3.8" fill="#FFFFFF" />
              {/* Secondary specular highlight */}
              <circle cx="140.5" cy="122.5" r="2.2" fill="#FFFFFF" opacity="0.9" />
              {/* Micro sparkle dot */}
              <circle cx="133.5" cy="122" r="1.2" fill="#FFFFFF" opacity="0.75" />
              {/* Dark violet winged upper eyelash line */}
              <path d="M 122 114 Q 136 107 150 115" stroke="#3B0764" strokeWidth="4.5" strokeLinecap="round" fill="none" />
              <path d="M 123 114 L 120 111" stroke="#3B0764" strokeWidth="2.5" strokeLinecap="round" />
              {/* Lower lash accent */}
              <path d="M 129 131 Q 135 133 142 132" stroke="#6D28D9" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" fill="none" />
              {/* Upper eyelid crease */}
              <path d="M 126 107 Q 136 103 146 107" stroke="#A78BFA" strokeWidth="1.4" strokeLinecap="round" opacity="0.7" fill="none" />
            </g>
          </g>
        );
    }
  };

  const renderEyebrows = () => {
    switch (state) {
      case 'happy':
      case 'excited':
        return (
          <g className="miko-eyebrows">
            <path d="M 72 98 Q 84 91 95 97" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M 125 97 Q 136 91 148 98" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round" fill="none" />
          </g>
        );
      case 'sad':
        return (
          <g className="miko-eyebrows">
            <path d="M 72 101 Q 84 96 95 93" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M 125 93 Q 136 96 148 101" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round" fill="none" />
          </g>
        );
      case 'thinking':
        return (
          <g className="miko-eyebrows">
            <path d="M 72 99 Q 84 97 95 98" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M 125 94 Q 136 88 148 93" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round" fill="none" />
          </g>
        );
      case 'surprised':
        return (
          <g className="miko-eyebrows">
            <path d="M 72 92 Q 84 86 95 92" stroke="#8B5CF6" strokeWidth="3.2" strokeLinecap="round" fill="none" />
            <path d="M 125 92 Q 136 86 148 92" stroke="#8B5CF6" strokeWidth="3.2" strokeLinecap="round" fill="none" />
          </g>
        );
      default:
        return (
          <g className="miko-eyebrows">
            <path d="M 72 97 Q 84 93 95 97" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M 125 97 Q 136 93 148 97" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round" fill="none" />
          </g>
        );
    }
  };

  const renderMouth = () => {
    if (state === 'talking') {
      return (
        <g className="miko-mouth talking-mouth-anim">
          <ellipse cx="110" cy="144" rx="7" ry="5.5" fill="#E11D48" />
          <path d="M 104 143 Q 110 148 116 143" stroke="#3B0764" strokeWidth="2.2" fill="none" />
          <path d="M 106 146 Q 110 148 114 146" fill="#FDA4AF" />
        </g>
      );
    }

    switch (state) {
      case 'happy':
        return (
          <g className="miko-mouth happy-mouth">
            <path d="M 102 141 Q 110 152 118 141 Z" fill="#F43F5E" stroke="#3B0764" strokeWidth="2.2" />
            <path d="M 105 144 Q 110 149 115 144" fill="#FDA4AF" />
          </g>
        );
      case 'sad':
        return (
          <g className="miko-mouth sad-mouth">
            <path d="M 103 146 Q 110 139 117 146" stroke="#3B0764" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </g>
        );
      case 'thinking':
        return (
          <g className="miko-mouth thinking-mouth">
            <circle cx="112" cy="143" r="3.5" stroke="#3B0764" strokeWidth="2.2" fill="#FDA4AF" />
          </g>
        );
      case 'surprised':
        return (
          <g className="miko-mouth surprised-mouth">
            <ellipse cx="110" cy="144" rx="5.5" ry="7.5" stroke="#3B0764" strokeWidth="2.5" fill="#E11D48" />
          </g>
        );
      case 'sleepy':
        return (
          <g className="miko-mouth sleepy-mouth">
            <path d="M 105 143 Q 110 146 115 143" stroke="#3B0764" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          </g>
        );
      case 'excited':
        return (
          <g className="miko-mouth excited-mouth">
            {/* Cute cat mouth :3 */}
            <path d="M 102 142 Q 106 146 110 143 Q 114 146 118 142" stroke="#3B0764" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </g>
        );
      default: // Idle: sweet gentle anime smile matching miko_art1.png
        return (
          <g className="miko-mouth idle-mouth">
            <path d="M 103 142 Q 110 147 117 142" stroke="#3B0764" strokeWidth="2.4" strokeLinecap="round" fill="none" />
            <circle cx="110" cy="148" r="1.5" fill="#FDA4AF" opacity="0.6" />
          </g>
        );
    }
  };

  const renderStateParticles = () => {
    if (state === 'sleepy') {
      return (
        <g className="sleepy-particles">
          <text x="165" y="70" className="sleep-z z1" fill="#A855F7" fontSize="20" fontWeight="bold">z</text>
          <text x="178" y="52" className="sleep-z z2" fill="#C084FC" fontSize="26" fontWeight="bold">Z</text>
          <text x="195" y="30" className="sleep-z z3" fill="#E9D5FF" fontSize="32" fontWeight="bold">Z</text>
        </g>
      );
    }
    if (state === 'thinking') {
      return (
        <g className="thinking-particles">
          <text x="165" y="75" className="think-q" fill="#F59E0B" fontSize="28" fontWeight="bold">💡</text>
        </g>
      );
    }
    if (state === 'surprised') {
      return (
        <g className="surprised-particles">
          <text x="160" y="70" className="surprise-mark" fill="#EF4444" fontSize="30" fontWeight="bold">❗</text>
        </g>
      );
    }
    return null;
  };

  return (
    <div
      className={`miko-character-container ${enableAnimations ? 'animated' : 'no-animation'} ${
        isHovered ? 'hovered' : ''
      } ${isBounceActive ? 'bounce' : ''} state-${state}`}
      style={{
        transform: `scale(${scale})`,
        transformOrigin: 'bottom center',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onContextMenu={onContextMenu}
    >
      {/* Floating particles from clicks */}
      {particles.map((p) => (
        <div
          key={p.id}
          className="miko-click-particle"
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
        >
          {p.symbol}
        </div>
      ))}

      {/* 3D Character Mode (character.glb) */}
      {modelMode === '3d-character' ? (
        <div
          className="miko-3d-character-wrapper"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <Character3DCanvas
            state={state}
            isHovered={isHovered}
            isBounceActive={isBounceActive}
          />
        </div>
      ) : modelMode === 'art-anime' ? (
        <div
          className="miko-art-wrapper"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <img
            src="./characters/miko_art1.png"
            alt="Miko Companion"
            className="miko-art-image"
            draggable={false}
          />
          <div className="miko-art-glow" />
        </div>
      ) : (
        /* High-Res Vector SVG Anime Mascot (Exact Vector Twin of miko_art1.png) */
        <div
          className="miko-svg-wrapper"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          <svg
            viewBox="0 0 220 310"
            className="miko-vector-svg"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Lavender Hair Multi-tier Gradient */}
              <linearGradient id="mikoHairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#EDE9FE" />
                <stop offset="35%" stopColor="#DDD6FE" />
                <stop offset="70%" stopColor="#C4B5FD" />
                <stop offset="100%" stopColor="#A78BFA" />
              </linearGradient>

              {/* Back Hair Shadow Gradient */}
              <linearGradient id="mikoHairShadow" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#A78BFA" />
                <stop offset="60%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#6D28D9" />
              </linearGradient>

              {/* Angel Ring Hair Shine Halo Gradient */}
              <linearGradient id="mikoHairShineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
                <stop offset="20%" stopColor="#FFFFFF" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#F5F3FF" stopOpacity="0.95" />
                <stop offset="80%" stopColor="#FFFFFF" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
              </linearGradient>

              {/* Iris Deep Violet Gradient */}
              <linearGradient id="mikoIrisGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#2E1065" />
                <stop offset="35%" stopColor="#581C87" />
                <stop offset="65%" stopColor="#7C3AED" />
                <stop offset="85%" stopColor="#A855F7" />
                <stop offset="100%" stopColor="#F472B6" />
              </linearGradient>

              {/* Sad Eye Watery Blue Gradient */}
              <linearGradient id="mikoIrisGradSad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1E1B4B" />
                <stop offset="50%" stopColor="#4338CA" />
                <stop offset="100%" stopColor="#60A5FA" />
              </linearGradient>

              {/* Porcelain Anime Skin Gradient */}
              <linearGradient id="mikoSkinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFBF5" />
                <stop offset="60%" stopColor="#FFF1E6" />
                <stop offset="100%" stopColor="#FED7AA" />
              </linearGradient>

              {/* Oversized Hoodie Lavender Body */}
              <linearGradient id="mikoHoodieTorsoGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#EDE9FE" />
                <stop offset="50%" stopColor="#DDD6FE" />
                <stop offset="100%" stopColor="#C4B5FD" />
              </linearGradient>

              {/* Oversized Hoodie Pastel Pink (Collar, Pocket, Sleeves) */}
              <linearGradient id="mikoHoodiePinkGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FDF2F8" />
                <stop offset="40%" stopColor="#FCE7F3" />
                <stop offset="85%" stopColor="#FBCFE8" />
                <stop offset="100%" stopColor="#F472B6" />
              </linearGradient>

              {/* Double Tier Skirt Ruffles Gradient */}
              <linearGradient id="mikoSkirtGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FDF2F8" />
                <stop offset="50%" stopColor="#FCE7F3" />
                <stop offset="100%" stopColor="#F9A8D4" />
              </linearGradient>

              {/* Butter-Yellow Center Star Emblem */}
              <linearGradient id="mikoStarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FEF9C3" />
                <stop offset="50%" stopColor="#FEF08A" />
                <stop offset="100%" stopColor="#FDE047" />
              </linearGradient>

              {/* Socks Lavender Gradient */}
              <linearGradient id="mikoSockGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#EDE9FE" />
                <stop offset="100%" stopColor="#C4B5FD" />
              </linearGradient>

              {/* Pink Sneaker Gradient */}
              <linearGradient id="mikoShoeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FCE7F3" />
                <stop offset="60%" stopColor="#F472B6" />
                <stop offset="100%" stopColor="#DB2777" />
              </linearGradient>

              {/* Shoe Rubber Sole */}
              <linearGradient id="mikoShoeSole" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" />
                <stop offset="100%" stopColor="#E2E8F0" />
              </linearGradient>

              {/* Soft Rosy Cheek Blush */}
              <radialGradient id="mikoBlushGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FDA4AF" stopOpacity="0.75" />
                <stop offset="100%" stopColor="#FDA4AF" stopOpacity="0" />
              </radialGradient>

              {/* Ribbon Bows Gradient */}
              <linearGradient id="mikoRibbonGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FDF2F8" />
                <stop offset="40%" stopColor="#F472B6" />
                <stop offset="100%" stopColor="#E11D48" />
              </linearGradient>

              {/* Soft Character Glow Filter */}
              <filter id="mikoGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#C084FC" floodOpacity="0.3" />
              </filter>
            </defs>

            {/* Backdrop Ground Shadow */}
            <ellipse cx="110" cy="301" rx="65" ry="7" fill="#4C1D95" opacity="0.12" />

            <g filter="url(#mikoGlow)">
              {/* Back Hair & Twin Tails (Dynamic Anime S-curves) */}
              <g className="miko-twintails">
                {/* Left Twin Tail Inner Shadow Layer */}
                <path
                  d="M 64 86 C 36 76, 12 106, 10 144 C 8 178, 16 210, 24 238 C 28 250, 42 244, 36 230 C 30 216, 38 184, 46 156 C 52 134, 60 106, 64 86 Z"
                  fill="url(#mikoHairShadow)"
                />
                {/* Left Twin Tail Main Volume */}
                <path
                  d="M 66 84 C 40 72, 16 100, 14 140 C 12 170, 20 200, 28 234 C 30 246, 40 240, 36 228 C 32 214, 42 188, 50 162 C 56 138, 62 110, 66 84 Z"
                  fill="url(#mikoHairGrad)"
                />
                {/* Left Twin Tail Secondary Split Tip */}
                <path
                  d="M 28 220 C 34 236, 48 238, 52 226 C 52 216, 44 200, 40 188 Z"
                  fill="url(#mikoHairGrad)"
                />

                {/* Right Twin Tail Inner Shadow Layer */}
                <path
                  d="M 156 86 C 184 76, 208 106, 210 144 C 212 178, 204 210, 196 238 C 192 250, 178 244, 184 230 C 190 216, 182 184, 174 156 C 168 134, 160 106, 156 86 Z"
                  fill="url(#mikoHairShadow)"
                />
                {/* Right Twin Tail Main Volume */}
                <path
                  d="M 154 84 C 180 72, 204 100, 206 140 C 208 170, 200 200, 192 234 C 190 246, 180 240, 184 228 C 188 214, 178 188, 170 162 C 164 138, 158 110, 154 84 Z"
                  fill="url(#mikoHairGrad)"
                />
                {/* Right Twin Tail Secondary Split Tip */}
                <path
                  d="M 192 220 C 186 236, 172 238, 168 226 C 168 216, 176 200, 180 188 Z"
                  fill="url(#mikoHairGrad)"
                />

                {/* Left Twin Tail Ribbon Bow */}
                <g className="miko-bow-left">
                  {/* Hanging tails */}
                  <path d="M 62 84 C 48 76, 40 70, 36 72 C 42 80, 54 84, 62 84 Z" fill="url(#mikoRibbonGrad)" />
                  <path d="M 62 84 C 48 98, 42 114, 38 122 C 44 116, 56 102, 64 88 Z" fill="url(#mikoRibbonGrad)" />
                  {/* Loops */}
                  <ellipse cx="54" cy="80" rx="9" ry="6" transform="rotate(-20 54 80)" fill="url(#mikoRibbonGrad)" />
                  <ellipse cx="68" cy="78" rx="8" ry="6" transform="rotate(25 68 78)" fill="url(#mikoRibbonGrad)" />
                  {/* Center knot */}
                  <circle cx="62" cy="82" r="3.5" fill="#FDA4AF" stroke="#F472B6" strokeWidth="0.8" />
                </g>

                {/* Right Twin Tail Ribbon Bow */}
                <g className="miko-bow-right">
                  {/* Hanging tails */}
                  <path d="M 158 84 C 172 76, 180 70, 184 72 C 178 80, 166 84, 158 84 Z" fill="url(#mikoRibbonGrad)" />
                  <path d="M 158 84 C 172 98, 178 114, 182 122 C 176 116, 164 102, 156 88 Z" fill="url(#mikoRibbonGrad)" />
                  {/* Loops */}
                  <ellipse cx="166" cy="80" rx="9" ry="6" transform="rotate(20 166 80)" fill="url(#mikoRibbonGrad)" />
                  <ellipse cx="152" cy="78" rx="8" ry="6" transform="rotate(-25 152 78)" fill="url(#mikoRibbonGrad)" />
                  {/* Center knot */}
                  <circle cx="158" cy="82" r="3.5" fill="#FDA4AF" stroke="#F472B6" strokeWidth="0.8" />
                </g>
              </g>

              {/* Legs, Socks & Sneakers */}
              <g className="miko-legs">
                {/* Left Leg (Straight) */}
                <path d="M 93 244 L 91 268 L 103 268 L 105 244 Z" fill="url(#mikoSkinGrad)" />
                {/* Left Knee Blush */}
                <circle cx="97" cy="263" r="3.5" fill="#FDA4AF" opacity="0.5" />
                {/* Left Lavender Sock */}
                <path d="M 91 268 L 89 285 L 103 285 L 103 268 Z" fill="url(#mikoSockGrad)" />
                <path d="M 89 268 Q 97 266 103 268" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none" />
                {/* Left Sneaker */}
                <path d="M 86 283 Q 96 280 105 284 L 105 295 Q 95 298 86 295 Z" fill="url(#mikoShoeGrad)" />
                <path d="M 85 294 Q 95 297 106 294 L 106 298 Q 95 301 85 298 Z" fill="url(#mikoShoeSole)" />
                <path d="M 98 284 Q 106 285 105 294 Q 101 292 98 284 Z" fill="#FFFFFF" />
                {/* White shoelaces */}
                <line x1="89" y1="287" x2="96" y2="287" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />
                <line x1="90" y1="290" x2="97" y2="290" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />

                {/* Right Leg (Cute Inward Pigeon-toe Stance matching miko_art1.png) */}
                <path d="M 119 244 L 129 268 L 140 266 L 129 244 Z" fill="url(#mikoSkinGrad)" />
                {/* Right Knee Blush */}
                <circle cx="134" cy="261" r="3.5" fill="#FDA4AF" opacity="0.5" />
                {/* Right Lavender Sock */}
                <path d="M 129 268 L 136 283 L 148 279 L 140 266 Z" fill="url(#mikoSockGrad)" />
                <path d="M 129 268 Q 135 266 140 266" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none" />
                {/* Right Sneaker */}
                <path d="M 134 280 Q 142 277 151 283 L 147 294 Q 138 293 131 288 Z" fill="url(#mikoShoeGrad)" />
                <path d="M 130 288 Q 138 293 147 294 L 146 298 Q 137 297 129 292 Z" fill="url(#mikoShoeSole)" />
                <path d="M 143 283 Q 152 284 148 293 Q 144 290 143 283 Z" fill="#FFFFFF" />
                {/* White shoelaces */}
                <line x1="135" y1="283" x2="141" y2="286" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />
                <line x1="137" y1="287" x2="143" y2="289" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />
              </g>

              {/* Double-Tiered Ruffled Skirt (Matching miko_art1.png) */}
              <g className="miko-skirt">
                {/* Tier 2: Lower Ruffle (extending beneath Tier 1) */}
                <path
                  d="M 72 230 L 148 230 L 158 250 C 146 253, 134 251, 122 253 C 110 251, 98 253, 86 251 C 74 253, 62 250, 62 250 Z"
                  fill="url(#mikoSkirtGrad)"
                  stroke="#F472B6"
                  strokeWidth="1.2"
                />
                {/* Lower Tier Pleat Creases */}
                <line x1="78" y1="232" x2="72" y2="250" stroke="#F472B6" strokeWidth="1" />
                <line x1="96" y1="232" x2="94" y2="252" stroke="#F472B6" strokeWidth="1" />
                <line x1="110" y1="232" x2="110" y2="252" stroke="#F472B6" strokeWidth="1" />
                <line x1="126" y1="232" x2="128" y2="252" stroke="#F472B6" strokeWidth="1" />
                <line x1="142" y1="232" x2="146" y2="250" stroke="#F472B6" strokeWidth="1" />

                {/* Tier 1: Upper Ruffle */}
                <path
                  d="M 80 216 L 140 216 L 150 236 C 138 239, 126 237, 114 239 C 102 237, 90 239, 78 237 C 72 236, 70 236, 70 236 Z"
                  fill="url(#mikoSkirtGrad)"
                  stroke="#F472B6"
                  strokeWidth="1.4"
                />
                {/* Upper Tier Pleat Creases */}
                <line x1="84" y1="216" x2="80" y2="236" stroke="#F472B6" strokeWidth="1" />
                <line x1="98" y1="216" x2="96" y2="238" stroke="#F472B6" strokeWidth="1" />
                <line x1="110" y1="216" x2="110" y2="238" stroke="#F472B6" strokeWidth="1" />
                <line x1="124" y1="216" x2="126" y2="238" stroke="#F472B6" strokeWidth="1" />
                <line x1="136" y1="216" x2="140" y2="236" stroke="#F472B6" strokeWidth="1" />
              </g>

              {/* Oversized Pastel Hoodie Body */}
              <g className="miko-body">
                {/* Lavender Torso */}
                <path
                  d="M 76 164 Q 68 190 76 216 L 144 216 Q 152 190 144 164 Z"
                  fill="url(#mikoHoodieTorsoGrad)"
                  stroke="#C4B5FD"
                  strokeWidth="1"
                />
                {/* Bottom Ribbed Waistband */}
                <path
                  d="M 74 214 L 146 214 L 144 220 L 76 220 Z"
                  fill="#C4B5FD"
                  stroke="#A78BFA"
                  strokeWidth="0.8"
                />

                {/* Kangaroo Pouch Pocket (Pastel Pink) */}
                <path
                  d="M 84 192 L 136 192 L 142 214 L 78 214 Z"
                  fill="url(#mikoHoodiePinkGrad)"
                  stroke="#F472B6"
                  strokeWidth="1.2"
                />
                {/* Pocket Curved Hand Openings */}
                <path d="M 84 192 Q 81 203 78 214" stroke="#F472B6" strokeWidth="1.6" fill="none" />
                <path d="M 136 192 Q 139 203 142 214" stroke="#F472B6" strokeWidth="1.6" fill="none" />
                <line x1="88" y1="195" x2="132" y2="195" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="2,2" opacity="0.8" />

                {/* Pastel Yellow Star Emblem on Chest */}
                <path
                  d="M 110 167 L 112.8 173.5 L 119.5 173.5 L 114.2 177.8 L 116.2 184.5 L 110 180.5 L 103.8 184.5 L 105.8 177.8 L 100.5 173.5 L 107.2 173.5 Z"
                  fill="url(#mikoStarGrad)"
                  stroke="#F59E0B"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
                <circle cx="110" cy="176" r="3" fill="#FFFFFF" opacity="0.6" />

                {/* Pink Hood Cowl / Collar */}
                <path
                  d="M 76 158 C 72 175, 96 178, 110 178 C 124 178, 148 175, 144 158 C 136 154, 122 153, 110 154 C 98 153, 84 154, 76 158 Z"
                  fill="url(#mikoHoodiePinkGrad)"
                  stroke="#F472B6"
                  strokeWidth="1.4"
                />
                {/* Collar depth crease */}
                <path d="M 86 160 Q 110 168 134 160" stroke="#F472B6" strokeWidth="1" fill="none" opacity="0.7" />

                {/* Lavender Drawstrings with Pink Heart Aglets */}
                {/* Left drawstring */}
                <path d="M 98 166 Q 96 176 94 186" stroke="#A78BFA" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                <path
                  d="M 94 185 C 91 182, 87 185, 90 189 L 94 193 L 98 189 C 101 185, 97 182, 94 185 Z"
                  fill="#F472B6"
                  stroke="#FB7185"
                  strokeWidth="0.8"
                />
                {/* Right drawstring */}
                <path d="M 122 166 Q 124 176 126 186" stroke="#A78BFA" strokeWidth="2.2" strokeLinecap="round" fill="none" />
                <path
                  d="M 126 185 C 123 182, 119 185, 122 189 L 126 193 L 130 189 C 133 185, 129 182, 126 185 Z"
                  fill="#F472B6"
                  stroke="#FB7185"
                  strokeWidth="0.8"
                />

                {/* Left Arm: Puffy Sleeve with Waving Chibi Hand! (matching miko_art1.png) */}
                <g className="miko-arm-waving">
                  {/* Puffy pink sleeve folding up toward wave */}
                  <path
                    d="M 76 164 C 58 170, 44 188, 48 206 C 54 214, 68 212, 74 198 C 78 188, 80 178, 80 172 Z"
                    fill="url(#mikoHoodiePinkGrad)"
                    stroke="#F472B6"
                    strokeWidth="1.2"
                  />
                  <path
                    d="M 48 206 C 44 190, 48 174, 56 162 L 68 166 C 62 176, 62 190, 68 200 Z"
                    fill="url(#mikoHoodiePinkGrad)"
                    stroke="#F472B6"
                    strokeWidth="1"
                  />
                  {/* Lavender Ribbed Wristband */}
                  <path
                    d="M 54 163 L 66 167 L 64 171 L 52 167 Z"
                    fill="#C4B5FD"
                    stroke="#A78BFA"
                    strokeWidth="1"
                  />
                  {/* Waving Anime Hand with cute fingers */}
                  {/* Palm */}
                  <path d="M 55 161 C 51 157, 53 151, 58 151 C 63 151, 66 156, 64 163 Z" fill="url(#mikoSkinGrad)" stroke="#FDBA74" strokeWidth="0.8" />
                  {/* Thumb */}
                  <path d="M 53 157 C 47 155, 45 151, 49 149 C 52 149, 55 153, 55 157 Z" fill="url(#mikoSkinGrad)" stroke="#FDBA74" strokeWidth="0.8" />
                  {/* Index Finger */}
                  <path d="M 56 151 C 54 144, 58 141, 61 143 C 63 145, 60 151, 58 151 Z" fill="url(#mikoSkinGrad)" stroke="#FDBA74" strokeWidth="0.8" />
                  {/* Middle Finger */}
                  <path d="M 59 151 C 59 142, 63 140, 65 142 C 67 145, 63 151, 61 151 Z" fill="url(#mikoSkinGrad)" stroke="#FDBA74" strokeWidth="0.8" />
                  {/* Ring Finger */}
                  <path d="M 62 152 C 63 144, 67 143, 68 145 C 70 148, 66 153, 64 153 Z" fill="url(#mikoSkinGrad)" stroke="#FDBA74" strokeWidth="0.8" />
                  {/* Pinky Finger */}
                  <path d="M 65 154 C 68 148, 71 148, 72 151 C 72 154, 69 157, 67 156 Z" fill="url(#mikoSkinGrad)" stroke="#FDBA74" strokeWidth="0.8" />
                </g>

                {/* Right Arm: Puffy Pink Sleeve Drooping Down-Right */}
                <g className="miko-arm-resting">
                  <path
                    d="M 144 164 C 160 170, 174 186, 172 202 C 170 210, 158 212, 152 202 C 146 192, 142 180, 140 172 Z"
                    fill="url(#mikoHoodiePinkGrad)"
                    stroke="#F472B6"
                    strokeWidth="1.2"
                  />
                  {/* Lavender Ribbed Wristband */}
                  <path
                    d="M 166 200 L 174 204 L 171 210 L 163 206 Z"
                    fill="#C4B5FD"
                    stroke="#A78BFA"
                    strokeWidth="1"
                  />
                  {/* Dainty resting hand */}
                  <path
                    d="M 170 206 C 178 208, 182 214, 176 216 C 172 216, 168 212, 168 208 Z"
                    fill="url(#mikoSkinGrad)"
                    stroke="#FDBA74"
                    strokeWidth="0.8"
                  />
                </g>
              </g>

              {/* Head & Neck Base */}
              <g className="miko-head">
                {/* Neck */}
                <path d="M 103 148 L 103 162 L 117 162 L 117 148 Z" fill="url(#mikoSkinGrad)" />
                {/* Neck Ambient Occlusion Shadow */}
                <path d="M 103 148 Q 110 156 117 148 L 117 154 Q 110 161 103 154 Z" fill="#FDBA74" opacity="0.4" />

                {/* Face Base: Smooth Chibi Anime Contour */}
                <path
                  d="M 62 108 C 60 76, 160 76, 158 108 C 158 138, 138 156, 110 156 C 82 156, 62 138, 62 108 Z"
                  fill="url(#mikoSkinGrad)"
                />

                {/* Forehead Shadow cast by hair bangs (Realistic Depth) */}
                <path
                  d="M 68 96 C 75 110, 85 114, 94 104 C 102 114, 114 116, 124 106 C 132 116, 144 112, 152 96 C 152 88, 68 88, 68 96 Z"
                  fill="#C4B5FD"
                  opacity="0.32"
                />

                {/* Rosy Anime Cheeks */}
                <ellipse cx="74" cy="132" rx="13" ry="8" fill="url(#mikoBlushGrad)" />
                <ellipse cx="146" cy="132" rx="13" ry="8" fill="url(#mikoBlushGrad)" />
                {/* Manga Cheek Hash Lines (///) */}
                <line x1="70" y1="130" x2="74" y2="134" stroke="#FB7185" strokeWidth="1.6" strokeLinecap="round" />
                <line x1="75" y1="129" x2="79" y2="133" stroke="#FB7185" strokeWidth="1.6" strokeLinecap="round" />
                <line x1="80" y1="130" x2="84" y2="134" stroke="#FB7185" strokeWidth="1.6" strokeLinecap="round" />
                <line x1="136" y1="130" x2="140" y2="134" stroke="#FB7185" strokeWidth="1.6" strokeLinecap="round" />
                <line x1="141" y1="129" x2="145" y2="133" stroke="#FB7185" strokeWidth="1.6" strokeLinecap="round" />
                <line x1="146" y1="130" x2="150" y2="134" stroke="#FB7185" strokeWidth="1.6" strokeLinecap="round" />

                {/* Dainty Anime Nose Dot */}
                <circle cx="110" cy="133" r="1.3" fill="#E11D48" opacity="0.65" />
                <circle cx="109.5" cy="132.5" r="0.6" fill="#FFFFFF" opacity="0.8" />

                {/* Eyebrows, Eyes, Mouth & Particles */}
                {renderEyebrows()}
                {renderEyes()}
                {renderMouth()}
                {renderStateParticles()}
              </g>

              {/* Front Hair & Bangs (Multi-strand volume matching miko_art1.png) */}
              <g className="miko-front-hair">
                {/* Left cheek-framing lock */}
                <path
                  d="M 62 90 C 58 112, 60 132, 66 142 C 69 144, 71 138, 70 132 C 68 120, 66 105, 72 92 Z"
                  fill="url(#mikoHairGrad)"
                  stroke="#A78BFA"
                  strokeWidth="0.8"
                />

                {/* Right cheek-framing lock */}
                <path
                  d="M 158 90 C 162 112, 160 132, 154 142 C 151 144, 149 138, 150 132 C 152 120, 154 105, 148 92 Z"
                  fill="url(#mikoHairGrad)"
                  stroke="#A78BFA"
                  strokeWidth="0.8"
                />

                {/* Center Forehead Bangs (Layered strands) */}
                <path
                  d="M 70 82 C 72 102, 82 110, 88 102 C 86 92, 88 84, 88 80 Z"
                  fill="url(#mikoHairGrad)"
                  stroke="#A78BFA"
                  strokeWidth="0.8"
                />
                <path
                  d="M 86 78 C 88 100, 98 110, 102 96 C 98 88, 100 82, 100 76 Z"
                  fill="url(#mikoHairGrad)"
                  stroke="#A78BFA"
                  strokeWidth="0.8"
                />
                <path
                  d="M 100 76 C 102 92, 114 108, 120 94 C 116 86, 118 80, 118 76 Z"
                  fill="url(#mikoHairGrad)"
                  stroke="#A78BFA"
                  strokeWidth="0.8"
                />
                <path
                  d="M 118 76 C 122 96, 134 108, 138 98 C 136 90, 142 86, 146 82 Z"
                  fill="url(#mikoHairGrad)"
                  stroke="#A78BFA"
                  strokeWidth="0.8"
                />

                {/* Angel Ring Hair Shine (Curved luminous halo across bangs) */}
                <path
                  d="M 72 88 Q 110 78 148 88 Q 110 82 72 88 Z"
                  fill="url(#mikoHairShineGrad)"
                />

                {/* Two Stacked Pink Bow Hairpins on Right Bangs (as in miko_art1.png) */}
                {/* Upper Bow */}
                <g className="miko-clip-upper">
                  <ellipse cx="136" cy="86" rx="4" ry="2.5" transform="rotate(-15 136 86)" fill="url(#mikoRibbonGrad)" />
                  <ellipse cx="144" cy="86" rx="4" ry="2.5" transform="rotate(15 144 86)" fill="url(#mikoRibbonGrad)" />
                  <circle cx="140" cy="86" r="1.8" fill="#FCE7F3" stroke="#F472B6" strokeWidth="0.6" />
                </g>
                {/* Lower Bow */}
                <g className="miko-clip-lower">
                  <ellipse cx="139" cy="96" rx="4" ry="2.5" transform="rotate(-15 139 96)" fill="url(#mikoRibbonGrad)" />
                  <ellipse cx="147" cy="96" rx="4" ry="2.5" transform="rotate(15 147 96)" fill="url(#mikoRibbonGrad)" />
                  <circle cx="143" cy="96" r="1.8" fill="#FCE7F3" stroke="#F472B6" strokeWidth="0.6" />
                </g>

                {/* Ahoge / Sprout Hair Lock on Crown */}
                <path
                  d="M 110 66 Q 116 46 132 50 Q 120 56 112 68 Z"
                  fill="#DDD6FE"
                  stroke="#A78BFA"
                  strokeWidth="0.8"
                />
              </g>
            </g>
          </svg>
        </div>
      )}

      {/* Floating Drag Handle at base for easy desktop moving */}
      <div className="miko-drag-handle" title="Drag to move Miko around your desktop">
        <span className="miko-drag-icon">🐾</span>
        <span className="miko-drag-text">Move Miko</span>
      </div>
    </div>
  );
};
