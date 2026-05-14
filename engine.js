const keybed = document.getElementById('piano-keys');
const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Generate 2 Octaves for the UI
for (let i = 0; i < 24; i++) {
    const noteName = notes[i % 12];
    const key = document.createElement('div');
    key.className = noteName.includes('#') ? 'black-key' : 'white-key';
    
    key.addEventListener('mousedown', () => {
        const freq = 261.63 * Math.pow(2, i / 12); // Starting at Middle C
        playNote(freq, 100);
        key.classList.add('active');
    });

    key.addEventListener('mouseup', () => {
        const freq = 261.63 * Math.pow(2, i / 12);
        stopNote(freq);
        key.classList.remove('active');
    });

    keybed.appendChild(key);
}
