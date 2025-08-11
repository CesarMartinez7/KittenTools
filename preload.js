const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  guardarDatos: (data) => ipcRenderer.invoke('guardar-datos', data),
  cargarDatos: () => ipcRenderer.invoke('cargar-datos'),
});
