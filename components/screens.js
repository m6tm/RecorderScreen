const { desktopCapturer } =require('electron')

/**
 * @returns {Promise<Array<{ id: string; name: string; }>>}
 */
function getAllScreen() {
    return new Promise(resolve => {
        desktopCapturer.getSources({ types: ['window', 'screen'] }).then(sources => {
            /**
             * @type {Array<{ id: string; name: string; }>}
             */
            let tmp_sources = []
            for (let index = 0; index < sources.length; index++) {
                tmp_sources.push({
                    id: sources[index].id,
                    name: sources[index].name
                })
            }
            resolve(tmp_sources)
        })
    })
}

/**
 * @param {string} name
 * @returns {Promise<Array<{ id: string; name: string; }>>}
 */
function getScreen(name) {
    return new Promise(resolve => {
        desktopCapturer.getSources({ types: ['window', 'screen'] }).then(sources => {
            for (const source of sources) {
                if (name == source.name) {
                    resolve({
                        id: source.id,
                        name: source.name
                    })
                }
            }
        })
    })
}

module.exports.getAllScreen = getAllScreen
module.exports.getScreen = getScreen