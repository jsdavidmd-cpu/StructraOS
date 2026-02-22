import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, '../public/icon.png'),
  });

  // Load app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC Handlers

// Export PDF
ipcMain.handle('export-pdf', async (event, { html, filename }) => {
  try {
    const { filePath } = await dialog.showSaveDialog(mainWindow, {
      defaultPath: filename,
      filters: [{ name: 'PDF Files', extensions: ['pdf'] }],
    });

    if (filePath) {
      // Create a temporary window for PDF generation
      const pdfWindow = new BrowserWindow({ show: false });
      await pdfWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
      
      const data = await pdfWindow.webContents.printToPDF({
        printBackground: true,
        margin: {
          top: 0.5,
          bottom: 0.5,
          left: 0.5,
          right: 0.5,
        },
      });

      fs.writeFileSync(filePath, data);
      pdfWindow.close();

      return { success: true, path: filePath };
    }

    return { success: false, message: 'Export cancelled' };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

// Export Excel/CSV
ipcMain.handle('export-file', async (event, { content, filename, filters }) => {
  try {
    const { filePath } = await dialog.showSaveDialog(mainWindow, {
      defaultPath: filename,
      filters: filters || [
        { name: 'CSV Files', extensions: ['csv'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    });

    if (filePath) {
      fs.writeFileSync(filePath, content);
      return { success: true, path: filePath };
    }

    return { success: false, message: 'Export cancelled' };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

// Save attachment locally
ipcMain.handle('save-attachment', async (event, { buffer, filename }) => {
  try {
    const documentsPath = app.getPath('documents');
    const structraPath = path.join(documentsPath, 'STRUCTRA', 'Attachments');
    
    if (!fs.existsSync(structraPath)) {
      fs.mkdirSync(structraPath, { recursive: true });
    }

    const filePath = path.join(structraPath, filename);
    fs.writeFileSync(filePath, Buffer.from(buffer));

    return { success: true, path: filePath };
  } catch (error) {
    return { success: false, message: error.message };
  }
});

// Get app version
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});
