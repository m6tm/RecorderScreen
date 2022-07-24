const { ipcRenderer } = require("electron"),
 { writeFile } = require("fs/promises"),
 EventEmitter = require('events'),
 event = new EventEmitter();

/**
 * @type {HTMLButtonElement}
 */
let startBtn = null,
/**
 * @type {HTMLButtonElement}
 */
saveBtn = null,
/**
 * @type {HTMLButtonElement}
 */
pausePlay = null,
/**
 * @type {HTMLButtonElement}
 */
stopBtn = null,
/**
 * @type {HTMLButtonElement}
 */
 muteBtn = null,
/**
 * @type {HTMLButtonElement}
 */
changeRecorderScreen = null,
/**
 * @type {HTMLVideoElement}
 */
video = null,

/**
 * @type {Array<Blob>}
 */
pists = [],
currentMediaSourceId = '',
/**
 * @type {'stopped'|'pending'}
 */
globalCallState = 'stopped',
recorderTime = 0,
/**
 * @type {HTMLSpanElement}
 */
timerHour = null,
/**
 * @type {HTMLSpanElement}
 */
timerMinut = null,
/**
 * @type {HTMLSpanElement}
 */
timerSecond = null,
pistsReceived = false,
constraints = {
    audio: true,
    video: {
        mandatory: {
            chromeMediaSource: 'desktop',
            chromeMediaSourceId: '',
        }
    }
};


window.addEventListener('DOMContentLoaded', () => {
    startBtn = document.querySelector('#start-recording')
    saveBtn = document.querySelector('#save-recording')
    pausePlay = document.querySelector('#pause-play-recording')
    stopBtn = document.querySelector('#stop-recording')
    muteBtn = document.querySelector('#mute-recording')
    changeRecorderScreen = document.querySelector('#change-recording')
    video = document.querySelector('#video-stream')
    timerHour = document.querySelector('#timer-hour')
    timerMinut = document.querySelector('#timer-minute')
    timerSecond = document.querySelector('#timer-second')

    document.querySelector('#reduire').addEventListener('click', () => {
        ipcRenderer.send('minimize-window');
    }, false)

    document.querySelector('#agrandire').addEventListener('click', () => {
        ipcRenderer.send('maximize-window');
    }, false)

    document.querySelector('#close').addEventListener('click', () => {
        ipcRenderer.send('close-window');
    }, false)

    startBtn.addEventListener('click', () => {
        changeRecorderScreen.click()
    }, false)

    changeRecorderScreen.addEventListener('click', () => {
        if (globalCallState == 'stopped') {
            startBtn.classList.add('pe-none', 'bg-secondary', 'text-light')
            startBtn.classList.remove('info')
            pistsReceived = false
        }
        ipcRenderer.send('CHANGE_RECORDER_SCREEN')
    })
}, false)

ipcRenderer.on('CHANGE_SCREEN_SOURCE_DATA', (e, { id }) => {
    requestRecord(id)
})

async function requestRecord(sourceId) {
    try {
        if (navigator.mediaDevices.getUserMedia === undefined) {
            navigator.mediaDevices.getUserMedia = function(constraints) {
    
                var getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    
                if (!getUserMedia) { // Decline call if is not present in browser
                    return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
                }
    
                return new Promise(function(resolve, reject) {
                    getUserMedia.call(navigator, constraints, resolve, reject);
                });
            }
        }
    } catch (error) {
        throw error;
    }
    constraints.video.mandatory = {
        ...constraints.video.mandatory,
        ...{
            chromeMediaSourceId: sourceId
        }
    }
    const stream = await navigator.mediaDevices.getUserMedia({constraints})
        .then(stream => stream)
        .catch(error => {
            console.error('Error :', error);
        })
        if (!(stream instanceof MediaStream)) return
        console.log(stream);
    try {
        // stream.getAudioTracks().forEach(track => {
        //     track.enabled = !track.enabled
        // })
    //   handleStream(stream, sourceId)
    } catch (e) {
      handleError(e)
    }
}

