interface Imported {
    PATH: string;
    SPEED?: number;
}

export interface ImportedHash {
    [key: string]: Imported;
}

export interface RcPassModel {
    PATH: string;
    MATERIAL?: string;
}

export type BlendMode = 'NO' | 'NORMAL' | 'ADD' | 'SUB' | 'MUL';

export interface RcPass {
    MODEL?: RcPassModel;
    TARGET?: string;
    vs?: string;
    fs?: string;
    FLOAT?: boolean;
    BLEND?: BlendMode;
    GLSL3?: boolean;
}

export interface Rc {
    glslangValidatorPath: string;
    IMPORTED: ImportedHash;
    PASSES: RcPass[];
    pixelRatio: number;
    frameskip: number;
    vertexMode: string;
    vertexCount: number;
    fftSize: number;
    fftSmoothingTimeConstant: number;
    audio: boolean;
    midi: boolean;
    keyboard: boolean;
    gamepad: boolean;
    camera: boolean;
    glslify: boolean;
    server: number | null;
    osc: number | null;
    soundLength: number;
}

interface RcFragmentWithoutImported {
    glslangValidatorPath?: string;
    pixelRatio?: number;
    frameskip?: number;
    vertexMode?: string;
    vertexCount?: number;
    fftSize?: number;
    fftSmoothingTimeConstant?: number;
    audio?: boolean;
    midi?: boolean;
    keyboard?: boolean;
    gamepad?: boolean;
    camera?: boolean;
    glslify?: boolean;
    server?: number | null;
    osc?: number | null;
    soundLength?: number;
}

export interface RcFragment extends RcFragmentWithoutImported {
    IMPORTED?: ImportedHash;
    PASSES?: RcPass[];
}

interface RcDiffFragment extends RcFragmentWithoutImported {
    IMPORTED: ImportedHash;
    PASSES?: RcPass[];
}

export interface RcDiff {
    newConfig: Rc;
    added: RcDiffFragment;
    removed: RcDiffFragment;
}
