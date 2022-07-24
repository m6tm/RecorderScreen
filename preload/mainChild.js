const { ipcRenderer } = require("electron")

/**
 * @type {HTMLDivElement}
 */
let screenInner = null

window.addEventListener('DOMContentLoaded', () => {
    screenInner = document.querySelector('#screen-inner')
    document.querySelector('#close').addEventListener('click', () => {
        ipcRenderer.send('close-window-main-child');
    }, false)

    ipcRenderer.on('DISPLAY_ALL_SCREEN', screenListDisplay)
}, false)

/**
 * @param {Array<{ id: string; name: string; }>} screenList 
 */
function screenListDisplay(e, screenList) {
   screenList.forEach(async screen => {
       let stream = await navigator.mediaDevices.getUserMedia({
           audio: false,
           video: {
                mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: screen.id
                }
            }
        }).then(stream => stream),
        source = screenTemplate(`
            <div class="col-4 mb-4">
                <div class="screen-view detail mx-auto d-flex justify-content-center align-items-center">
                    <video src="" autoplay id="video-stream"></video>
                </div>
            </div>`)
        source.querySelector('video').srcObject = stream

        if ('append' in screenInner) {
            screenInner.append(source)
        } else {
            screenInner.appendChild(source)
        }

        source.addEventListener('click', () => {
            ipcRenderer.send('CHANGE_SCREEN_SOURCE', screen)
        }, false)
   }) 
}

/**
 * @param {string} content 
 * @returns {HTMLLinkElement|HTMLDivElement}
 */
function screenTemplate(content) {
    if (typeof content !== 'string') {
        content = '<a href="javascript: void(0)">Unknow content</a>'
    }
    return new DOMParser().parseFromString(content, 'text/html').querySelector('body').children[0]
}