'use babel';
import fs from 'fs';
import path from 'path';
import JSON5 from 'json5';

function resolvePath(val, projectPath) {
  if (val.match('https?://')) {
    return val;
  }
  return path.resolve(projectPath, val);
}

function parseImported(importedHash, projectPath) {
  if (!importedHash) {
    return null;
  }
  const newImportedHash = {};

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

export default class RcLoader {
  constructor(atom) {
    const projectPaths = atom.project.getPaths();
    if (projectPaths.length === 0) {
      console.error('There are no projects in this window.');
      return;
    }
    if (projectPaths.length > 1) {
      console.log('There are more than 1 project in this window. \nglsl-livecoder only recognizes the 1st project.');
    }
    this.projectPath = projectPaths[0];
  }

  load() {
    let rc = null;
    try {
      const json = fs.readFileSync(path.resolve(this.projectPath, '.liverc'), 'utf8');
      rc = JSON5.parse(json); // eslint-disable-line
      rc.projectPath = this.projectPath;
    } catch (e) {}

    if (!rc) {
      return {};
    }

    try {
      rc.IMPORTED = parseImported(rc.IMPORTED, rc.projectPath);
    } catch (e) {}

    return rc;
  }
}
