/* @flow */
import * as THREE from 'three';

export default class AudioLoader {
    static ctx = new (window.AudioContext || window.webkitAudioContext)();

    _ctx: AudioContext;
    _gain: GainNode;
    _analyser: AnalyserNode;
    _input: MediaStreamAudioSourceNode;

    spectrum: THREE.DataTexture;
    samples: THREE.DataTexture;
    isPlaying: boolean = false;

    _spectrumArray: Uint8Array;
    _samplesArray: Uint8Array;
    _stream: any;

    constructor() {
      this._ctx = AudioLoader.ctx;
      this._gain = this._ctx.createGain();
      this._analyser = this._ctx.createAnalyser();
      this._analyser.connect(this._gain);
      this._gain.gain.value = 0;
      this._gain.connect(this._ctx.destination);

      this._analyser.fftSize = 512;
      this._analyser.smoothingTimeConstant = 0.4;
      this._spectrumArray = new Uint8Array(this._analyser.frequencyBinCount);
      this._samplesArray = new Uint8Array(this._analyser.frequencyBinCount);

      this.spectrum = new THREE.DataTexture(
        this._spectrumArray,
        this._analyser.frequencyBinCount,
        1,
        THREE.LuminanceFormat,
        THREE.UnsignedByteType
      );
      this.samples = new THREE.DataTexture(
        this._samplesArray,
        this._analyser.frequencyBinCount,
        1,
        THREE.LuminanceFormat,
        THREE.UnsignedByteType
      );
    }

    play(): void {
      (navigator: any).webkitGetUserMedia({ audio: true }, stream => {
        this._stream = stream;
        this._input = (this._ctx.createMediaStreamSource: (s: MediaStream) => MediaStreamAudioSourceNode)(stream);
        this._input.connect(this._analyser);
        this.isPlaying = true;
      }, err => {
        console.error(err);
      });
    }

    stop(): void {
      this.isPlaying = false;
      this._input.disconnect();
      this._stream.getTracks().forEach(t => t.stop());
    }

    update(): void {
      this._analyser.getByteFrequencyData(this._spectrumArray);
      this._analyser.getByteTimeDomainData(this._samplesArray);
      this.spectrum.needsUpdate = true;
      this.samples.needsUpdate = true;
    }

    getVolume(): number {
      return this._spectrumArray.reduce((x, y) => x + y, 0) / this._spectrumArray.length;
    }
}
