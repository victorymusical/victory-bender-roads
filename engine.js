const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const voices = new Map();
const MAX_VOICES = 16;
let tremoloSpeed = 4.0;

// 1. Wake Up the Audio Engine on first click
window.addEventListener('mousedown', () => {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
        console.log("Victory Audio Engine: ONLINE");
    }
});

// 2. The Pulsing Gold LED Logic
const led = document.getElementById('tremolo-led');
if (led) {
    setInterval(() => {
        led.classList.toggle('active');
    }, (1000 / tremoloSpeed) / 2);
}

// 3. The Sound Generation
function playNote(frequency, velocity) {
    if (voices.size >= MAX_VOICES) {
        const oldest = voices.keys().next().value;
        stopNote(oldest);
    }

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);

    const volume = velocity / 127;
    gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 10);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start();
    voices.set(frequency, { osc, gainNode });
}

function stopNote(frequency) {
    const voice = voices.get(frequency);
    if (voice) {
        const now = audioCtx.currentTime;
        voice.gainNode.gain.cancelScheduledValues(now);
        voice.gainNode.gain.setValueAtTime(voice.gainNode.gain.value, now);
        voice.gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        setTimeout(() => { voice.osc.stop(); voices.delete(frequency); }, 100);
    }
}

// 4. Generate the Physical Keys in the UI
const keybed = document.getElementById('piano-keys');
const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

if (keybed) {
    for (let i = 0; i < 24; i++) {
        const noteName = notes[i % 12];
        const key = document.createElement('div');
        key.className = noteName.includes('#') ? 'black-key' : 'white-key';
        
        key.addEventListener('mousedown', () => {
            const freq = 261.63 * Math.pow(2, i / 12);
            playNote(freq, 100);
            key.classList.add('active');
        });

        key.addEventListener('mouseup', () => {
            const freq = 261.63 * Math.pow(2, i / 12);
            stopNote(freq);
            key.classList.remove('active');
        });
        
        key.addEventListener('mouseleave', () => {
            const freq = 261.63 * Math.pow(2, i / 12);
            stopNote(freq);
            key.classList.remove('active');
        });

        keybed.appendChild(key);
    }
}
