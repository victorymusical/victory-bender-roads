// Victory Bender Roads - Core Audio Engine
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const voices = new Map();
const MAX_VOICES = 16;

// Parameters for our "Victory" Engineering
let barkAmount = 0.5;
let benderDepth = 0.3;
let tremoloSpeed = 4.0;
let mechanicalVolume = 0.4;

// 1. Silk to Steel Saturation Curve
function createBarkCurve(amount) {
    let n_samples = 44100,
        curve = new Float32Array(n_samples),
        x;
    for (let i = 0; i < n_samples; ++i) {
        x = i * 2 / n_samples - 1;
        curve[i] = (3 + amount) * x * 20 * (Math.PI / 180) / (Math.PI + amount * Math.abs(x));
    }
    return curve;
}

// 2. The Pulse (Visual Gold LED)
const led = document.getElementById('tremolo-led');
setInterval(() => {
    led.classList.toggle('active');
}, (1000 / tremoloSpeed) / 2);

// 3. Voice Management (16-Voice Polyphony)
function playNote(frequency, velocity) {
    if (voices.size >= MAX_VOICES) {
        const oldest = voices.keys().next().value;
        stopNote(oldest);
    }

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    const barkShaper = audioCtx.createWaveShaper();

    // Harmonic "Bite Zone" logic
    osc.type = 'sine'; 
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);

    // Silk to Steel Mapping
    const intensity = velocity / 127;
    barkShaper.curve = createBarkCurve(intensity * 10 * barkAmount);

    // The 8-12 Second Soulful Decay
    gainNode.gain.setValueAtTime(intensity, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 10);

    osc.connect(barkShaper);
    barkShaper.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start();
    voices.set(frequency, { osc, gainNode });
}

function stopNote(frequency) {
    const voice = voices.get(frequency);
    if (voice) {
        const now = audioCtx.currentTime;
        // The Mechanical Release Timing
        voice.gainNode.gain.cancelScheduledValues(now);
        voice.gainNode.gain.setValueAtTime(voice.gainNode.gain.value, now);
        voice.gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        
        setTimeout(() => {
            voice.osc.stop();
            voices.delete(frequency);
        }, 100);
    }
}

// Example Trigger for Testing (Middle C)
window.addEventListener('keydown', (e) => {
    if(e.key === 'a') playNote(261.63, 100);
});
window.addEventListener('keyup', (e) => {
    if(e.key === 'a') stopNote(261.63);
});