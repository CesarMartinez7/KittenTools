const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const isDev = !app.isPackaged;

const dataFilePath = path.join(app.getPath('userData'), 'datos.json');

function guardarJSON(data) {
  try {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log('Datos guardados');
  } catch (err) {
    console.error('Error guardando datos:', err);
  }
}

function cargarJSON() {
  try {
    if (!fs.existsSync(dataFilePath)) return null;
    const contenido = fs.readFileSync(dataFilePath, 'utf-8');
    return JSON.parse(contenido);
  } catch (err) {
    console.error('Error leyendo datos:', err);
    return null;
  }
}

function createWindow() {
  const win = new BrowserWindow({
    icon: `/src/public/coffe.png`,
    width: 1840,
    height: 1080,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.js'), // IMPORTANTE: agregar preload
    },
  });

  if (isDev) {
    win.loadURL('http://localhost:3000');
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC: escucha peticiones del renderer
ipcMain.handle('guardar-datos', (event, data) => {
  guardarJSON(data);
  return true; // puede devolver algo si quieres
});

ipcMain.handle('cargar-datos', () => {
  return cargarJSON();
});
