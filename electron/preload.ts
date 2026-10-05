import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import { ElectronMikoAPI, WindowPosition, TrayAction } from '../src/types';

const mikoAPI: ElectronMikoAPI = {
  minimizeWindow: (): void => {
    ipcRenderer.send('window:minimize');
  },

  closeWindow: (): void => {
    ipcRenderer.send('window:close');
  },

  hideToTray: (): void => {
    ipcRenderer.send('window:hideToTray');
  },

  showFromTray: (): void => {
    ipcRenderer.send('window:showFromTray');
  },

  setAlwaysOnTop: (alwaysOnTop: boolean): Promise<void> => {
    return ipcRenderer.invoke('window:setAlwaysOnTop', alwaysOnTop);
  },

  setStartWithWindows: (enable: boolean): Promise<boolean> => {
    return ipcRenderer.invoke('window:setStartWithWindows', enable);
  },

  getPosition: (): Promise<WindowPosition> => {
    return ipcRenderer.invoke('window:getPosition');
  },

  setPosition: (x: number, y: number): Promise<void> => {
    return ipcRenderer.invoke('window:setPosition', x, y);
  },

  moveBy: (deltaX: number, deltaY: number): Promise<void> => {
    return ipcRenderer.invoke('window:moveBy', deltaX, deltaY);
  },

  bringToFront: (): void => {
    ipcRenderer.send('window:bringToFront');
  },

  onTrayAction: (callback: (action: TrayAction) => void): (() => void) => {
    const subscription = (_event: IpcRendererEvent, action: TrayAction) => {
      callback(action);
    };
    ipcRenderer.on('tray:action', subscription);
    return () => {
      ipcRenderer.removeListener('tray:action', subscription);
    };
  },

  isPackaged: (): Promise<boolean> => {
    return ipcRenderer.invoke('app:isPackaged');
  },

  startTaskbarRunway: (title: string): void => {
    ipcRenderer.send('window:startTaskbarRunway', title);
  },

  finishTaskbarRunway: (): void => {
    ipcRenderer.send('window:finishTaskbarRunway');
  },

  onRunwayCompleted: (callback: () => void): (() => void) => {
    const sub = () => callback();
    ipcRenderer.on('reminder:runwayCompleted', sub);
    return () => {
      ipcRenderer.removeListener('reminder:runwayCompleted', sub);
    };
  },
};

contextBridge.exposeInMainWorld('mikoAPI', mikoAPI);
