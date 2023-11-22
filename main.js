const { app, BrowserWindow, ipcMain } = require('electron')
// include the Node.js 'path' module at the top of your file
const path = require('node:path')
const {GlobalKeyboardListener} = require("node-global-key-listener")
const v = new GlobalKeyboardListener();
let keyPressEnabled = false

// modify your existing createWindow() function
const createWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        autoHideMenuBar: true,
        frame: false,
        transparent: true,
        titleBarStyle: 'hidden',
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        },
        icon: __dirname + '/public/icons/128x128.ico',
    })

    ipcMain.on('close-app', () => {
        app.quit()
    })

    ipcMain.on('toggle', (event, width, height, onTop) => {
        win.setSize(width, height)
        win.setAlwaysOnTop(onTop, "normal")
        keyPressEnabled = onTop
        if(!onTop){
            win.center()
        } else {
            win.moveTop()
        }
    })

    win.loadFile('index.html')
    return win
}

app.whenReady().then(() => {
    let _win = createWindow()
    v.addListener(function (e, down) {
        if(!keyPressEnabled) return

        if (down) {
            _win.webContents.executeJavaScript(`
                listen_keypress("${e.name}");
            `)
        } 
    });
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})