'use babel';
import fs from 'fs';
import path from 'path';

export default atom => {
  const paths = atom.project.getPaths();
  let rc = null;

  for (let i = 0; i < paths.length; i++) {
    const p = paths[i];

    try {
      const json = fs.readFileSync(path.resolve(p, '.liverc'));
      rc = JSON.parse(json);
      rc.projectPath = p;
    } catch (e) {}

    if (rc) {
      break;
    }
  }

  Object.keys(rc).forEach(key => {
    const val = rc[key];
    if (val.match('https?://')) {
      // TBD
    } else {
      rc[key] = path.resolve(rc.projectPath, val);
    }
  });

  return rc || {};
};
