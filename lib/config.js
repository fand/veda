/* @flow */
import EventEmitter from 'events';
import fs from 'fs';
import path from 'path';
import JSON5 from 'json5';
import chokidar from 'chokidar';
import p from 'pify';
import { throttle } from 'lodash';

type Imported = { PATH: string; };
type ImportedHash = { [key: string]: Imported; };
type Rc = {
  glslangValidatorPath: string;
  IMPORTED: ImportedHash;
  pixelRatio: number;
  frameskip: number;
  vertexMode: string;
  vertexCount: number;
  audio: boolean;
  midi: boolean;
  keyboard: boolean;
  gamepad: boolean;
  camera: boolean;
  glslify: boolean;
}
type RcFragment = {
  glslangValidatorPath?: string;
  IMPORTED?: ImportedHash;
  pixelRatio?: number;
  frameskip?: number;
  vertexMode?: string;
  vertexCount?: number;
  audio?: boolean;
  midi?: boolean;
  keyboard?: boolean;
  gamepad?: boolean;
  camera?: boolean;
  glslify?: boolean;
}
const DEFAULT_RC = {
  glslangValidatorPath: 'glslangValidator',
  IMPORTED: {},
  pixelRatio: 2,
  frameskip: 2,
  vertexMode: 'LINE_STRIP',
  vertexCount: 3000,
  audio: false,
  midi: false,
  keyboard: false,
  gamepad: false,
  camera: false,
  glslify: false,
};

function resolvePath(val: string, projectPath: string): string {
  if (val.match('https?://')) {
    return val;
  }
  return path.resolve(projectPath, val);
}

function parseImported(importedHash: ?ImportedHash, projectPath: string): ?ImportedHash {
  if (!importedHash) {
    return null;
  }
  const newImportedHash: ImportedHash = {};

  Object.keys(importedHash).forEach(key => {
    const imported = (importedHash: any)[key];
    if (!imported || !imported.PATH) {
      return;
    }
    let importedPath = imported.PATH;

    if (!/^\/$/.test(importedPath)) {
      importedPath = resolvePath(importedPath, projectPath);
    }

    newImportedHash[key] = {
      PATH: importedPath,
    };
  });

  return newImportedHash;
}

export default class Config extends EventEmitter {
  _globalRc: RcFragment = {};
  _projectRc: RcFragment = {};
  _fileRc: RcFragment = {};
  rc: Rc;
  _lastImportedHash = {};

  projectPath: string;
  watcher: chokidar.FSWatcher;

  constructor(projectPath: any, rc: RcFragment) {
    super();

    this.rc = DEFAULT_RC;
    this.setGlobal(rc);

    this.projectPath = projectPath;
    this.watcher = chokidar.watch(path.resolve(this.projectPath, '.liverc'), {
      disableGlobbing: true,
    });
    this.watcher.on('add', () => this.load());
    this.watcher.on('change', () => this.load());
  }

  reset(): void {
    this.rc = DEFAULT_RC;
  }

  load(): Promise<Rc> {
    const filepath = path.resolve(this.projectPath, '.liverc');
    let rc = null;

    return p(fs.readFile)(filepath, 'utf8')
      .then(json => {
        rc = JSON5.parse(json);
        rc.IMPORTED = parseImported(rc.IMPORTED, this.projectPath);
        this.setProject(rc);
      })
      .catch(() => {
        console.log('Failed to parse rc file:', filepath);
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

  setGlobal(rc: RcFragment) {
    // setGlobal can be called for properties one by one,
    // so we _globalRc must be extended.
    this._globalRc = { ...this._globalRc, ...rc };
    this.onChange();
  }

  setProject(rc: RcFragment) {
    this._projectRc = rc;
    this.onChange();
  }

  setComment(rc: RcFragment) {
    this._fileRc = rc;
    this.onChange();
  }

  setCommentByString(filepath: string, comment: string) {
    let rc = {};
    try {
      rc = JSON5.parse(comment);
    } catch (e) {}

    const IMPORTED = parseImported(rc.IMPORTED, path.dirname(filepath));
    if (IMPORTED) {
      rc.IMPORTED = IMPORTED;
    }

    this.setComment(rc);
  }

  onChange = throttle(() => {
    const newRc = this.createRc();
    this.emit('change', this._getDiff(this.rc, newRc));
    this.rc = newRc;
  }, 100)

  _getDiff(oldObj: Rc, newObj: Rc) {
    const diff: any = {
      newConfig: newObj,
      added: { IMPORTED: {} },
      removed: { IMPORTED: {} },
    };
    const newIMPORTED = newObj.IMPORTED || {};
    const oldIMPORTED = oldObj.IMPORTED || {};

    Object.keys(newIMPORTED).forEach(key => {
      const newImport = newIMPORTED[key] || {};
      const oldImport = oldIMPORTED[key] || {};
      if (oldImport.PATH && newImport.PATH !== oldImport.PATH) {
        diff.removed.IMPORTED[key] = oldImport;
      }
      if (newImport.PATH && newImport.PATH !== oldImport.PATH) {
        diff.added.IMPORTED[key] = newImport;
      }
    });

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

    return diff;
  }
}
