/* @flow */
import * as THREE from 'three';

export default class MidiLoader {
  _midiArray: Uint8Array;
  _noteArray: Uint8Array;
  midiTexture: THREE.DataTexture;
  noteTexture: THREE.DataTexture;
  _isEnabled: boolean = false;

  constructor() {
    this._midiArray = new Uint8Array(256 * 128);
    this._noteArray = new Uint8Array(128);

    this.midiTexture = new THREE.DataTexture(
      this._midiArray,
      256,
      128,
      THREE.LuminanceFormat,
      THREE.UnsignedByteType
    );
    this.noteTexture = new THREE.DataTexture(
      this._noteArray,
      128,
      1,
      THREE.LuminanceFormat,
      THREE.UnsignedByteType
    );

    (navigator: any).requestMIDIAccess({ sysex: false })
      .then(access => {
        access.inputs.forEach(i => {
          i.onmidimessage = m => this.onmidimessage(m.data);
        });
      })
      .catch(e => console.log('Failed to load MIDI API', e));
  }

  onmidimessage = (midi: number[]): void => {
    if (!this._isEnabled) {
      return;
    }

    const offset = midi[0] + midi[1] * 256;
    this._midiArray[offset] = midi[2];
    this.midiTexture.needsUpdate = true;

    // note on
    if (0x90 <= midi[0] && midi[0] < 0xA0) {
      this._noteArray[midi[1]] = midi[2] * 2; // Scale [0, 128) to [0, 256)
      this.noteTexture.needsUpdate = true;
    }

    // note off
    if (0x80 <= midi[0] && midi[0] < 0x90) {
      this._noteArray[midi[1]] = 0;
      this.noteTexture.needsUpdate = true;
    }
  }

  enable() {
    this._isEnabled = true;
  }

  disable() {
    this._isEnabled = false;
  }
}
