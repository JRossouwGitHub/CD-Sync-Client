const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
    close: () => ipcRenderer.send('close-app'),
    toggle: (width, height, onTop) => ipcRenderer.send('toggle', width, height, onTop)
})

window.addEventListener('DOMContentLoaded', () => {
    for (const dependency of ['chrome', 'node', 'electron']) {
        console.log(`${dependency}-version`, process.versions[dependency])
    }
})