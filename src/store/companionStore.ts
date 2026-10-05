import {
  ChatMessage,
  TaskItem,
  CompanionSettings,
  ReminderItem,
} from '../types';

const SETTINGS_KEY = 'miko_companion_settings';
const TASKS_KEY = 'miko_companion_tasks';
const CHAT_KEY = 'miko_companion_chat';
const REMINDERS_KEY = 'miko_companion_reminders';

export const DEFAULT_SETTINGS: CompanionSettings = {
  characterScale: 1.0,
  alwaysOnTop: true,
  enableAnimations: true,
  enableSpeechBubbles: true,
  speechDurationSeconds: 4,
  idleMessagesEnabled: true,
  idleIntervalSeconds: 35,
  randomReactions: true,
  startWithWindows: false,
  theme: 'lavender',
  reduceMotion: false,
  characterModel: '3d-character',
};

export const INITIAL_TASKS: TaskItem[] = [
  { id: '1', text: 'Finish research proposal', completed: false, createdAt: Date.now() - 3600000 },
  { id: '2', text: 'Read 2 papers', completed: false, createdAt: Date.now() - 2400000 },
  { id: '3', text: 'Implement Raspberry Pi client', completed: false, createdAt: Date.now() - 1200000 },
  { id: '4', text: 'Test FL training', completed: false, createdAt: Date.now() },
];

export const INITIAL_CHAT: ChatMessage[] = [
  {
    id: 'init-1',
    sender: 'miko',
    text: 'Hey! What are we working on today? (◕‿◕✿)',
    timestamp: Date.now() - 5000,
  },
];

export function loadStoredSettings(): CompanionSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.warn('Failed to load settings from localStorage:', err);
  }
  return DEFAULT_SETTINGS;
}

export function saveStoredSettings(settings: CompanionSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.warn('Failed to save settings to localStorage:', err);
  }
}

export function loadStoredTasks(): TaskItem[] {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('Failed to load tasks from localStorage:', err);
  }
  return INITIAL_TASKS;
}

export function saveStoredTasks(tasks: TaskItem[]): void {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.warn('Failed to save tasks to localStorage:', err);
  }
}

export function loadStoredChat(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(CHAT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('Failed to load chat from localStorage:', err);
  }
  return INITIAL_CHAT;
}

export function saveStoredChat(messages: ChatMessage[]): void {
  try {
    localStorage.setItem(CHAT_KEY, JSON.stringify(messages.slice(-50)));
  } catch (err) {
    console.warn('Failed to save chat to localStorage:', err);
  }
}

export function loadStoredReminders(): ReminderItem[] {
  try {
    const raw = localStorage.getItem(REMINDERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn('Failed to load reminders from localStorage:', err);
  }
  return [];
}

export function saveStoredReminders(reminders: ReminderItem[]): void {
  try {
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
  } catch (err) {
    console.warn('Failed to save reminders to localStorage:', err);
  }
}

export interface SpeechBubbleState {
  id: number;
  text: string;
  visible: boolean;
  duration: number;
}
