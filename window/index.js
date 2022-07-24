const { BrowserWindow, screen, ipcMain, desktopCapturer, app, dialog } = require('electron'),
 path = require('path'),
 { screenListWindow } = require('./screen-list'),
 { getAllScreen } = require('../components/screens');
const { getSaveFilePath } = require('../components/filemanager');


function mainWindow() {
    const displayScreen = screen.getPrimaryDisplay().workAreaSize,
    width = displayScreen.width - 470,
    height = displayScreen.height - 300,
    window = new BrowserWindow({
        minWidth: width,
        minHeight: height,
        maxWidth: width,
        maxHeight: height,
        width: width,
        height: height,
        show: false,
        center: true,
        frame: false,
        autoHideMenuBar: true,
        title: 'Home',
        webPreferences: {
            preload: path.join(app.getAppPath(), 'preload/main.js')
        }
    })
    
    window.once('ready-to-show', async () => {
        window.show()
    })

    ipcMain.on('minimize-window', () => {
        window.minimize()
    })

    ipcMain.on('close-window', () => {
        window.close();
    })

    ipcMain.on('maximize-window', () => {
        if (window.isMaximized()) {
            window.unmaximize();
        } else {
            window.maximize();
        }
    })
    
    ipcMain.on('CHANGE_RECORDER_SCREEN', () => {
        screenListWindow(window)
    })
    
    ipcMain.on('SAVE_PROCESS_STARTED', () => {
        getSaveFilePath().then(file => {
            window.webContents.send('SAVE_PROCESS_RESPONSE', file)
        })
    })

    window.loadFile('./public/index.html')

    return window
}

module.exports.mainWindow = mainWindow