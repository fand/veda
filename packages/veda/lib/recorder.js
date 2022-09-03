"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const pify_1 = __importDefault(require("pify"));
const mkdirp_1 = __importDefault(require("mkdirp"));
const ffmpegPath = __importStar(require("ffmpeg-static"));
const shell = require("shell");
class Recorder {
    constructor() {
        this.isRecording = false;
        this.recordingFrames = 0;
        this.recordedFrames = 0;
        this.recordDir = '';
        this.framesDir = '';
        this.mode = 'mp4';
        this.fps = 60;
        this.width = 1920;
        this.height = 1080;
    }
    setMode(mode) {
        this.mode = mode;
    }
    start(canvas, fps, width, height, dst) {
        return __awaiter(this, void 0, void 0, function* () {
            this.isRecording = true;
            this.recordingFrames = 0;
            this.recordedFrames = 0;
            this.fps = fps;
            this.width = width;
            this.height = height;
            const timestamp = new Date()
                .toISOString()
                .replace(/\..*/, '')
                .replace(/[^\d]/g, '-');
            this.recordDir = path_1.default.resolve(dst, 'veda-recordings', timestamp);
            this.framesDir = path_1.default.resolve(this.recordDir, 'frames');
            yield (0, mkdirp_1.default)(this.recordDir);
            yield (0, mkdirp_1.default)(this.framesDir);
            atom.notifications.addInfo(`[VEDA] Start recording to ${this.recordDir} ...`);
            let frame = -1;
            const frameskip = 60 / this.fps;
            const capture = () => __awaiter(this, void 0, void 0, function* () {
                if (!this.isRecording) {
                    return;
                }
                frame++;
                if (frame % frameskip !== 0) {
                    requestAnimationFrame(capture);
                    return;
                }
                const pngDataUrl = canvas.toDataURL('image/png');
                const filename = 'veda-' +
                    this.recordingFrames.toString().padStart(5, '0') +
                    '.png';
                this.recordingFrames++;
                requestAnimationFrame(capture);
                const pngBuf = new Buffer(pngDataUrl.replace(/^data:image\/\w+;base64,/, ''), 'base64');
                const dstPath = path_1.default.resolve(this.framesDir, filename);
                yield (0, pify_1.default)(fs_1.default.writeFile)(dstPath, pngBuf);
                this.recordedFrames++;
            });
            capture();
        });
    }
    stop() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.isRecording) {
                return;
            }
            this.isRecording = false;
            const timer = setInterval(() => __awaiter(this, void 0, void 0, function* () {
                if (this.recordingFrames !== this.recordedFrames) {
                    return;
                }
                clearTimeout(timer);
                this.finalize();
            }), 300);
        });
    }
    finalize() {
        return __awaiter(this, void 0, void 0, function* () {
            const basename = `veda-${Date.now()}.${this.mode}`;
            const dst = path_1.default.resolve(this.recordDir, basename);
            atom.notifications.addInfo(`[VEDA] Converting images to ${dst}...`);
            if (this.mode === 'mp4') {
                yield this.convertToMp4(dst);
            }
            else if (this.mode === 'gif') {
                yield this.convertToGif(dst);
            }
            atom.notifications.addSuccess(`[VEDA] Recorded to ${dst}`);
            shell.showItemInFolder(dst);
        });
    }
    convertToMp4(dst) {
        return __awaiter(this, void 0, void 0, function* () {
            const capturedFilesPath = path_1.default.resolve(this.framesDir, 'veda-%5d.png');
            yield (0, pify_1.default)(child_process_1.exec)([
                ffmpegPath,
                `-framerate ${this.fps}`,
                `-i ${capturedFilesPath}`,
                `-c:v libx264`,
                `-vf "pad=ceil(iw/2)*2:ceil(ih/2)*2"`,
                `-r ${this.fps} -pix_fmt yuv420p`,
                dst,
            ].join(' '));
        });
    }
    convertToGif(dst) {
        return __awaiter(this, void 0, void 0, function* () {
            const capturedFilesPath = path_1.default.resolve(this.framesDir, 'veda-%5d.png');
            const palettePath = path_1.default.resolve(this.recordDir, 'palette.png');
            const filters = `fps=${this.fps},scale=${this.width}:${this.height}:flags=lanczos,pad=ceil(iw/2)*2:ceil(ih/2)*2`;
            yield (0, pify_1.default)(child_process_1.exec)([
                ffmpegPath,
                ` -i ${capturedFilesPath}`,
                ` -vf palettegen ${palettePath}`,
            ].join(' '));
            yield (0, pify_1.default)(child_process_1.exec)([
                ffmpegPath,
                `-framerate ${this.fps}`,
                `-i ${capturedFilesPath}`,
                `-i ${palettePath}`,
                `-lavfi "${filters} [x];[x][1:v]paletteuse"`,
                dst,
            ].join(' '));
        });
    }
    setRecordingMode(mode) {
        if (mode === 'mp4' || mode === 'gif') {
            this.mode = mode;
        }
    }
}
exports.default = Recorder;
//# sourceMappingURL=recorder.js.map