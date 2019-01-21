import * as fs from 'fs';
import * as path from 'path';
import * as p from 'pify';
import { exec } from 'child_process';
import * as mkdirp from 'mkdirp';

const ffmpeg = require('ffmpeg-static');
const shell = require('shell');

export type RecordingMode = 'mp4' | 'gif';

export default class Recorder {
    private isRecording: boolean = false;
    private recordingFrames: number = 0;
    private recordedFrames: number = 0;
    private recordDir: string = '';
    private framesDir: string = '';

    private mode: RecordingMode = 'mp4';
    private fps: number = 60;
    private width: number = 1920;
    private height: number = 1080;

    setMode(mode: RecordingMode) {
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
        this.isRecording = true;
        this.recordingFrames = 0;
        this.recordedFrames = 0;

        // Set options
        this.fps = fps;
        this.width = width;
        this.height = height;

        const timestamp = new Date()
            .toISOString()
            .replace(/\..*/, '')
            .replace(/[^\d]/g, '-');

        this.recordDir = path.resolve(dst, 'veda-recordings', timestamp);
        this.framesDir = path.resolve(this.recordDir, 'frames');
        await p(mkdirp)(this.recordDir);
        await p(mkdirp)(this.framesDir);

        atom.notifications.addInfo(
            `[VEDA] Start recording to ${this.recordDir} ...`,
        );

        let frame = -1;
        const frameskip = 60 / this.fps;

        const capture = async () => {
            if (!this.isRecording) {
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
                this.recordingFrames.toString().padStart(5, '0') +
                '.png';

            this.recordingFrames++;
            requestAnimationFrame(capture);

            const pngBuf = new Buffer(
                pngDataUrl.replace(/^data:image\/\w+;base64,/, ''),
                'base64',
            );
            const dstPath = path.resolve(this.framesDir, filename);
            await p(fs.writeFile)(dstPath, pngBuf);

            this.recordedFrames++;
        };

        capture();
    }

    async stop() {
        if (!this.isRecording) {
            return;
        }
        this.isRecording = false;

        const timer = setInterval(async () => {
            if (this.recordingFrames !== this.recordedFrames) {
                return;
            }
            clearTimeout(timer);
            this.finalize();
        }, 300);
    }

    private async finalize() {
        const basename = `veda-${Date.now()}.${this.mode}`;
        const dst = path.resolve(this.recordDir, basename);

        atom.notifications.addInfo(`[VEDA] Converting images to ${dst}...`);

        if (this.mode === 'mp4') {
            await this.convertToMp4(dst);
        } else if (this.mode === 'gif') {
            await this.convertToGif(dst);
        }

        atom.notifications.addSuccess(`[VEDA] Recorded to ${dst}`);

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
        const palettePath = path.resolve(this.recordDir, 'palette.png');
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

    setRecordingMode(mode: RecordingMode) {
        if (mode === 'mp4' || mode === 'gif') {
            this.mode = mode;
        }
    }
}
