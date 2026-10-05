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

  // Expression SVGs based on state
  const renderEyes = () => {
    if (isBlinking) {
      return (
        <g className="miko-eyes blinking">
          <path d="M 68 118 Q 80 126 92 118" stroke="#4A326E" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          <path d="M 128 118 Q 140 126 152 118" stroke="#4A326E" strokeWidth="4.5" strokeLinecap="round" fill="none" />
        </g>
      );
    }

    switch (state) {
      case 'happy':
        return (
          <g className="miko-eyes happy-eyes">
            <path d="M 66 122 Q 80 106 94 122" stroke="#4A326E" strokeWidth="5" strokeLinecap="round" fill="none" />
            <path d="M 126 122 Q 140 106 154 122" stroke="#4A326E" strokeWidth="5" strokeLinecap="round" fill="none" />
            <circle cx="80" cy="110" r="2" fill="#FF85C0" />
            <circle cx="140" cy="110" r="2" fill="#FF85C0" />
          </g>
        );

      case 'sad':
        return (
          <g className="miko-eyes sad-eyes">
            <ellipse cx="80" cy="120" rx="14" ry="12" fill="#4A326E" />
            <ellipse cx="140" cy="120" rx="14" ry="12" fill="#4A326E" />
            <ellipse cx="80" cy="122" rx="10" ry="8" fill="#8B5CF6" />
            <ellipse cx="140" cy="122" rx="10" ry="8" fill="#8B5CF6" />
            <circle cx="76" cy="116" r="4.5" fill="#FFFFFF" />
            <circle cx="136" cy="116" r="4.5" fill="#FFFFFF" />
            {/* Cute teardrop */}
            <path d="M 94 128 C 96 132, 94 136, 92 136 C 90 136, 88 132, 90 128 Z" fill="#60A5FA" />
          </g>
        );

      case 'thinking':
        return (
          <g className="miko-eyes thinking-eyes">
            {/* Looking upward right */}
            <ellipse cx="80" cy="118" rx="13" ry="15" fill="#4A326E" />
            <ellipse cx="140" cy="118" rx="13" ry="15" fill="#4A326E" />
            <ellipse cx="82" cy="115" rx="9" ry="11" fill="#7C3AED" />
            <ellipse cx="142" cy="115" rx="9" ry="11" fill="#7C3AED" />
            <circle cx="84" cy="112" r="4" fill="#FFFFFF" />
            <circle cx="144" cy="112" r="4" fill="#FFFFFF" />
            <circle cx="78" cy="120" r="2" fill="#FFFFFF" opacity="0.8" />
            <circle cx="138" cy="120" r="2" fill="#FFFFFF" opacity="0.8" />
          </g>
        );

      case 'surprised':
        return (
          <g className="miko-eyes surprised-eyes">
            <circle cx="80" cy="118" r="15" fill="#FFFFFF" stroke="#4A326E" strokeWidth="3" />
            <circle cx="140" cy="118" r="15" fill="#FFFFFF" stroke="#4A326E" strokeWidth="3" />
            <circle cx="80" cy="118" r="8" fill="#4A326E" />
            <circle cx="140" cy="118" r="8" fill="#4A326E" />
            <circle cx="77" cy="114" r="3.5" fill="#FFFFFF" />
            <circle cx="137" cy="114" r="3.5" fill="#FFFFFF" />
          </g>
        );

      case 'sleepy':
        return (
          <g className="miko-eyes sleepy-eyes">
            <path d="M 68 116 Q 80 126 92 118" stroke="#4A326E" strokeWidth="4.5" strokeLinecap="round" fill="none" />
            <path d="M 128 116 Q 140 126 152 118" stroke="#4A326E" strokeWidth="4.5" strokeLinecap="round" fill="none" />
            <ellipse cx="80" cy="122" rx="6" ry="3" fill="#9333EA" opacity="0.5" />
            <ellipse cx="140" cy="122" rx="6" ry="3" fill="#9333EA" opacity="0.5" />
          </g>
        );

      case 'excited':
        return (
          <g className="miko-eyes excited-eyes">
            <ellipse cx="80" cy="118" rx="14" ry="16" fill="#4A326E" />
            <ellipse cx="140" cy="118" rx="14" ry="16" fill="#4A326E" />
            <ellipse cx="80" cy="118" rx="10" ry="12" fill="#A855F7" />
            <ellipse cx="140" cy="118" rx="10" ry="12" fill="#A855F7" />
            {/* Star pupil shine */}
            <path d="M 80 110 L 82 115 L 87 115 L 83 118 L 85 123 L 80 120 L 75 123 L 77 118 L 73 115 L 78 115 Z" fill="#FFFFFF" />
            <path d="M 140 110 L 142 115 L 147 115 L 143 118 L 145 123 L 140 120 L 135 123 L 137 118 L 133 115 L 138 115 Z" fill="#FFFFFF" />
          </g>
        );

      default: // idle & talking
        return (
          <g className="miko-eyes default-eyes">
            <ellipse cx="80" cy="118" rx="13" ry="16" fill="#4A326E" />
            <ellipse cx="140" cy="118" rx="13" ry="16" fill="#4A326E" />
            {/* Iris gradient inner */}
            <ellipse cx="80" cy="120" rx="9" ry="12" fill="#8B5CF6" />
            <ellipse cx="140" cy="120" rx="9" ry="12" fill="#8B5CF6" />
            {/* High-res highlights */}
            <circle cx="76" cy="112" r="5" fill="#FFFFFF" />
            <circle cx="136" cy="112" r="5" fill="#FFFFFF" />
            <circle cx="84" cy="122" r="2.5" fill="#FFFFFF" opacity="0.85" />
            <circle cx="144" cy="122" r="2.5" fill="#FFFFFF" opacity="0.85" />
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
            <path d="M 68 96 Q 80 90 92 98" stroke="#7C3AED" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M 128 98 Q 140 90 152 96" stroke="#7C3AED" strokeWidth="3" strokeLinecap="round" fill="none" />
          </g>
        );
      case 'sad':
        return (
          <g className="miko-eyebrows">
            <path d="M 68 100 Q 80 94 92 92" stroke="#7C3AED" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M 128 92 Q 140 94 152 100" stroke="#7C3AED" strokeWidth="3" strokeLinecap="round" fill="none" />
          </g>
        );
      case 'thinking':
        return (
          <g className="miko-eyebrows">
            <path d="M 68 98 Q 80 96 92 97" stroke="#7C3AED" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M 128 94 Q 140 88 152 92" stroke="#7C3AED" strokeWidth="3" strokeLinecap="round" fill="none" />
          </g>
        );
      case 'surprised':
        return (
          <g className="miko-eyebrows">
            <path d="M 68 90 Q 80 84 92 92" stroke="#7C3AED" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M 128 92 Q 140 84 152 90" stroke="#7C3AED" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          </g>
        );
      default:
        return (
          <g className="miko-eyebrows">
            <path d="M 68 96 Q 80 92 92 96" stroke="#7C3AED" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M 128 96 Q 140 92 152 96" stroke="#7C3AED" strokeWidth="3" strokeLinecap="round" fill="none" />
          </g>
        );
    }
  };

  const renderMouth = () => {
    if (state === 'talking') {
      return (
        <g className="miko-mouth talking-mouth-anim">
          <ellipse cx="110" cy="144" rx="8" ry="6" fill="#E11D48" />
          <path d="M 104 142 Q 110 148 116 142" stroke="#4A326E" strokeWidth="2.5" fill="none" />
        </g>
      );
    }

    switch (state) {
      case 'happy':
        return (
          <g className="miko-mouth happy-mouth">
            <path d="M 100 140 Q 110 154 120 140 Z" fill="#F43F5E" stroke="#4A326E" strokeWidth="2.5" />
            <path d="M 105 142 Q 110 148 115 142" fill="#FDA4AF" />
          </g>
        );
      case 'sad':
        return (
          <g className="miko-mouth sad-mouth">
            <path d="M 102 146 Q 110 138 118 146" stroke="#4A326E" strokeWidth="3" strokeLinecap="round" fill="none" />
          </g>
        );
      case 'thinking':
        return (
          <g className="miko-mouth thinking-mouth">
            <circle cx="113" cy="143" r="4" stroke="#4A326E" strokeWidth="2.5" fill="#FDA4AF" />
          </g>
        );
      case 'surprised':
        return (
          <g className="miko-mouth surprised-mouth">
            <ellipse cx="110" cy="144" rx="6" ry="8" stroke="#4A326E" strokeWidth="3" fill="#E11D48" />
          </g>
        );
      case 'sleepy':
        return (
          <g className="miko-mouth sleepy-mouth">
            <path d="M 104 143 Q 110 146 116 143" stroke="#4A326E" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </g>
        );
      case 'excited':
        return (
          <g className="miko-mouth excited-mouth">
            {/* Cute cat mouth :3 */}
            <path d="M 100 141 Q 105 146 110 142 Q 115 146 120 141" stroke="#4A326E" strokeWidth="3" strokeLinecap="round" fill="none" />
          </g>
        );
      default: // idle
        return (
          <g className="miko-mouth idle-mouth">
            <path d="M 102 141 Q 110 147 118 141" stroke="#4A326E" strokeWidth="2.8" strokeLinecap="round" fill="none" />
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
            src="./characters/miko_art.jpg"
            alt="Miko Companion"
            className="miko-art-image"
            draggable={false}
          />
          <div className="miko-art-glow" />
        </div>
      ) : (
        /* High-Res Vector SVG Anime Mascot */
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
              <linearGradient id="mikoHairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#DDD6FE" />
                <stop offset="60%" stopColor="#C4B5FD" />
                <stop offset="100%" stopColor="#A78BFA" />
              </linearGradient>

              <linearGradient id="mikoSkinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FFF7ED" />
                <stop offset="100%" stopColor="#FFEDD5" />
              </linearGradient>

              <linearGradient id="mikoHoodieGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#EDE9FE" />
                <stop offset="100%" stopColor="#DDD6FE" />
              </linearGradient>

              <linearGradient id="mikoSkirtGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#FCE7F3" />
                <stop offset="100%" stopColor="#FBCFE8" />
              </linearGradient>

              <radialGradient id="mikoBlushGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FDA4AF" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#FDA4AF" stopOpacity="0" />
              </radialGradient>

              <filter id="mikoGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#C084FC" floodOpacity="0.35" />
              </filter>
            </defs>

            {/* Backdrop character aura */}
            <ellipse cx="110" cy="300" rx="65" ry="8" fill="#4C1D95" opacity="0.15" />

            <g filter="url(#mikoGlow)">
              {/* Back Hair / Twin Tails */}
              <g className="miko-twintails">
                {/* Left tail */}
                <path
                  d="M 52 90 C 15 110, -5 170, 15 225 C 25 250, 45 235, 38 215 C 28 175, 45 130, 65 110 Z"
                  fill="url(#mikoHairGrad)"
                />
                {/* Right tail */}
                <path
                  d="M 168 90 C 205 110, 225 170, 205 225 C 195 250, 175 235, 182 215 C 192 175, 175 130, 155 110 Z"
                  fill="url(#mikoHairGrad)"
                />
              </g>

              {/* Legs & Shoes */}
              <g className="miko-legs">
                {/* Left leg */}
                <path d="M 92 245 L 88 285 L 98 285 L 102 245 Z" fill="url(#mikoSkinGrad)" />
                {/* Right leg */}
                <path d="M 118 245 L 122 285 L 132 285 L 128 245 Z" fill="url(#mikoSkinGrad)" />
                {/* Left shoe */}
                <path d="M 82 283 Q 93 280 102 283 L 102 294 Q 90 296 82 294 Z" fill="#F472B6" />
                <path d="M 83 293 Q 92 295 101 293" stroke="#FFFFFF" strokeWidth="2" fill="none" />
                {/* Right shoe */}
                <path d="M 118 283 Q 127 280 138 283 L 138 294 Q 130 296 118 294 Z" fill="#F472B6" />
                <path d="M 119 293 Q 128 295 137 293" stroke="#FFFFFF" strokeWidth="2" fill="none" />
              </g>

              {/* Skirt */}
              <g className="miko-skirt">
                <path
                  d="M 75 220 L 145 220 L 158 250 L 62 250 Z"
                  fill="url(#mikoSkirtGrad)"
                  stroke="#F472B6"
                  strokeWidth="1.5"
                />
                {/* Pleats */}
                <line x1="88" y1="220" x2="82" y2="250" stroke="#F472B6" strokeWidth="1" />
                <line x1="110" y1="220" x2="110" y2="250" stroke="#F472B6" strokeWidth="1" />
                <line x1="132" y1="220" x2="138" y2="250" stroke="#F472B6" strokeWidth="1" />
              </g>

              {/* Body / Cute Pastel Hoodie */}
              <g className="miko-body">
                <path
                  d="M 70 160 Q 60 190 75 225 L 145 225 Q 160 190 150 160 Z"
                  fill="url(#mikoHoodieGrad)"
                />
                {/* Hoodie pocket */}
                <path
                  d="M 85 195 Q 110 200 135 195 L 140 220 L 80 220 Z"
                  fill="#FBCFE8"
                  opacity="0.8"
                />
                {/* Center Pastel Star Emblem */}
                <path
                  d="M 110 172 L 112 178 L 118 178 L 113 182 L 115 188 L 110 184 L 105 188 L 107 182 L 102 178 L 108 178 Z"
                  fill="#FDE047"
                  stroke="#F59E0B"
                  strokeWidth="0.8"
                />
                {/* Sleeves / Cute Paws */}
                <path d="M 68 165 C 50 180, 48 205, 58 215 C 64 218, 72 205, 75 195 Z" fill="#FBCFE8" />
                <path d="M 152 165 C 170 180, 172 205, 162 215 C 156 218, 148 205, 145 195 Z" fill="#FBCFE8" />
                {/* Sailor Ribbon Bow */}
                <path d="M 110 162 L 95 172 L 105 160 L 110 162 L 115 160 L 125 172 Z" fill="#F43F5E" />
                <circle cx="110" cy="162" r="4" fill="#FDE047" />
              </g>

              {/* Head & Neck */}
              <g className="miko-head">
                <rect x="102" y="148" width="16" height="15" fill="url(#mikoSkinGrad)" />
                {/* Face base */}
                <path
                  d="M 60 110 C 60 70, 160 70, 160 110 C 160 155, 135 168, 110 168 C 85 168, 60 155, 60 110 Z"
                  fill="url(#mikoSkinGrad)"
                />

                {/* Cute Cheeks Blush */}
                <ellipse cx="72" cy="132" rx="12" ry="7" fill="url(#mikoBlushGrad)" />
                <ellipse cx="148" cy="132" rx="12" ry="7" fill="url(#mikoBlushGrad)" />
                {/* Blush marks */}
                <line x1="68" y1="130" x2="72" y2="134" stroke="#FB7185" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="74" y1="130" x2="78" y2="134" stroke="#FB7185" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="142" y1="130" x2="146" y2="134" stroke="#FB7185" strokeWidth="1.5" strokeLinecap="round" />
                <line x1="148" y1="130" x2="152" y2="134" stroke="#FB7185" strokeWidth="1.5" strokeLinecap="round" />

                {/* Eyebrows, Eyes, and Mouth components */}
                {renderEyebrows()}
                {renderEyes()}
                {renderMouth()}
                {renderStateParticles()}
              </g>

              {/* Front Hair & Bangs */}
              <g className="miko-front-hair">
                {/* Left bangs */}
                <path d="M 58 100 C 55 125, 68 135, 72 120 C 75 105, 85 92, 85 85 Z" fill="url(#mikoHairGrad)" />
                {/* Center bangs */}
                <path d="M 80 82 C 85 108, 98 112, 102 98 C 105 110, 120 112, 124 92 C 126 108, 140 108, 142 85 Z" fill="url(#mikoHairGrad)" />
                {/* Right bangs */}
                <path d="M 138 85 C 138 92, 148 105, 151 120 C 155 135, 168 125, 165 100 Z" fill="url(#mikoHairGrad)" />
                {/* Hair bows */}
                {/* Left bow */}
                <circle cx="58" cy="88" r="7" fill="#F472B6" />
                <path d="M 58 88 L 48 80 L 50 96 Z" fill="#F472B6" />
                <path d="M 58 88 L 68 80 L 66 96 Z" fill="#F472B6" />
                {/* Right bow */}
                <circle cx="162" cy="88" r="7" fill="#F472B6" />
                <path d="M 162 88 L 152 80 L 154 96 Z" fill="#F472B6" />
                <path d="M 162 88 L 172 80 L 170 96 Z" fill="#F472B6" />
                {/* Ahoge / cute hair sprout on top */}
                <path d="M 110 65 Q 115 45 130 50 Q 118 55 112 66 Z" fill="#C4B5FD" />
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
