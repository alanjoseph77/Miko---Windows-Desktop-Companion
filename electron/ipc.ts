import { ipcMain, BrowserWindow, app, Tray } from 'electron';
import { WindowPosition, TrayAction } from '../src/types';

export function registerIpcHandlers(
  getWindow: () => BrowserWindow | null,
  getTray: () => Tray | null,
  saveWindowPosition: (pos: WindowPosition) => void,
  startRunway: (title: string) => void,
  finishRunway: () => void
): void {
  ipcMain.on('window:startTaskbarRunway', (_event, title: string) => {
    startRunway(title);
  });

  ipcMain.on('window:finishTaskbarRunway', () => {
    finishRunway();
    const win = getWindow();
    if (win && !win.isDestroyed()) {
      win.show();
      win.focus();
      win.webContents.send('reminder:runwayCompleted');
    }
  });
  ipcMain.on('window:minimize', () => {
    const win = getWindow();
    if (win) {
      win.minimize();
    }
  });

  ipcMain.on('window:close', () => {
    const win = getWindow();
    if (win && !win.isDestroyed()) {
      win.close();
    }
    app.quit();
  });

  ipcMain.on('window:hideToTray', () => {
    const win = getWindow();
    if (win) {
      win.hide();
    }
    const t = getTray();
    if (t && process.platform === 'win32') {
      try {
        t.displayBalloon({
          title: 'Miko is resting in your tray! 🌸',
          content: 'Click Miko in your taskbar tray anytime to wake her up!',
        });
      } catch (err) {
        console.warn('Tray balloon error:', err);
      }
    }
  });

  ipcMain.on('window:showFromTray', () => {
    const win = getWindow();
    if (win) {
      win.show();
      win.focus();
    }
  });

  ipcMain.handle('window:setAlwaysOnTop', (_event, alwaysOnTop: boolean) => {
    const win = getWindow();
    if (win) {
      win.setAlwaysOnTop(alwaysOnTop, 'screen-saver');
    }
  });

  ipcMain.handle('window:setStartWithWindows', (_event, enable: boolean): boolean => {
    try {
      app.setLoginItemSettings({
        openAtLogin: enable,
        path: process.execPath,
      });
      return true;
    } catch {
      return false;
    }
  });

  ipcMain.handle('window:getPosition', (): WindowPosition => {
    const win = getWindow();
    if (!win) return { x: 0, y: 0 };
    const [x, y] = win.getPosition();
    return { x, y };
  });

  ipcMain.handle('window:setPosition', (_event, x: number, y: number) => {
    const win = getWindow();
    if (win) {
      win.setPosition(Math.round(x), Math.round(y));
      saveWindowPosition({ x: Math.round(x), y: Math.round(y) });
    }
  });

  ipcMain.handle('window:moveBy', (_event, deltaX: number, deltaY: number) => {
    const win = getWindow();
    if (win) {
      const [currentX, currentY] = win.getPosition();
      const newX = Math.round(currentX + deltaX);
      const newY = Math.round(currentY + deltaY);
      win.setPosition(newX, newY);
      saveWindowPosition({ x: newX, y: newY });
    }
  });

  ipcMain.on('window:bringToFront', () => {
    const win = getWindow();
    if (win) {
      if (!win.isVisible()) {
        win.show();
      }
      win.focus();
      win.setAlwaysOnTop(true, 'screen-saver');
    }
  });

  ipcMain.handle('app:isPackaged', () => {
    return app.isPackaged;
  });
}

export function sendTrayAction(win: BrowserWindow | null, action: TrayAction): void {
  if (win && !win.isDestroyed()) {
    win.webContents.send('tray:action', action);
  }
}
