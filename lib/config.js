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
}
type RcFragment = {
  glslangValidatorPath?: string;
  IMPORTED?: ImportedHash;
  pixelRatio?: number;
  frameskip?: number;
  vertexMode?: string;
  vertexCount?: number;
}
const DEFAULT_RC = {
  glslangValidatorPath: 'glslangValidator',
  IMPORTED: {},
  pixelRatio: 2,
  frameskip: 2,
  vertexMode: 'LINE_STRIP',
  vertexCount: 3000,
};

function resolvePath(val: string, projectPath: string): string {
  if (val.match('https?://')) {
    return val;
  }
  return path.resolve(projectPath, val);
}
function parseImported(importedHash: ImportedHash, projectPath: string): ?ImportedHash {
  if (!importedHash) {
    return null;
  }
  const newImportedHash: ImportedHash = {};

  Object.keys(importedHash).forEach(key => {
    const imported = importedHash[key];
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
    return {
      ...this.rc,
      ...this._globalRc,
      ...this._projectRc,
      ...this._fileRc,
    };
  }

  setGlobal(rc: RcFragment) {
    this._globalRc = { ...this._globalRc, ...rc };
    this.onChange();
  }

  setProject(rc: RcFragment) {
    this._projectRc = { ...this._projectRc, ...rc };
    this.onChange();
  }

  setComment(rc: RcFragment) {
    this._fileRc = { ...this._fileRc, ...rc };
    this.onChange();
  }

  setCommentByString(comment: String) {
    let rc = {};
    try {
      rc = JSON5.parse(comment);
    } catch (e) {}
    this.setComment(rc);
  }

  onChange = throttle(() => {
    const newRc = this.createRc();
    this.emit('change', this._getDiff(this.rc, newRc));
    this.rc = newRc;
  }, 100)

  _getDiff(oldObj: Rc, newObj: Rc) {
    const diff: any = {
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

    if (newObj.pixelRatio && newObj.pixelRatio !== oldObj.pixelRatio) {
      diff.added.pixelRatio = newObj.pixelRatio;
    }
    if (newObj.frameskip && newObj.frameskip !== oldObj.frameskip) {
      diff.added.frameskip = newObj.frameskip;
    }
    if (newObj.vertexMode && newObj.vertexMode !== oldObj.vertexMode) {
      diff.added.vertexMode = newObj.vertexMode;
    }
    if (newObj.vertexCount && newObj.vertexCount !== oldObj.vertexCount) {
      diff.added.vertexCount = newObj.vertexCount;
    }
    if (newObj.glslangValidatorPath && newObj.glslangValidatorPath !== oldObj.glslangValidatorPath) {
      diff.added.glslangValidatorPath = newObj.glslangValidatorPath;
    }

    return diff;
  }
}
