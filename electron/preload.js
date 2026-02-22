import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  exportPDF: (data) => ipcRenderer.invoke('export-pdf', data),
  exportFile: (data) => ipcRenderer.invoke('export-file', data),
  saveAttachment: (data) => ipcRenderer.invoke('save-attachment', data),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
});
