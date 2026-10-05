import { app, BrowserWindow, screen, Tray, Menu, nativeImage } from 'electron';
import path from 'path';
import fs from 'fs';
import { registerIpcHandlers, sendTrayAction } from './ipc';
import { WindowPosition } from '../src/types';

// Is development mode?
const isDev = !app.isPackaged && (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV);
if (isDev) {
  try {
    app.setPath('userData', path.join(app.getPath('appData'), 'miko-desktop-companion-dev'));
  } catch {
    // Ignore if called after app ready
  }
}

// State persistence path
const STATE_FILE_PATH = path.join(app.getPath('userData'), 'miko-window-state.json');

const WINDOW_WIDTH = 450;
const WINDOW_HEIGHT = 650;

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let savePositionTimeout: NodeJS.Timeout | null = null;

function loadSavedPosition(): WindowPosition | null {
  try {
    if (fs.existsSync(STATE_FILE_PATH)) {
      const data = fs.readFileSync(STATE_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(data) as WindowPosition;
      if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
        // Validate that position is still on an active screen
        const displays = screen.getAllDisplays();
        const isVisibleOnAnyDisplay = displays.some((d) => {
          const b = d.bounds;
          return (
            parsed.x >= b.x - 200 &&
            parsed.x <= b.x + b.width - 50 &&
            parsed.y >= b.y - 200 &&
            parsed.y <= b.y + b.height - 50
          );
        });

        if (isVisibleOnAnyDisplay) {
          return parsed;
        }
      }
    }
  } catch (err) {
    console.warn('Failed to load saved window position:', err);
  }
  return null;
}

function saveWindowPosition(pos: WindowPosition): void {
  if (savePositionTimeout) {
    clearTimeout(savePositionTimeout);
  }
  savePositionTimeout = setTimeout(() => {
    try {
      fs.writeFileSync(STATE_FILE_PATH, JSON.stringify(pos, null, 2), 'utf-8');
    } catch (err) {
      console.warn('Failed to persist window position:', err);
    }
  }, 400);
}

function getDefaultPosition(): WindowPosition {
  const primaryDisplay = screen.getPrimaryDisplay();
  const workArea = primaryDisplay.workArea;

  const x = Math.round(workArea.x + workArea.width - WINDOW_WIDTH - 30);
  const y = Math.round(workArea.y + workArea.height - WINDOW_HEIGHT - 20);

  return { x, y };
}

function getPreloadPath(): string {
  const possiblePaths = [
    path.join(__dirname, 'preload.js'),
    path.join(__dirname, '../dist-electron/preload.js'),
    path.join(app.getAppPath(), 'dist-electron/preload.js'),
  ];
  return possiblePaths.find((p) => fs.existsSync(p)) || path.join(__dirname, 'preload.js');
}

