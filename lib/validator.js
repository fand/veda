/* @flow */
import { writeFile } from 'fs';
import execa from 'execa';
import tmp from 'tmp';
import p from 'pify';

export default function (glslangValidatorPath: string, shader: string): Promise<void> {
  let tmpfile;
  return p(tmp.file)({ keep: true, postfix: '.frag', discardDescriptor: true })
    .then(path => {
      tmpfile = path;
      return p(writeFile)(tmpfile, shader, 'utf8');
    })
    .then(() => execa(glslangValidatorPath, [tmpfile]))
    .then(result => {
      if (result.stdout.match(/ERROR/)) {
        throw new Error(result.stdout);
      }
    });
}
