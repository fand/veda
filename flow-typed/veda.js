type vertexMode =
  'POINTS' |
  'LINE_STRIP' |
  'LINE_LOOP' |
  'LINES' |
  'TRI_STRIP' |
  'TRI_FAN' |
  'TRIANGLES';

declare module 'veda' {
  declare interface VedaOptions {
    pixelRatio: number;
    frameskip: number;
    vertexMode: string;
    vertexCount: number;
  }

  declare interface Pass {
    TARGET?: string;
    vs?: string;
    fs?: string;
  }

  declare type Shader = Pass[];

  declare class Veda {
    constructor(options: VedaOptions): void;
    setPixelRatio(pixelRatio: number): void;
    setFrameskip(frameskip: number): void;
    setVertexCount(vertexCount: number): void;
    setVertexMode(vertexMode: vertexMode): void;
    setCanvas(canvas: HTMLCanvasElement): void;
    loadShader(shader: Shader): void;
    loadTexture(name: string, textureUrl: string): void;
    unloadTexture(name: string, textureUrl: string, remove: boolean): void;
    play(): void;
    stop(): void;
    toggleAudio(flag: boolean): void;
    toggleMidi(flag: boolean): void;
    toggleCamera(flag: boolean): void;
    toggleKeyboard(flag: boolean): void;
    toggleGamepad(flag: boolean): void;
  }

  declare interface VedaExports {
    default: Veda;
  }

  declare module.exports: VedaExports;
}
