'use babel';

import * as THREE from 'three';

export default class AudioLoader {
    static ctx = new (window.AudioContext || window.webkitAudioContext)();

    constructor() {
        this.ctx = AudioLoader.ctx;
        this.gain = this.ctx.createGain();
        this.analyser = this.ctx.createAnalyser();
        this.analyser.connect(this.gain);
        this.gain.connect(this.ctx.destination);

        this.analyser.fftSize = 512;
        this.spectrumArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.samplesArray = new Uint8Array(this.analyser.frequencyBinCount);

        this.spectrum = new THREE.DataTexture(
            this.spectrumArray,
            this.analyser.frequencyBinCount,
            1,
            THREE.LuminanceFormat,
            THREE.UnsignedByteType
        );
        this.samples = new THREE.DataTexture(
            this.samplesArray,
            this.analyser.frequencyBinCount,
            1,
            THREE.LuminanceFormat,
            THREE.UnsignedByteType
        );

        this.isPlaying = false;

        navigator.webkitGetUserMedia({ audio: true }, (stream) => {
            this.stream = stream;
            this.input = this.ctx.createMediaStreamSource(stream);
            this.input.connect(this.analyser);
        }, (err) => {
            console.error(err);
        });
    }

    play() {
        this.isPlaying = true;
    }

    stop() {
        this.isPlaying = false;
    }

    update() {
        this.analyser.getByteFrequencyData(this.spectrumArray);
        this.analyser.getByteTimeDomainData(this.samplesArray);
        this.spectrum.needsUpdate = true;
        this.samples.needsUpdate = true;
    }

    /**
     * @returns {number}
     */
    getVolume() {
        return this.spectrumArray.reduce((x, y) => x + y, 0) / this.spectrumArray.length;
    }
}
