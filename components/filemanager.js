const { dialog, app } = require("electron"),
path = require('path');
const { mkdir, rmdir } = require("fs");


async function getSaveFilePath() {
    const DIR = path.join(process.env.HOME, 'Documents/Recorder Screen Master'),
    hasDir = await dirExists(DIR)
    if (!hasDir) {
        mkdir(DIR, (err) => {
            if (err) {
                console.log(err);
            }
        })
    }
    return dialog.showSaveDialog({
        nameFieldLabel: 'Recorder Master - Save panel',
        buttonLabel: 'Save video now',
        defaultPath: path.join(DIR, `recorder-master-${Date.now()}.webm`),
        filters: [
            {
                name: 'Video Files',
                extensions: ['webm']
            }
        ]
    })
}

/**
 * @param {string} path 
 * @returns {Promise<boolean>}
 */
function dirExists(path) {
    return new Promise(resolve => {
        mkdir(path, err => {
            if (err) {
                resolve(true)
                return
            }
            rmdir(path, err => {
                if (err) console.log(err)
            })
            resolve(false)
        })
    })
}

module.exports.getSaveFilePath = getSaveFilePath