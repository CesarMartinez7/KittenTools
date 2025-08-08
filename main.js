// main.js
import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

// Simular __dirname en ESModules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Detectar si estamos en modo desarrollo
const isDev = !app.isPackaged;

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 800,
    webPreferences: {
      nodeIntegration: false, // mejor seguridad
      contextIsolation: true, // recomendado
    },
  });

  if (isDev) {
    // Modo desarrollo -> carga desde Vite o React en localhost
    win.loadURL('http://localhost:3000');
    win.webContents.openDevTools();
  } else {
    // Modo producción -> carga los archivos compilados
    win.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
