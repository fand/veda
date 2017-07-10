'use babel';

import { writeFile } from 'fs';
import { exec } from 'child_process';
import tmp from 'tmp';
import p from 'pify';

export default (glslangValidatorPath, shader) => {
  let tmpfile;
  return p(tmp.file)({ keep: true, postfix: '.frag' })
    .then(path => {
      tmpfile = path;
      return p(writeFile)(tmpfile, shader, 'utf8');
    })
    .then(() => {
      return p(exec)(glslangValidatorPath + ' ' + tmpfile);
    })
    .then(stdout => {
      if (stdout.match(/ERROR/)) {
        throw new Error(stdout);
      }
    });
};
