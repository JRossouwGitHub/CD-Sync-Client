const { app, BrowserWindow, Menu } = require('electron')
// include the Node.js 'path' module at the top of your file
const path = require('node:path')

const template = []
  
const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)

// modify your existing createWindow() function
const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })

  win.loadFile('index.html')
  win.webContents.openDevTools()
}

app.whenReady().then(() => {
    createWindow()
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
})