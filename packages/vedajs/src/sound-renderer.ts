import * as THREE from 'three';
import { IUniforms, SAMPLE_HEIGHT, SAMPLE_WIDTH } from './constants';
import { getCtx } from './get-ctx';

const WIDTH = 32;
const HEIGHT = 64;
const PIXELS = WIDTH * HEIGHT;

const createShader = (shader: string, width: number) => `
precision mediump float;
uniform float iBlockOffset;
uniform float iSampleRate;

vec2 loadSound(in sampler2D soundname, in float t) {
    t *= iSampleRate;
    vec2 uv = vec2(
        mod(t, ${SAMPLE_WIDTH}.) / ${SAMPLE_WIDTH}.,
        floor(t / ${SAMPLE_WIDTH}.) / ${SAMPLE_HEIGHT}.
    );
    vec4 p = texture2D(soundname, uv);
    return vec2(
        (p.x * 65535. + p.y * 255.) / 65535.,
        (p.z * 65535. + p.w * 255.) / 65535.
    );
}

${shader}

void main(){
    float t = iBlockOffset + ((gl_FragCoord.x - 0.5) + (gl_FragCoord.y - 0.5) * ${width}.0) / iSampleRate;
    vec2 y = mainSound(t); // -1 to 1
    vec2 v  = floor((y * .5 + .5) * 65536.0); // 0 to 65536, int
    vec2 vl = mod(v, 256.) / 255.;
    vec2 vh = floor(v / 256.) / 255.;
    gl_FragColor = vec4(vh.x, vl.x, vh.y, vl.y);
}`;

export default class SoundRenderer {
    private target: THREE.WebGLRenderTarget;
    private scene: THREE.Scene | null = null;
    private camera: THREE.Camera | null = null;
    private renderer: THREE.WebGLRenderer;
    private wctx: WebGLRenderingContext;
    private uniforms: IUniforms;
    private soundUniforms: IUniforms;

    private audioBuffer: AudioBuffer;
    private ctx: AudioContext;
    private node: AudioBufferSourceNode;

    private soundLength = 3;
    private isPlaying = false;
    private start: number;
    private renderingId: number | null = null;

    constructor(uniforms: IUniforms) {
        this.ctx = getCtx();
        this.audioBuffer = this.ctx.createBuffer(
            2,
            this.ctx.sampleRate * this.soundLength,
            this.ctx.sampleRate,
        );
        this.node = this.createNode();
        this.start = this.ctx.currentTime;

        const canvas = document.createElement('canvas');
        canvas.width = WIDTH;
        canvas.height = HEIGHT;
        this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
        this.wctx = this.renderer.getContext();
        this.target = new THREE.WebGLRenderTarget(WIDTH, HEIGHT, {
            format: THREE.RGBAFormat,
        });

        this.uniforms = uniforms;
        this.soundUniforms = {
            iBlockOffset: { type: 'f', value: 0.0 },
            iSampleRate: { type: 'f', value: this.ctx.sampleRate },
        };
    }

    setLength(length: number) {
        this.soundLength = length;
        this.audioBuffer = this.ctx.createBuffer(
            2,
            this.ctx.sampleRate * this.soundLength,
            this.ctx.sampleRate,
        );
        const node = this.createNode();

        this.start = this.ctx.currentTime;

        if (this.isPlaying) {
            this.node.stop();
            node.start();
        }
        this.node.disconnect();
        this.node = node;
    }

    loadShader(fs: string) {
        const fragmentShader = createShader(fs, WIDTH);
        const geometry = new THREE.PlaneGeometry(2, 2);
        const material = new THREE.ShaderMaterial({
            fragmentShader,
            uniforms: { ...this.uniforms, ...this.soundUniforms },
        });
        const plane = new THREE.Mesh(geometry, material);
        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
        this.camera.position.set(0, 0, 1);
        this.camera.lookAt(this.scene.position);

        this.scene.add(plane);
    }

    play() {
        if (!this.isPlaying) {
            this.isPlaying = true;
            this.node.start();
            this.start = this.ctx.currentTime;
        }
        this.render();
    }

    stop() {
        if (this.isPlaying) {
            this.isPlaying = false;

            // Destroy old node
            this.node.stop();
            this.node.disconnect();

            // Create new node
            this.node = this.createNode();
        }
    }

    render = () => {
        if (this.renderingId) {
            window.cancelAnimationFrame(this.renderingId);
        }

        const outputDataL = this.audioBuffer.getChannelData(0);
        const outputDataR = this.audioBuffer.getChannelData(1);

        const allPixels = this.ctx.sampleRate * this.soundLength;
        const numBlocks = allPixels / PIXELS;

        const timeOffset =
            (this.ctx.currentTime - this.start) % this.soundLength;
        let pixelsForTimeOffset = timeOffset * this.ctx.sampleRate;
        pixelsForTimeOffset -= pixelsForTimeOffset % PIXELS;

        let j = 0;
        const renderOnce = () => {
            if (!this.scene || !this.camera) {
                console.warn(
                    'renderOnce is called before scene initialization',
                );
                return;
            }

            const off = (j * PIXELS + pixelsForTimeOffset) % allPixels;

            // Update uniform
            this.soundUniforms.iBlockOffset.value = off / this.ctx.sampleRate;
            this.renderer.setRenderTarget(this.target);
            this.renderer.render(this.scene, this.camera);
            this.renderer.setRenderTarget(null);

            // Get pixels
            const pixels = new Uint8Array(PIXELS * 4);
            this.wctx.readPixels(
                0,
                0,
                WIDTH,
                HEIGHT,
                this.wctx.RGBA,
                this.wctx.UNSIGNED_BYTE,
                pixels,
            );

            for (let i = 0; i < PIXELS; i++) {
                const ii = (off + i) % allPixels;
                outputDataL[ii] =
                    ((pixels[i * 4 + 0] * 256 + pixels[i * 4 + 1]) / 65535) *
                        2 -
                    1;
                outputDataR[ii] =
                    ((pixels[i * 4 + 2] * 256 + pixels[i * 4 + 3]) / 65535) *
                        2 -
                    1;
            }

            j++;
            if (j < numBlocks) {
                this.renderingId = requestAnimationFrame(renderOnce);
            } else {
                this.renderingId = null;
            }
        };

        this.renderingId = requestAnimationFrame(renderOnce);
    };

    private createNode(): AudioBufferSourceNode {
        const node = this.ctx.createBufferSource();
        node.loop = true;
        node.buffer = this.audioBuffer;
        node.connect(this.ctx.destination);
        return node;
    }
}
