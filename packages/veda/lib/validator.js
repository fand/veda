"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadFile = exports.validator = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const execa_1 = __importDefault(require("execa"));
const tmp_1 = __importDefault(require("tmp"));
const pify_1 = __importDefault(require("pify"));
const glslify = __importStar(require("glslify-lite"));
function validator(glslangValidatorPath, shader, postfix) {
    return __awaiter(this, void 0, void 0, function* () {
        const tmpfile = yield (0, pify_1.default)(tmp_1.default.file)({
            keep: true,
            postfix,
            discardDescriptor: true,
        });
        yield (0, pify_1.default)(fs_1.writeFile)(tmpfile, shader, 'utf8');
        const result = yield (0, execa_1.default)(glslangValidatorPath, [tmpfile]);
        if (result.stdout.match(/ERROR/)) {
            throw new Error(result.stdout);
        }
    });
}
exports.validator = validator;
function loadFile(glslangValidatorPath, filePath, useGlslify = false) {
    return __awaiter(this, void 0, void 0, function* () {
        if (useGlslify) {
            return yield glslify.file(filePath, {
                basedir: path_1.default.dirname(filePath),
            });
        }
        const result = yield (0, execa_1.default)(glslangValidatorPath, [filePath]);
        if (result.stdout.match(/ERROR/)) {
            throw new Error(result.stdout);
        }
        return yield (0, pify_1.default)(fs_1.readFile)(filePath, 'utf8');
    });
}
exports.loadFile = loadFile;
//# sourceMappingURL=validator.js.map