"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const execa = require("execa");
const tmp = require("tmp");
const p = require("pify");
function validator(glslangValidatorPath, shader, postfix) {
    let tmpfile = '';
    return p(tmp.file)({ keep: true, postfix, discardDescriptor: true })
        .then(path => {
        tmpfile = path;
        return p(fs_1.writeFile)(tmpfile, shader, 'utf8');
    })
        .then(() => execa(glslangValidatorPath, [tmpfile]))
        .then(result => {
        if (result.stdout.match(/ERROR/)) {
            throw new Error(result.stdout);
        }
    });
}
exports.validator = validator;
function loadFile(glslangValidatorPath, filePath) {
    return execa(glslangValidatorPath, [filePath])
        .then(result => {
        if (result.stdout.match(/ERROR/)) {
            throw new Error(result.stdout);
        }
    })
        .then(() => p(fs_1.readFile)(filePath, 'utf8'));
}
exports.loadFile = loadFile;
//# sourceMappingURL=validator.js.map