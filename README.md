# 🌸 Miko - Windows Desktop AI Companion

Miko is a cute, anime-style desktop companion application engineered for Windows. She floats directly over your desktop without a traditional window border or rectangular background, keeping you motivated, focused, and organized with cheerful micro-animations, a Pomodoro timer, task checklist, and interactive local AI chat.

![Miko Companion](./public/characters/miko_art1.png)

---

## ✨ Features

- **Transparent Desktop Mascot**: Frameless, transparent Electron window that lives seamlessly on top of your Windows desktop and active applications.
- **Anime Character System**:
  - **Dynamic Vector SVG Mascot**: Crisp multi-layer vector anime character with dynamic blinking, breathing, ear twitches, cheek blushes, mouth animation, and 8 emotional expressions (`idle`, `happy`, `sad`, `thinking`, `surprised`, `talking`, `sleepy`, `excited`).
  - **Art Mode**: Switch between vector SVG and high-resolution sticker art asset.
  - **Live2D Cubism Ready**: Pre-architected integration layer (`Live2DManager`, `ModelLoader`, `types`) ready to accept official Live2D Cubism models.
- **Interactive Micro-Interactions**:
  - Click / Pet Miko: Triggers cheerful spring bounce, hearts/stars particles, and playful reactions.
  - Hover: Miko perks up and tilts curiously.
  - Periodic Chatter: Offers friendly encouragement and hydration reminders.
- **Speech Bubble System**: Floating speech bubble with animated entry/exit, tail pointer, multiline support, and configurable auto-dismiss duration.
- **Glassmorphism Control Menu**: Floating control panel accessible via click, right-click, or the top menu button.
- **Smart AI Chat**:
  - Local AI companion engine with supportive anime personality.
  - Modular `AIProvider` interface ready to connect to OpenAI, Claude, Ollama, or local LLMs.
- **Productivity Suite**:
  - **One-Time Reminders & Alerts**: Set quick 1-click reminders (+5m, +15m, +25m, +45m, +60m) or custom reminders with audio chime, desktop bring-to-front alert popup, and snooze.
  - **Pomodoro Focus Timer**: 25-minute deep work and 5-minute break sessions with audio-visual notifications and session tracking.
  - **Daily Task Checklist**: Manage daily goals with progress tracking and celebration triggers.
- **Full Customization Settings**:
  - Scale adjustment (75% – 135%)
  - Screen position reset
  - Always-on-top toggle
  - Speech bubble toggles and duration slider
  - Idle chatter frequency
  - Color themes: Pastel Lavender, Midnight Dark Glass, Pure Blossom Light
  - Reduce motion / battery saver mode
- **Windows Integration**:
  - Remembers screen coordinates between app restarts.
  - System Tray icon with quick controls (Show, Hide, Focus Mode, Settings, Exit).
  - Frameless dragging (`-webkit-app-region: drag` and direct pointer tracking).
  - Launch on Windows startup toggle.

---

## 🛠️ Tech Stack

