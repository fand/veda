import * as fs from 'fs';
import * as path from 'path';
import * as p from 'pify';
import { exec } from 'child_process';
import * as mkdirp from 'mkdirp';

const ffmpeg = require('ffmpeg-static');
const shell = require('shell');

export type CaptureMode = 'mp4' | 'gif';

export default class Capturer {
    private isCapturing: boolean = false;
    private capturingFrames: number = 0;
    private capturedFrames: number = 0;
    private captureDir: string = '';
    private framesDir: string = '';

    private mode: CaptureMode = 'mp4';
    private fps: number = 60;
    private width: number = 1920;
    private height: number = 1080;

    setMode(mode: CaptureMode) {
        this.mode = mode;
    }

    async start(
        canvas: HTMLCanvasElement,
        fps: number,
        width: number,
        height: number,
        dst: string,
    ) {
        // Reset state
        this.isCapturing = true;
        this.capturingFrames = 0;
        this.capturedFrames = 0;

        // Set options
        this.fps = fps;
        this.width = width;
        this.height = height;

        this.captureDir = path.resolve(
            dst,
            'veda-capture',
            'capture-' + Date.now().toString(),
        );
        this.framesDir = path.resolve(this.captureDir, 'frames');
        await p(mkdirp)(this.captureDir);
        await p(mkdirp)(this.framesDir);

        atom.notifications.addInfo(
            `[VEDA] Start capturing to ${this.captureDir} ...`,
        );

        let frame = -1;
        const frameskip = 60 / this.fps;

        const capture = async () => {
            if (!this.isCapturing) {
                return;
            }

            frame++;
            if (frame % frameskip !== 0) {
                requestAnimationFrame(capture);
                return;
            }

            const pngDataUrl = canvas.toDataURL('image/png');
            const filename =
                'veda-' +
                this.capturingFrames.toString().padStart(5, '0') +
                '.png';

            this.capturingFrames++;
            requestAnimationFrame(capture);

            const pngBuf = new Buffer(
                pngDataUrl.replace(/^data:image\/\w+;base64,/, ''),
                'base64',
            );
            const dstPath = path.resolve(this.framesDir, filename);
            await p(fs.writeFile)(dstPath, pngBuf);

            this.capturedFrames++;
        };

        capture();
    }

    async stop() {
        if (!this.isCapturing) {
            return;
        }
        this.isCapturing = false;

        const timer = setInterval(async () => {
            if (this.capturingFrames !== this.capturedFrames) {
                return;
            }
            clearTimeout(timer);
            this.finalize();
        }, 300);
    }

    private async finalize() {
        const basename = `veda-${Date.now()}.${this.mode}`;
        const dst = path.resolve(this.captureDir, basename);

        atom.notifications.addInfo(`[VEDA] Converting images to ${dst}...`);

        if (this.mode === 'mp4') {
            await this.convertToMp4(dst);
        } else if (this.mode === 'gif') {
            await this.convertToGif(dst);
        }

        atom.notifications.addSuccess(`[VEDA] Captured to ${dst}`);

        shell.showItemInFolder(dst);
    }

    private async convertToMp4(dst: string) {
        const capturedFilesPath = path.resolve(this.framesDir, 'veda-%5d.png');

        await p(exec)(
            [
                ffmpeg.path,
                `-framerate ${this.fps}`,
                `-i ${capturedFilesPath}`,
                `-c:v libx264`,
                `-vf "pad=ceil(iw/2)*2:ceil(ih/2)*2"`,
                `-r ${this.fps} -pix_fmt yuv420p`,
                dst,
            ].join(' '),
        );
    }

    private async convertToGif(dst: string) {
        const capturedFilesPath = path.resolve(this.framesDir, 'veda-%5d.png');
        const palettePath = path.resolve(this.captureDir, 'palette.png');
        const filters = `fps=${this.fps},scale=${this.width}:${
            this.height
        }:flags=lanczos,pad=ceil(iw/2)*2:ceil(ih/2)*2`;

        await p(exec)(
            [
                ffmpeg.path,
                ` -i ${capturedFilesPath}`,
                ` -vf palettegen ${palettePath}`,
            ].join(' '),
        );

        await p(exec)(
            [
                ffmpeg.path,
                `-framerate ${this.fps}`,
                `-i ${capturedFilesPath}`,
                `-i ${palettePath}`,
                `-lavfi "${filters} [x];[x][1:v]paletteuse"`,
                dst,
            ].join(' '),
        );
    }

    setCaptureMode(mode: CaptureMode) {
        this.mode = mode;
    }
}
