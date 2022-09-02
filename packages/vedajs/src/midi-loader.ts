import * as THREE from 'three';

export default class MidiLoader {
    midiTexture: THREE.DataTexture;
    noteTexture: THREE.DataTexture;
    private midiArray: Uint8Array;
    private noteArray: Uint8Array;
    private isEnabled = false;

    constructor() {
        this.midiArray = new Uint8Array(256 * 128);
        this.noteArray = new Uint8Array(128);

        this.midiTexture = new THREE.DataTexture(
            this.midiArray,
            256,
            128,
            THREE.LuminanceFormat,
            THREE.UnsignedByteType,
        );
        this.noteTexture = new THREE.DataTexture(
            this.noteArray,
            128,
            1,
            THREE.LuminanceFormat,
            THREE.UnsignedByteType,
        );
    }

    onstatechange = (access: WebMidi.MIDIAccess) => {
        access.inputs.forEach((i) => {
            i.onmidimessage = (m) => this.onmidimessage(m.data);
        });
    };

    onmidimessage = (midi: Uint8Array): void => {
        if (!this.isEnabled) {
            return;
        }

        const offset = midi[0] + midi[1] * 256;
        this.midiArray[offset] = midi[2];
        this.midiTexture.needsUpdate = true;

        // note on
        if (0x90 <= midi[0] && midi[0] < 0xa0) {
            this.noteArray[midi[1]] = midi[2] * 2; // Scale [0, 128) to [0, 256)
            this.noteTexture.needsUpdate = true;
        }

        // note off
        if (0x80 <= midi[0] && midi[0] < 0x90) {
            this.noteArray[midi[1]] = 0;
            this.noteTexture.needsUpdate = true;
        }
    };

    enable() {
        this.isEnabled = true;

        if (!navigator.requestMIDIAccess) {
            console.error("[VEDA] This browser doesn't support Web MIDI API.");
            return;
        }

        navigator
            .requestMIDIAccess({ sysex: false })
            .then((access: WebMidi.MIDIAccess) => {
                this.onstatechange(access);
                access.onstatechange = () => this.onstatechange(access);
            })
            .catch((e: Error) => console.log('Failed to load MIDI API', e));
    }

    disable() {
        this.isEnabled = false;
    }
}
