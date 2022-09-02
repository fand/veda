import * as THREE from 'three';
import { getCtx } from './get-ctx';

export interface IAudioOptions {
    fftSize?: number;
    fftSmoothingTimeConstant?: number;
}

const DEFAULT_AUDIO_OPTIONS = {
    fftSize: 2048,
    fftSmoothingTimeConstant: 0.8,
};

/**
 * THREE.DataTexture uses a plain object to hold image data instead of ImageData type.
 * This allows us to mutate data on update.
 */
type MutableImageData = {
    data: BufferSource;
    width: number;
    height: number;
};

export default class AudioLoader {
    spectrum: THREE.DataTexture;
    samples: THREE.DataTexture;
    isPlaying = false;
    isEnabled = false;

    private ctx: AudioContext;
    private gain: GainNode;
    private analyser: AnalyserNode;
    private input: MediaStreamAudioSourceNode | null = null;

    private spectrumArray: Uint8Array;
    private samplesArray: Uint8Array;
    private stream: MediaStream | undefined;

    private willPlay: Promise<void> | null = null;

    constructor(rcOpt: IAudioOptions) {
        const rc = {
            ...DEFAULT_AUDIO_OPTIONS,
            ...rcOpt,
        };

        this.ctx = getCtx();
        this.analyser = this.ctx.createAnalyser();
        this.analyser.smoothingTimeConstant = rc.fftSmoothingTimeConstant;
        this.analyser.fftSize = rc.fftSize;

        this.gain = this.ctx.createGain();
        this.gain.gain.setValueAtTime(0, this.ctx.currentTime);

        this.analyser.connect(this.gain);
        this.gain.connect(this.ctx.destination);

        this.spectrumArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.samplesArray = new Uint8Array(this.analyser.frequencyBinCount);

        this.spectrum = new THREE.DataTexture(
            this.spectrumArray,
            this.analyser.frequencyBinCount,
            1,
            THREE.LuminanceFormat,
            THREE.UnsignedByteType,
        );
        this.samples = new THREE.DataTexture(
            this.samplesArray,
            this.analyser.frequencyBinCount,
            1,
            THREE.LuminanceFormat,
            THREE.UnsignedByteType,
        );
    }

    enable(): void {
        this.willPlay = (async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                });
                this.stream = stream;
                this.input = this.ctx.createMediaStreamSource(stream);
                this.input.connect(this.analyser);
                this.isEnabled = true;
            } catch (e) {
                console.error(e);
            }
        })();
    }

    disable(): void {
        if (this.isEnabled && this.willPlay) {
            this.willPlay.then(() => {
                this.isEnabled = false;
                this.input && this.input.disconnect();
                this.stream
                    ?.getTracks()
                    .forEach((t: MediaStreamTrack) => t.stop());
            });
        }
    }

    update(): void {
        this.analyser.getByteFrequencyData(this.spectrumArray);
        this.analyser.getByteTimeDomainData(this.samplesArray);
        this.spectrum.needsUpdate = true;
        this.samples.needsUpdate = true;
    }

    getVolume(): number {
        let v = 0;
        this.samplesArray.forEach((x) => {
            v += Math.pow(x / 128 - 1, 2);
        });
        const rms = Math.sqrt(v / this.samplesArray.length);
        return rms;
    }

    setFftSize(fftSize: number): void {
        this.analyser.fftSize = fftSize;
        this.spectrumArray = new Uint8Array(this.analyser.frequencyBinCount);
        this.samplesArray = new Uint8Array(this.analyser.frequencyBinCount);

        const spectrumImage = this.spectrum.image as MutableImageData;
        spectrumImage.data = this.spectrumArray;
        spectrumImage.width = this.analyser.frequencyBinCount;

        const samplesImage = this.samples.image as MutableImageData;
        samplesImage.data = this.samplesArray;
        samplesImage.width = this.analyser.frequencyBinCount;
    }

    setFftSmoothingTimeConstant(fftSmoothingTimeConstant: number): void {
        this.analyser.smoothingTimeConstant = fftSmoothingTimeConstant;
    }
}
