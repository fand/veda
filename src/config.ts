import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as path from 'path';
import * as JSON5 from 'json5';
import * as p from 'pify';
import { throttle } from 'lodash';

// type Sound = 'LOOP';
type Imported = {
  PATH: string;
  SPEED?: number;
};
export type ImportedHash = { [key: string]: Imported; };
export type RcPass = {
  TARGET?: string;
  vs?: string;
  fs?: string;
  FLOAT?: boolean;
};
export type Rc = {
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
  // sound: Sound | null;
  soundLength: number;
}
type RcFragmentWithoutImported = {
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
  // sound?: Sound | null;
  soundLength?: number;
};
type RcFragment = RcFragmentWithoutImported & {
  IMPORTED?: ImportedHash;
  PASSES?: RcPass[];
}
type RcDiffFragment = RcFragmentWithoutImported & {
  IMPORTED: ImportedHash;
  PASSES?: RcPass[];
}

export type RcDiff = {
  newConfig: Rc;
  added: RcDiffFragment;
  removed: RcDiffFragment;
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
  // sound: 'LOOP',
  soundLength: 30,
};

function resolvePath(val: string, projectPath: string): string {
  if (val.match('https?://')) {
    return val;
  }
  return path.resolve(projectPath, val);
}

function parseImported(projectPath: string, importedHash?: ImportedHash): ImportedHash | null {
  if (!importedHash) {
    return null;
  }
  const newImportedHash: ImportedHash = {};

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

export default class Config extends EventEmitter {
  _globalRc: RcFragment = {};
  _projectRc: RcFragment = {};
  _fileRc: RcFragment = {};
  _soundRc: RcFragment = {};
  rc: Rc;
  soundRc: Rc;
  _lastImportedHash = {};

  projectPath: string;
  _isWatching: boolean = false;

  constructor(projectPath: string, rc: RcFragment) {
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
    this._isWatching = true;
    this.load();
  }

  stop(): void {
    this._isWatching = false;
    this.rc = DEFAULT_RC;
    this.soundRc = DEFAULT_RC;
  }

  _readConfigFile = (filename: string) => {
    return p(fs.readFile)(path.resolve(this.projectPath, filename), 'utf8').then(data => ({ filename, data }));
  }

  load = (): Promise<void> | null => {
    if (!this._isWatching) {
      return null;
    }

    // Load .liverc or .vedarc
    return this._readConfigFile('.liverc')
      .then(d => {
        console.log('[VEDA] `.liverc` is deprecated. Use `.vedarc` instead.');
        return d;
      })
      .catch(() => this._readConfigFile('.vedarc'))
      .then(({ filename, data }) => {
        try {
          const rc = JSON5.parse(data);
          rc.IMPORTED = parseImported(this.projectPath, rc.IMPORTED);
          this.setProjectSettings(rc);
        } catch (e) {
          console.log('[VEDA] Failed to parse rc file:', filename);
        }
      })
      .catch(() => {
        console.log('[VEDA] config file not found');
      });
  }

  createRc(): Rc {
    const IMPORTED: ImportedHash = {
      ...this._projectRc.IMPORTED,
      ...this._fileRc.IMPORTED,
    };

    return {
      ...DEFAULT_RC,
      ...this._globalRc,
      ...this._projectRc,
      ...this._fileRc,
      IMPORTED,
    };
  }

  createSoundRc(): Rc {
    const IMPORTED: ImportedHash = {
      ...this._projectRc.IMPORTED,
      ...this._soundRc.IMPORTED,
    };

    return {
      ...DEFAULT_RC,
      ...this._globalRc,
      ...this._projectRc,
      ...this._soundRc,
      IMPORTED,
    };
  }

  setGlobalSettings(rc: RcFragment) {
    // _globalRc must be extended everytime,
    // because setGlobalSettings can be called for properties one by one.
    this._globalRc = { ...this._globalRc, ...rc };
    this.onChange();
  }

  setProjectSettings(rc: RcFragment) {
    this._projectRc = rc;
    this.onChange();
  }

  setFileSettings(rc: RcFragment) {
    this._fileRc = rc;
    this.onChange();
  }

  setSoundSettings(rc: RcFragment) {
    this._soundRc = rc;
    this.onChangeSound();
  }

  _parseComment(filepath: string, comment: string): RcFragment {
    let rc: RcFragment = {};
    try {
      rc = JSON5.parse(comment);
    } catch (e) {}

    const IMPORTED = parseImported(path.dirname(filepath), rc.IMPORTED);
    if (IMPORTED) {
      rc.IMPORTED = IMPORTED;
    }

    return rc;
  }

  setFileSettingsByString(filepath: string, comment: string) {
    this.setFileSettings(this._parseComment(filepath, comment));
  }

  setSoundSettingsByString(filepath: string, comment: string) {
    this.setSoundSettings(this._parseComment(filepath, comment));
  }

  onChange = throttle(() => {
    const newRc = this.createRc();
    this.emit('change', this._getDiff(this.rc, newRc));
    this.rc = newRc;
  }, 100)

  onChangeSound = throttle(() => {
    const newRc = this.createSoundRc();
    this.emit('changeSound', this._getDiff(this.soundRc, newRc));
    this.soundRc = newRc;
  }, 100)

  _getDiff(oldObj: Rc, newObj: Rc) {
    const diff: RcDiff = {
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
      if (oldImport.PATH && (
        newImport.PATH !== oldImport.PATH || newImport.SPEED !== oldImport.SPEED
      )) {
        diff.removed.IMPORTED[key] = oldImport;
      }
      if (newImport.PATH && (
        newImport.PATH !== oldImport.PATH || newImport.SPEED !== oldImport.SPEED
      )) {
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
    if (newObj.fftSmoothingTimeConstant !== oldObj.fftSmoothingTimeConstant) {
      diff.added.fftSmoothingTimeConstant = newObj.fftSmoothingTimeConstant;
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
    // if (newObj.sound !== oldObj.sound) {
    //   diff.added.sound = newObj.sound;
    // }
    if (newObj.soundLength !== oldObj.soundLength) {
      diff.added.soundLength = newObj.soundLength;
    }

    return diff;
  }
}
