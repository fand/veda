import { readFile, writeFile } from 'fs';
import * as execa from 'execa';
import * as tmp from 'tmp';
import * as p from 'pify';

export async function validator(
    glslangValidatorPath: string,
    shader: string,
    postfix: string,
): Promise<void> {
    const tmpfile = await p(tmp.file)({
        keep: true,
        postfix,
        discardDescriptor: true,
    });

    await p(writeFile)(tmpfile, shader, 'utf8');

    const result = await execa(glslangValidatorPath, [tmpfile]);
    if (result.stdout.match(/ERROR/)) {
        throw new Error(result.stdout);
    }
}

export async function loadFile(
    glslangValidatorPath: string,
    filePath: string,
): Promise<string> {
    const result = await execa(glslangValidatorPath, [filePath]);
    if (result.stdout.match(/ERROR/)) {
        throw new Error(result.stdout);
    }

    return await p(readFile)(filePath, 'utf8');
}
