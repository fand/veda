'use babel';
import * as THREE from 'three';

export default class MidiLoader {
  constructor() {
    this.midiArray = new Uint8Array(256 * 4);

    this.texture = new THREE.DataTexture(
      this.midiArray,
      256,
      1,
      THREE.RGBAFormat,
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
  }

  getTexture() {
    return this.texture;
  }
}