- **Framework**: [Electron](https://www.electronjs.org/) (Secure context isolation, frameless transparent window)
- **UI Library**: [React 18](https://react.dev/)
- **Build Tool**: [Vite 6](https://vitejs.dev/) & [esbuild](https://esbuild.github.io/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict mode, zero `any` types)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Packaging**: [Electron Builder](https://www.electron.build/) (NSIS Installer & Portable Windows `.exe`)

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)
- Windows 10/11

### 1. Installation

```bash
cd compaion
npm install
```

### 2. Run in Development Mode

Starts the Vite development server with hot module reloading and launches the Electron companion window:

```bash
npm run dev
```

### 3. Run Production Build Locally

Builds the production renderer and Electron bundles and runs them:

```bash
npm run build
npm run preview
# Or directly launch the compiled Electron app:
npx cross-env NODE_ENV=production electron dist-electron/main.js
```

---

## 📦 Building the Windows Executable (.exe)

Miko is configured for Windows distribution using `electron-builder`:

### Build Portable Executable
Generates a standalone portable `.exe` in `release/`:
```bash
npm run dist:portable
```

### Build Full Windows Installer (.exe & NSIS)
Generates the complete Windows installer and portable binary:
```bash
npm run dist
```

### Build Unpacked Directory (Fastest inspection)
Builds the standalone unpacked Windows directory in `release/win-unpacked/`:
```bash
npm run dist:dir
```

---

## 📁 Project Structure

```
compaion/
├── electron/
│   ├── main.ts             # Electron main process (window bounds, tray, transparency)
│   ├── preload.ts          # Type-safe context isolation IPC bridge
│   ├── ipc.ts              # IPC handlers registration
│   └── dev-runner.ts       # Development runner with instant esbuild compilation
│
├── src/
│   ├── ai/
│   │   ├── AIProvider.ts       # AI Service singleton & dispatcher
│   │   ├── MockAIProvider.ts   # Local companion dialogue & emotion logic
│   │   └── types.ts            # AI interface definitions
│   │
│   ├── live2d/
│   │   ├── Live2DManager.ts    # Live2D Cubism runtime manager & state mapper
│   │   ├── ModelLoader.ts      # Model3.json validator and asset loader
│   │   └── types.ts            # Cubism parameter & motion interfaces
│   │
│   ├── components/
│   │   ├── CompanionCharacter.tsx # Multi-state SVG anime character & art modes
│   │   ├── SpeechBubble.tsx       # Floating glassmorphic speech bubble
│   │   ├── CompanionMenu.tsx      # Quick floating navigation menu
│   │   ├── ChatPanel.tsx          # Interactive companion chat interface
│   │   ├── FocusTimer.tsx         # Pomodoro 25:00 focus timer
│   │   ├── TaskPanel.tsx          # Today's task checklist
│   │   ├── SettingsPanel.tsx      # Preferences, scale, themes, Live2D guide
│   │   ├── MoodPanel.tsx          # Live expression & mood switcher
│   │   └── FloatingPanel.tsx      # Reusable glassmorphic panel container
│   │
│   ├── hooks/
│   │   ├── useCompanion.ts     # Character state, speech, and idle chatter
│   │   ├── useSettings.ts      # LocalStorage & IPC settings synchronization
│   │   └── useFocusTimer.ts    # Countdown timer engine
│   │
│   ├── store/
│   │   └── companionStore.ts   # Local persistence defaults and accessors
│   │
│   ├── types/
│   │   └── index.ts            # TypeScript definitions (Zero `any`)
│   │
│   ├── styles/
│   │   ├── globals.css         # CSS variables, themes, reset
│   │   └── companion.css       # Glassmorphism, animations, keyframes
│   │
│   ├── App.tsx             # Root React application
│   └── main.tsx            # React DOM mounting
│
├── public/
│   ├── characters/         # Anime illustration assets
│   └── icons/              # App & Tray icons
│
├── dist/                   # Compiled Vite web assets
├── dist-electron/          # Compiled Electron main & preload scripts
├── package.json
├── tsconfig.json
├── tsconfig.electron.json
└── vite.config.ts
```

---

## 🎭 Live2D Model Integration

Miko includes a complete Live2D abstraction layer ready for official Cubism SDK models without altering UI or application logic:

1. **Download Live2D Cubism Core**:
   - Download the official `Live2D Cubism SDK for Web` from [Live2D.com](https://www.live2d.com/en/sdk/about/).
   - Place `live2dcubismcore.min.js` inside `public/live2d/`.

2. **Add Your Model**:
   - Place your exported Cubism model folder inside `public/live2d/models/<your_model>/`.
   - Ensure it includes `<your_model>.model3.json`, `<your_model>.moc3`, and the `textures/` folder.

3. **Activate in Settings**:
   - Open Miko's **Settings** panel (`⚙`).
   - Switch **Model Type** to **Live2D Cubism Model**.
   - `Live2DManager` automatically synchronizes Miko's emotional states (`happy`, `talking`, `surprised`, etc.) with Cubism motion groups and facial parameters (`ParamEyeLOpen`, `ParamMouthOpenY`, `ParamAngleX`).

---

## 🔒 Security Best Practices

- `contextIsolation: true` is strictly enforced.
- `nodeIntegration: false` prevents renderer execution of arbitrary Node primitives.
- Preload script explicitly exposes safe IPC methods (`window.mikoAPI`).
- Zero API keys are hard-coded in client bundles.
