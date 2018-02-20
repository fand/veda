import { readFile, writeFile } from 'fs';
import * as execa from 'execa';
import * as tmp from 'tmp';
import * as p from 'pify';

export function validator(glslangValidatorPath: string, shader: string, postfix: string): Promise<void> {
  let tmpfile: string = '';
  return p(tmp.file)({ keep: true, postfix, discardDescriptor: true })
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

export function loadFile(glslangValidatorPath: string, filePath: string) {
  return execa(glslangValidatorPath, [filePath])
    .then(result => {
      if (result.stdout.match(/ERROR/)) {
        throw new Error(result.stdout);
      }
    })
    .then(() => p(readFile)(filePath, 'utf8'));
}
