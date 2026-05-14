// Victory "Wake Up" Logic
window.addEventListener('mousedown', () => {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
        console.log("Victory Engine Online");
    }
});

// Update the playNote function to handle the Pulse LED
function playNote(frequency, velocity) {
    if (voices.size >= MAX_VOICES) {
        const oldest = voices.keys().next().value;
        stopNote(oldest);
    }

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);

    // Initial Strike and the 8-12 Second Decay
    const volume = velocity / 127;
    gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 10);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start();
    voices.set(frequency, { osc, gainNode });
}
