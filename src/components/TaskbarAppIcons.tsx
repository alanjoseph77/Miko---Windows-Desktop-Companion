import React from 'react';

export interface TaskbarApp {
  id: string;
  name: string;
  renderIcon: (active: boolean) => React.ReactNode;
}

export const TASKBAR_APPS: TaskbarApp[] = [
  {
    id: 'start',
    name: 'Windows Start',
    renderIcon: () => (
      <svg viewBox="0 0 24 24" width="26" height="26">
        <rect x="2" y="2" width="9.2" height="9.2" rx="1.2" fill="#00adef" />
        <rect x="12.8" y="2" width="9.2" height="9.2" rx="1.2" fill="#00adef" />
        <rect x="2" y="12.8" width="9.2" height="9.2" rx="1.2" fill="#00adef" />
        <rect x="12.8" y="12.8" width="9.2" height="9.2" rx="1.2" fill="#00adef" />
      </svg>
    ),
  },
  {
    id: 'antigravity',
    name: 'Antigravity IDE',
    renderIcon: () => (
      <svg viewBox="0 0 24 24" width="26" height="26">
        <defs>
          <linearGradient id="agy-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="35%" stopColor="#a855f7" />
            <stop offset="70%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>
        <rect width="24" height="24" rx="5" fill="#111827" />
        <path
          d="M5 19 C7 11, 10 5.5, 12 5.5 C14 5.5, 17 11, 19 19"
          fill="none"
          stroke="url(#agy-grad)"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
        <path
          d="M7.5 14.5 H16.5"
          stroke="url(#agy-grad)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: 'vscode',
    name: 'VS Code',
    renderIcon: () => (
      <svg viewBox="0 0 24 24" width="26" height="26">
        <path d="M17.5 2.5 L6.5 11 L10 14 L17.5 8 Z" fill="#0065a9" />
        <path d="M17.5 21.5 L6.5 13 L10 10 L17.5 16 Z" fill="#007acc" />
        <path d="M17.5 2.5 L22.5 5.5 V18.5 L17.5 21.5 Z" fill="#1f9cf0" />
        <path d="M1.5 12 L6.5 8 L10 12 L6.5 16 Z" fill="#0065a9" />
      </svg>
    ),
  },
  {
    id: 'edge',
    name: 'Microsoft Edge',
    renderIcon: () => (
      <svg viewBox="0 0 24 24" width="26" height="26">
        <defs>
          <linearGradient id="edge-swirl" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0c80df" />
            <stop offset="50%" stopColor="#0fb5ae" />
            <stop offset="100%" stopColor="#24d17c" />
          </linearGradient>
        </defs>
        <circle cx="12" cy="12" r="11" fill="none" />
        <path
          d="M12 2C6.48 2 2 6.48 2 12c0 3.3 1.6 6.2 4.1 8 0-4.5 3.5-7 7.9-7 4.2 0 6 2.3 6 4.5 0 2.8-2.6 4.5-5.5 4.5 -4.5 0-7.5-3-7.5-6.5C7 10 11 6 16.5 7.5 15 4 13.5 2 12 2z"
          fill="url(#edge-swirl)"
        />
      </svg>
    ),
  },
  {
    id: 'github',
    name: 'GitHub Desktop / Docker',
    renderIcon: () => (
      <svg viewBox="0 0 24 24" width="26" height="26">
        <circle cx="12" cy="12" r="11" fill="#1d63ed" />
        <path
          d="M6 14 C6 11, 8.5 9.5, 12 9.5 C15.5 9.5, 18 11, 18 14 C17 17, 14 17.5, 12 17.5 C10 17.5, 7 17, 6 14 Z"
          fill="#ffffff"
        />
        <circle cx="9.5" cy="12.5" r="1.2" fill="#1d63ed" />
        <circle cx="14.5" cy="12.5" r="1.2" fill="#1d63ed" />
      </svg>
    ),
  },
  {
    id: 'explorer',
    name: 'File Explorer',
    renderIcon: () => (
      <svg viewBox="0 0 24 24" width="26" height="26">
        <path
          d="M2 6 C2 4.9 2.9 4 4 4 H9 L11 6 H20 C21.1 6 22 6.9 22 8 V18 C22 19.1 21.1 20 20 20 H4 C2.9 20 2 19.1 2 18 Z"
          fill="#f59e0b"
        />
        <rect x="4" y="9" width="16" height="9" rx="1.5" fill="#3b82f6" />
        <path
          d="M4 11 H20 V18 C20 18.6 19.6 19 19 19 H5 C4.4 19 4 18.6 4 18 Z"
          fill="#fbbf24"
        />
      </svg>
    ),
  },
  {
    id: 'remote',
    name: 'AnyDesk / Remote Tool',
    renderIcon: () => (
      <svg viewBox="0 0 24 24" width="26" height="26">
        <rect width="24" height="24" rx="6" fill="#00539c" />
        <path
          d="M7 12 L10 8.5 V10.8 H14 V8.5 L17 12 L14 15.5 V13.2 H10 V15.5 Z"
          fill="#ffffff"
        />
      </svg>
    ),
  },
  {
    id: 'miko',
    name: 'Miko Companion',
    renderIcon: () => (
      <svg viewBox="0 0 24 24" width="26" height="26">
        <circle cx="12" cy="12" r="11" fill="#1e1b4b" stroke="#8b5cf6" strokeWidth="1.5" />
        <ellipse
          cx="12"
          cy="12"
          rx="9"
          ry="3.5"
          fill="none"
          stroke="#c084fc"
          strokeWidth="1.2"
          transform="rotate(-30 12 12)"
        />
        <circle cx="12" cy="12" r="3.2" fill="#f472b6" />
      </svg>
    ),
  },
];
