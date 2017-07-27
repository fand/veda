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

export default atom => {
  const paths = atom.project.getPaths();
  let rc = null;

  for (let i = 0; i < paths.length; i++) {
    const p = paths[i];

    try {
      const json = fs.readFileSync(path.resolve(p, '.liverc'), 'utf8');
      rc = JSON5.parse(json); // eslint-disable-line
      rc.projectPath = p;
    } catch (e) {}

    if (rc) {
      break;
    }
  }

  if (!rc) {
    return {};
  }

  try {
    rc.IMPORTED = parseImported(rc.IMPORTED, rc.projectPath);
  } catch (e) {}

  return rc;
};
