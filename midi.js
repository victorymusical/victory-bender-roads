// Victory Bender Roads - MIDI Interpreter
if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
}

function onMIDISuccess(midiAccess) {
    const inputs = midiAccess.inputs.values();
    for (let input of inputs) {
        input.onmidimessage = getMIDIMessage;
    }
}

function getMIDIMessage(message) {
    const command = message.data[0];
    const note = message.data[1];
    const velocity = (message.data.length > 2) ? message.data[2] : 0;

    switch (command) {
        case 144: // Note On
            if (velocity > 0) {
                // MIDI Frequency Formula
                const freq = 440 * Math.pow(2, (note - 69) / 12);
                playNote(freq, velocity);
            } else {
                stopNote(440 * Math.pow(2, (note - 69) / 12));
            }
            break;
        case 128: // Note Off
            stopNote(440 * Math.pow(2, (note - 69) / 12));
            break;
    }
}

function onMIDIFailure() {
    console.log('Could not access your MIDI devices.');
}