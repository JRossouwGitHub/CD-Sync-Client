const { app, BrowserWindow, ipcMain } = require('electron')
// include the Node.js 'path' module at the top of your file
const path = require('node:path')

// modify your existing createWindow() function
const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        maxWidth: 800,
        maxHeight: 600,
        minWidth: 400,
        autoHideMenuBar: true,
        frame: false,
        transparent: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    ipcMain.on('close-app', () => {
        app.quit()
    })

    ipcMain.on('toggle', (event, width, height, onTop) => {
        win.setSize(width, height)
        win.setAlwaysOnTop(onTop)
    })

    win.loadFile('index.html')
    //win.webContents.openDevTools()
}

app.whenReady().then(() => {
    createWindow()
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})