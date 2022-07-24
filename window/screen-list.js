const { BrowserWindow, ipcMain, app, desktopCapturer } = require('electron'), path = require('path');
const { getAllScreen } = require('../components/screens');


/**
 * @param {BrowserWindow} parent 
 */
function screenListWindow(parent) {

    const childHeigth = (parent.getSize()[1] - 1) - 80,
    childWidth = (parent.getSize() - 1) - 200,
    mainChild = new BrowserWindow({
        parent: parent,
        modal: true,
        minWidth: childWidth,
        minHeight: childHeigth,
        maxWidth: childWidth,
        maxHeight: childHeigth,
        width: childWidth,
        height: childHeigth,
        center: true,
        frame: false,
        autoHideMenuBar: true,
        title: 'Screen List',
        webPreferences: {
            preload: path.join(app.getAppPath(), 'preload/mainChild.js')
        }
    });
    mainChild.show()

    mainChild.on('ready-to-show', () => {
        getAllScreen().then(screens => {
            mainChild.webContents.send('DISPLAY_ALL_SCREEN', screens)
        })
    })

    ipcMain.once('CHANGE_SCREEN_SOURCE', (e, screen) => {
        mainChild.hide()
        parent.webContents.send('CHANGE_SCREEN_SOURCE_DATA', screen)
    })

    ipcMain.on('close-window-main-child', () => {
        mainChild.hide();
    })


    mainChild.loadFile('./public/screen-list.html')

    return mainChild
}
module.exports.screenListWindow = screenListWindow