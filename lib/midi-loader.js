'use babel';
import * as THREE from 'three';

export default class MidiLoader {
  constructor() {
    this.midiArray = new Uint8Array(256 * 4);
    this.noteArray = new Uint8Array(128);

    this.texture = new THREE.DataTexture(
      this.midiArray,
      256,
      1,
      THREE.RGBAFormat,
      THREE.UnsignedByteType
    );
    this.noteTexture = new THREE.DataTexture(
      this.noteArray,
      128,
      1,
      THREE.LuminanceFormat,
      THREE.UnsignedByteType
    );

    this.init();
  }

  init() {
    navigator.requestMIDIAccess({ sysex: false })
      .then(access => {
        access.inputs.forEach(i => {
          i.onmidimessage = m => this.onmidimessage(m.data);
        });
      })
      .catch(e => console.log('Failed to load MIDI API', e));
  }

  onmidimessage = midi => {
    const offset = midi[0] * 4;
    this.midiArray[offset] = midi[1];
    this.midiArray[offset + 1] = midi[2];
    this.texture.needsUpdate = true;

    // note on
    if (0x90 <= midi[0] && midi[0] < 0xA0) {
      this.noteArray[midi[1]] = midi[2] * 2; // Scale [0, 128) to [0, 256)
      this.noteTexture.needsUpdate = true;
    }

    // note off
    if (0x80 <= midi[0] && midi[0] < 0x90) {
      this.noteArray[midi[1]] = 0;
      this.noteTexture.needsUpdate = true;
    }
  }
}
