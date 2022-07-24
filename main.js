const { BrowserWindow, app, screen, ipcMain, desktopCapturer } = require('electron'), path = require('path'),
 { mainWindow } = require('./window');
require('electron-reload')(__dirname)


app.whenReady().then(() => {
    mainWindow()
})

app.on('window-all-closed', () => {
    app.quit()
})