function createMainWindow(): void {
  const initialPos = loadSavedPosition() || getDefaultPosition();
  const preloadPath = getPreloadPath();

  mainWindow = new BrowserWindow({
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    x: initialPos.x,
    y: initialPos.y,
    transparent: true,
    frame: false,
    resizable: false,
    movable: true,
    alwaysOnTop: true,
    skipTaskbar: false,
    backgroundColor: '#00000000',
    hasShadow: false,
    show: false,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      backgroundThrottling: false,
    },
  });

  // Keep on top across screens and fullscreen apps
  mainWindow.setAlwaysOnTop(true, 'screen-saver');

  mainWindow.once('ready-to-show', () => {
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  mainWindow.on('moved', () => {
    if (mainWindow) {
      const [x, y] = mainWindow.getPosition();
      saveWindowPosition({ x, y });
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Load URL
  const isDev = !app.isPackaged && (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV);
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

function createTray(): void {
  const possiblePaths = [
    path.join(__dirname, '../public/icons/icon.png'),
    path.join(__dirname, '../dist/icons/icon.png'),
    path.join(app.getAppPath(), 'dist/icons/icon.png'),
    path.join(app.getAppPath(), 'public/icons/icon.png'),
    path.join(process.cwd(), 'public/icons/icon.png'),
  ];

  const iconPath = possiblePaths.find((p) => fs.existsSync(p)) || '';

  let trayIcon: Electron.NativeImage;
  if (iconPath) {
    trayIcon = nativeImage.createFromPath(iconPath);
  } else {
    trayIcon = nativeImage.createEmpty();
  }

  tray = new Tray(trayIcon);
  tray.setToolTip('Miko - Desktop AI Companion (Click to show/hide)');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show Miko',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
          mainWindow.setAlwaysOnTop(true, 'screen-saver');
          sendTrayAction(mainWindow, 'show');
        }
      },
    },
    {
      label: 'Hide Miko',
      click: () => {
        if (mainWindow) {
          mainWindow.hide();
          sendTrayAction(mainWindow, 'hide');
        }
      },
    },
    { type: 'separator' },
    {
      label: '⏰ Reminders',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
          mainWindow.setAlwaysOnTop(true, 'screen-saver');
          sendTrayAction(mainWindow, 'reminders');
        }
      },
    },
    {
      label: '🎯 Focus Mode',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
          mainWindow.setAlwaysOnTop(true, 'screen-saver');
          sendTrayAction(mainWindow, 'focus');
        }
      },
    },
    {
      label: '⚙ Settings',
      click: () => {
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
          mainWindow.setAlwaysOnTop(true, 'screen-saver');
          sendTrayAction(mainWindow, 'settings');
        }
      },
    },
    { type: 'separator' },
    {
      label: '✕ Exit',
      click: () => {
        sendTrayAction(mainWindow, 'exit');
        app.quit();
      },
    },
  ]);

  // Left click directly toggles / restores Miko
  tray.on('click', () => {
    if (mainWindow) {
      if (!mainWindow.isVisible()) {
        mainWindow.show();
        mainWindow.focus();
        mainWindow.setAlwaysOnTop(true, 'screen-saver');
      } else {
        mainWindow.focus();
      }
    }
  });

  // Right click pops up the full companion context menu
  tray.on('right-click', () => {
    tray?.popUpContextMenu(contextMenu);
  });

  tray.on('double-click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
        mainWindow.setAlwaysOnTop(true, 'screen-saver');
      }
    }
  });
}

let taskbarRunwayWindow: BrowserWindow | null = null;

function showTaskbarRunway(reminderTitle: string): void {
  if (taskbarRunwayWindow && !taskbarRunwayWindow.isDestroyed()) {
    taskbarRunwayWindow.close();
    taskbarRunwayWindow = null;
  }

  const primary = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primary.bounds;

  const preloadPath = getPreloadPath();
  const runwayHeight = 220;

  taskbarRunwayWindow = new BrowserWindow({
    width: screenWidth,
    height: runwayHeight,
    x: 0,
    y: screenHeight - runwayHeight,
    transparent: true,
    frame: false,
    resizable: false,
    movable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    hasShadow: false,
    focusable: false,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      backgroundThrottling: false,
    },
  });

  taskbarRunwayWindow.setAlwaysOnTop(true, 'screen-saver');
  taskbarRunwayWindow.setIgnoreMouseEvents(true, { forward: true });

  const isDev = !app.isPackaged && (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV);
  if (isDev) {
    taskbarRunwayWindow.loadURL(`http://localhost:5173/?mode=runway&title=${encodeURIComponent(reminderTitle)}`);
  } else {
    const indexPath = path.join(__dirname, '../dist/index.html');
    taskbarRunwayWindow.loadFile(indexPath, {
      search: `mode=runway&title=${encodeURIComponent(reminderTitle)}`,
    });
  }

  taskbarRunwayWindow.once('ready-to-show', () => {
    taskbarRunwayWindow?.show();
  });
}

function closeTaskbarRunway(): void {
  if (taskbarRunwayWindow && !taskbarRunwayWindow.isDestroyed()) {
    taskbarRunwayWindow.close();
    taskbarRunwayWindow = null;
  }
}

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (!mainWindow.isVisible()) mainWindow.show();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    registerIpcHandlers(
      () => mainWindow,
      () => tray,
      saveWindowPosition,
      showTaskbarRunway,
      closeTaskbarRunway
    );

    createTray();
    createMainWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow();
      }
    });
  });

  app.on('window-all-closed', () => {
    // Keep running in tray on Windows unless explicitly exited
    if (process.platform !== 'win32') {
      app.quit();
    }
  });

  app.on('before-quit', () => {
    if (tray) {
      tray.destroy();
      tray = null;
    }
  });
}