event.on('START RECORDER TIME', () => {
    let hours = 0,
        minutes = 0,
        seconds = 0;

    recorderTime = setInterval(() => {
        seconds++;
        if (seconds > 59) {
            seconds = 0;
            minutes++;
        }
        if (minutes > 59) {
            minutes = 0;
            hours++;
        }
        let tmpHours = hours < 10 ? '0' + hours.toString() : hours,
            tmpMinutes = minutes < 10 ? '0' + minutes.toString() : minutes,
            tmpSeconds = seconds < 10 ? '0' + seconds.toString() : seconds;
        if (globalCallState == 'pending') {
            timerHour.textContent = tmpHours
            timerMinut.textContent = tmpMinutes
            timerSecond.textContent = tmpSeconds
        }
    }, 1000);
})

/**
 * @param {MediaStream} stream
 * @param {string} sourceId
 */
function handleStream(stream, sourceId) {
    currentMediaSourceId = sourceId
    if (globalCallState == 'stopped') {
        globalCallState = 'pending'
        timerHour.textContent = '00'
        timerMinut.textContent = '00'
        timerSecond.textContent = '00'
        event.emit('START RECORDER TIME')
    }

    pausePlay.classList.remove('pe-none')
    stopBtn.classList.remove('pe-none')
    muteBtn.classList.remove('pe-none')
    pausePlay.innerHTML = '<i class="fa fa-pause"></i>'

    let recorder = new MediaRecorder(stream),
    /**
     * @type {'none'|'play'|'pause'|'stop'}
     */
    recorderStare = 'none'

    video.onloadedmetadata = (e) => {
        recorder.start(1000);
        recorderStare = 'play'
        video.play()
    }
    video.srcObject = stream
    
    recorder.addEventListener('dataavailable', e => {
        if (currentMediaSourceId !== sourceId) {
            recorderStare = 'stop'
            try { recorder?.stop() } catch (error) {}
        }
        pists.push(e.data)
    }, false)
    recorder.addEventListener('pause', () => {
        recorderStare = 'pause'
    }, false)
    recorder.addEventListener('resume', () => {
        recorderStare = 'play'
    }, false)

    Array.from([saveBtn, stopBtn]).forEach(btn => {
        btn.addEventListener('click', () => {
            try { recorder?.stop() } catch (error) {}
            currentMediaSourceId = ''
            pausePlay.classList.add('pe-none')
            stopBtn.classList.add('pe-none')
            muteBtn.classList.add('pe-none')
            pausePlay.innerHTML = '<i class="fa fa-play"></i>'
            startBtn.classList.remove('pe-none', 'bg-secondary')
            startBtn.classList.add('info')

            saveRecord()
        }, false)
    })

    pausePlay.addEventListener('click', () => {
        if (recorder == null) return
        if (recorderStare == 'play') {
            recorder.pause()
        } else {
            recorder.resume()
        }
    }, false)

    muteBtn.addEventListener('click', () => { //    Un bug a été constaté ici ...
        if (recorder == null) return
        stream.getAudioTracks().forEach(track => {
            const enabled = !track.enabled
            track.enabled = enabled
            if (enabled) {
                muteBtn.innerHTML = '<i class="fa fa-microphone"></i>'
            } else {
                muteBtn.innerHTML = '<i class="fa fa-microphone-slash"></i>'
            }
        })
    }, false)

    recorder.addEventListener('stop', e => {
        saveBtn.removeEventListener('click', null, false)
        muteBtn.removeEventListener('click', null, false)
        recorder = null;
    }, false)
}

async function saveRecord() {
    if (pistsReceived) return
    pistsReceived = true
    if (pists.length == 0) return
    globalCallState = 'stopped'
    clearInterval(recorderTime)

    let localPists = pists,
    videoObj = new Blob(localPists, { type: 'video/webm;codecs=vp9' });
    pists = [];

    videoObj = Buffer.from(await videoObj.arrayBuffer())

    ipcRenderer.send('SAVE_PROCESS_STARTED')
    ipcRenderer.once('SAVE_PROCESS_RESPONSE', async (e, pathinfo) => {
        if (pathinfo.canceled) return
        await writeFile(pathinfo.filePath, videoObj)
        video.srcObject = null
    })
}
  
function handleError (e) {
    console.log(e)
}