import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as path from 'path';
import * as JSON5 from 'json5';
import * as p from 'pify';
import { throttle } from 'lodash';

interface IImported {
    PATH: string;
    SPEED?: number;
}

export interface IImportedHash {
    [key: string]: IImported;
}

export interface IRcPass {
    OBJ?: string;
    TARGET?: string;
    vs?: string;
    fs?: string;
    FLOAT?: boolean;
}

export interface IRc {
    glslangValidatorPath: string;
    IMPORTED: IImportedHash;
    PASSES: IRcPass[];
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

interface IRcFragmentWithoutImported {
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

interface IRcFragment extends IRcFragmentWithoutImported {
    IMPORTED?: IImportedHash;
    PASSES?: IRcPass[];
}

interface IRcDiffFragment extends IRcFragmentWithoutImported {
    IMPORTED: IImportedHash;
    PASSES?: IRcPass[];
}

export interface IRcDiff {
    newConfig: IRc;
    added: IRcDiffFragment;
    removed: IRcDiffFragment;
}

const DEFAULT_RC = {
    glslangValidatorPath: 'glslangValidator',
    IMPORTED: {},
    PASSES: [],
    pixelRatio: 2,
    frameskip: 2,
    vertexMode: 'LINE_STRIP',
    vertexCount: 3000,
    fftSize: 2048,
    fftSmoothingTimeConstant: 0.8,
    audio: false,
    midi: false,
    keyboard: false,
    gamepad: false,
    camera: false,
    glslify: false,
    server: null,
    osc: null,
    soundLength: 30,
};

function resolvePath(val: string, projectPath: string): string {
    if (val.match('https?://')) {
        return val;
    }
    return path.resolve(projectPath, val);
}

function parseImported(
    projectPath: string,
    importedHash?: IImportedHash,
): IImportedHash | null {
    if (!importedHash) {
        return null;
    }
    const newImportedHash: IImportedHash = {};

    Object.keys(importedHash).forEach(key => {
        const imported = (importedHash as any)[key];
        if (!imported || !imported.PATH) {
            return;
        }
        let importedPath = imported.PATH;

        if (!/^\/$/.test(importedPath)) {
            importedPath = resolvePath(importedPath, projectPath);
        }

        newImportedHash[key] = {
            PATH: importedPath,
            SPEED: imported.SPEED || 1,
        };
    });

    return newImportedHash;
}

function fixPath(projectPath: string, rc: IRcFragment): IRcFragment {
    const PASSES = (rc.PASSES || []).map(pass => {
        if (pass.OBJ) {
            pass.OBJ = resolvePath(pass.OBJ, projectPath);
        }
        return pass;
    });

    return {
        ...rc,
        IMPORTED: parseImported(projectPath, rc.IMPORTED) || {},
        PASSES,
    };
}

export default class Config extends EventEmitter {
    rc: IRc;
    soundRc: IRc;
    projectPath: string;

    private globalRc: IRcFragment = {};
    private projectRc: IRcFragment = {};
    private fileRc: IRcFragment = {};
    private soundFileRc: IRcFragment = {};
    private isWatching: boolean = false;

    constructor(projectPath: string, rc: IRcFragment) {
        super();

        this.rc = DEFAULT_RC;
        this.soundRc = DEFAULT_RC;
        this.setGlobalSettings(rc);

        this.projectPath = projectPath;
        if (projectPath) {
            fs.watch(projectPath, (_, filename) => {
                if (filename === '.liverc' || filename === '.vedarc') {
                    this.load();
                }
            });
        }
    }

    play(): void {
        this.isWatching = true;
        this.load();
    }

    stop(): void {
        this.isWatching = false;
        this.rc = DEFAULT_RC;
        this.soundRc = DEFAULT_RC;
    }

    private readConfigFile = (filename: string) => {
        return p(fs.readFile)(
            path.resolve(this.projectPath, filename),
            'utf8',
        ).then((data: IRcFragment) => ({ filename, data }));
    };

    load = (): Promise<void> | null => {
        if (!this.isWatching) {
            return null;
        }

        // Load .liverc or .vedarc
        return this.readConfigFile('.liverc')
            .then(d => {
                console.log(
                    '[VEDA] `.liverc` is deprecated. Use `.vedarc` instead.',
                );
                return d;
            })
            .catch(() => this.readConfigFile('.vedarc'))
            .then(({ filename, data }: any) => {
                try {
                    const rc = fixPath(this.projectPath, JSON5.parse(data));
                    this.setProjectSettings(rc);
                } catch (e) {
                    console.log('[VEDA] Failed to parse rc file:', filename);
                }
            })
            .catch(() => {
                console.log('[VEDA] config file not found');
            });
    };

    createRc(): IRc {
        const IMPORTED: IImportedHash = {
            ...this.projectRc.IMPORTED,
            ...this.fileRc.IMPORTED,
        };

        return {
            ...DEFAULT_RC,
            ...this.globalRc,
            ...this.projectRc,
            ...this.fileRc,
            IMPORTED,
        };
    }

