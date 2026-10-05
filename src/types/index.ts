export type CharacterState =
  | 'idle'
  | 'happy'
  | 'sad'
  | 'thinking'
  | 'surprised'
  | 'talking'
  | 'sleepy'
  | 'excited';

export type ActivePanel = 'none' | 'menu' | 'chat' | 'focus' | 'tasks' | 'settings' | 'mood' | 'reminders';

export type CharacterModelMode = 'svg-anime' | 'art-anime' | 'live2d' | '3d-character';

export interface ReminderItem {
  id: string;
  title: string;
  targetTimestamp: number;
  createdAt: number;
  completed: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'miko' | 'user';
  text: string;
  timestamp: number;
}

export interface TaskItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export interface CompanionSettings {
  characterScale: number;
  alwaysOnTop: boolean;
  enableAnimations: boolean;
  enableSpeechBubbles: boolean;
  speechDurationSeconds: number;
  idleMessagesEnabled: boolean;
  idleIntervalSeconds: number;
  randomReactions: boolean;
  startWithWindows: boolean;
  theme: 'lavender' | 'dark' | 'light';
  reduceMotion: boolean;
  characterModel: CharacterModelMode;
}

export interface WindowPosition {
  x: number;
  y: number;
}

export type TrayAction = 'show' | 'hide' | 'focus' | 'settings' | 'reminders' | 'exit';

export interface ElectronMikoAPI {
  minimizeWindow: () => void;
  closeWindow: () => void;
  hideToTray: () => void;
  showFromTray: () => void;
  setAlwaysOnTop: (alwaysOnTop: boolean) => Promise<void>;
  setStartWithWindows: (enable: boolean) => Promise<boolean>;
  getPosition: () => Promise<WindowPosition>;
  setPosition: (x: number, y: number) => Promise<void>;
  moveBy: (deltaX: number, deltaY: number) => Promise<void>;
  bringToFront: () => void;
  onTrayAction: (callback: (action: TrayAction) => void) => () => void;
  isPackaged: () => Promise<boolean>;
  startTaskbarRunway: (title: string) => void;
  finishTaskbarRunway: () => void;
  onRunwayCompleted: (callback: () => void) => () => void;
}

declare global {
  interface Window {
    mikoAPI?: ElectronMikoAPI;
  }
}
