"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var execa = require("execa");
var tmp = require("tmp");
var p = require("pify");
function validator(glslangValidatorPath, shader, postfix) {
    var tmpfile = '';
    return p(tmp.file)({ keep: true, postfix: postfix, discardDescriptor: true })
        .then(function (path) {
        tmpfile = path;
        return p(fs_1.writeFile)(tmpfile, shader, 'utf8');
    })
        .then(function () { return execa(glslangValidatorPath, [tmpfile]); })
        .then(function (result) {
        if (result.stdout.match(/ERROR/)) {
            throw new Error(result.stdout);
        }
    });
}
exports.validator = validator;
function loadFile(glslangValidatorPath, filePath) {
    return execa(glslangValidatorPath, [filePath])
        .then(function (result) {
        if (result.stdout.match(/ERROR/)) {
            throw new Error(result.stdout);
        }
    })
        .then(function () { return p(fs_1.readFile)(filePath, 'utf8'); });
}
exports.loadFile = loadFile;
//# sourceMappingURL=validator.js.map