    createSoundRc(): IRc {
        const IMPORTED: IImportedHash = {
            ...this.projectRc.IMPORTED,
            ...this.soundFileRc.IMPORTED,
        };

        return {
            ...DEFAULT_RC,
            ...this.globalRc,
            ...this.projectRc,
            ...this.soundFileRc,
            IMPORTED,
        };
    }

    setGlobalSettings(rc: IRcFragment) {
        // _globalRc must be extended everytime,
        // because setGlobalSettings can be called for properties one by one.
        this.globalRc = { ...this.globalRc, ...rc };
        this.onChange();
    }

    setProjectSettings(rc: IRcFragment) {
        this.projectRc = rc;
        this.onChange();
    }

    setFileSettings(rc: IRcFragment): IRcDiff {
        this.fileRc = rc;
        const newRc = this.createRc();
        const diff = this.getDiff(this.rc, newRc);
        this.rc = newRc;
        return diff;
    }

    setSoundSettings(rc: IRcFragment): IRcDiff {
        this.soundFileRc = rc;
        const newRc = this.createSoundRc();
        const diff = this.getDiff(this.soundRc, newRc);
        this.soundRc = newRc;
        return diff;
    }

    private parseComment(filepath: string, comment: string): IRcFragment {
        let rc: IRcFragment = {};
        try {
            rc = JSON5.parse(comment);
        } catch (e) {}

        rc = fixPath(path.dirname(filepath), rc);

        return rc;
    }

    setFileSettingsByString(filepath: string, comment: string): IRcDiff {
        return this.setFileSettings(this.parseComment(filepath, comment));
    }

    setSoundSettingsByString(filepath: string, comment: string): IRcDiff {
        return this.setSoundSettings(this.parseComment(filepath, comment));
    }

    onChange = throttle(() => {
        const newRc = this.createRc();
        this.emit('change', this.getDiff(this.rc, newRc));
        this.rc = newRc;
    }, 100);

    onChangeSound = throttle(() => {
        const newRc = this.createSoundRc();
        this.emit('changeSound', this.getDiff(this.soundRc, newRc));
        this.soundRc = newRc;
    }, 100);

    private getDiff(oldObj: IRc, newObj: IRc) {
        const diff: IRcDiff = {
            newConfig: newObj,
            added: { IMPORTED: {} },
            removed: { IMPORTED: {} },
        };

        // Get diffs of IMPORTED
        const newIMPORTED = newObj.IMPORTED;
        const oldIMPORTED = oldObj.IMPORTED;

        Object.keys(newIMPORTED).forEach(key => {
            const newImport = newIMPORTED[key] || {};
            const oldImport = oldIMPORTED[key] || {};
            if (
                oldImport.PATH &&
                (newImport.PATH !== oldImport.PATH ||
                    newImport.SPEED !== oldImport.SPEED)
            ) {
                diff.removed.IMPORTED[key] = oldImport;
            }
            if (
                newImport.PATH &&
                (newImport.PATH !== oldImport.PATH ||
                    newImport.SPEED !== oldImport.SPEED)
            ) {
                diff.added.IMPORTED[key] = newImport;
            }
        });

        // Get updated properties
        if (newObj.pixelRatio !== oldObj.pixelRatio) {
            diff.added.pixelRatio = newObj.pixelRatio;
        }
        if (newObj.frameskip !== oldObj.frameskip) {
            diff.added.frameskip = newObj.frameskip;
        }
        if (newObj.vertexMode !== oldObj.vertexMode) {
            diff.added.vertexMode = newObj.vertexMode;
        }
        if (newObj.vertexCount !== oldObj.vertexCount) {
            diff.added.vertexCount = newObj.vertexCount;
        }
        if (newObj.glslangValidatorPath !== oldObj.glslangValidatorPath) {
            diff.added.glslangValidatorPath = newObj.glslangValidatorPath;
        }
        if (newObj.fftSize !== oldObj.fftSize) {
            diff.added.fftSize = newObj.fftSize;
        }
        if (
            newObj.fftSmoothingTimeConstant !== oldObj.fftSmoothingTimeConstant
        ) {
            diff.added.fftSmoothingTimeConstant =
                newObj.fftSmoothingTimeConstant;
        }

        if (newObj.audio !== oldObj.audio) {
            diff.added.audio = newObj.audio;
        }
        if (newObj.camera !== oldObj.camera) {
            diff.added.camera = newObj.camera;
        }
        if (newObj.gamepad !== oldObj.gamepad) {
            diff.added.gamepad = newObj.gamepad;
        }
        if (newObj.midi !== oldObj.midi) {
            diff.added.midi = newObj.midi;
        }
        if (newObj.keyboard !== oldObj.keyboard) {
            diff.added.keyboard = newObj.keyboard;
        }

        if (newObj.server !== oldObj.server) {
            diff.added.server = newObj.server;
        }
        if (newObj.osc !== oldObj.osc) {
            diff.added.osc = newObj.osc;
        }
        if (newObj.soundLength !== oldObj.soundLength) {
            diff.added.soundLength = newObj.soundLength;
        }

        return diff;
    }
}
