import GIF, { IGIFFrame } from '@fand/gifuct-js';

export default class GIFPlayer {
    frames: IGIFFrame[] = [];
    index = 0;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    pixelRatio: number;
    startTime: number; // msec
    playTime = 0;

    static async create(src: string, pixelRatio: number): Promise<GIFPlayer> {
        const gif = await fetch(src)
            .then((resp) => resp.arrayBuffer())
            .then((buff) => new GIF(buff));

        const frames = gif.decompressFrames(true);
        const width = gif.raw.lsd.width;
        const height = gif.raw.lsd.height;

        return new GIFPlayer(frames, width, height, pixelRatio);
    }

    private constructor(
        frames: IGIFFrame[],
        width: number,
        height: number,
        pixelRatio: number,
    ) {
        this.frames = frames;
        this.canvas = document.createElement('canvas');

        const ctx = this.canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Failed to create canvas 2D context');
        }
        this.ctx = ctx;

        this.pixelRatio = pixelRatio;

        // Override canvas size by image size
        // Because canvas does not support scaling ImageData.
        this.canvas.width = width;
        this.canvas.height = height;

        this.startTime = Date.now();
    }

    getCanvas(): HTMLCanvasElement {
        return this.canvas;
    }

    update(): void {
        const now = Date.now();
        const elapsedTime = now - this.startTime;

        while (this.playTime < elapsedTime) {
            const f = this.frames[this.index % this.frames.length];
            this.playTime += f.delay;
            this.index++;
        }
        const frame = this.frames[this.index % this.frames.length];

        const image = new ImageData(
            frame.patch,
            frame.dims.width,
            frame.dims.height,
        );

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.putImageData(image, frame.dims.left, frame.dims.top);
    }
}
