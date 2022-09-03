"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertPathForServer = void 0;
const path_1 = __importDefault(require("path"));
const isRelative = require("is-relative");
function convertPathForServer(projectPath, port, target) {
    if (target.match(/^(?:https?:)?\/\//)) {
        return target;
    }
    if (isRelative(target)) {
        target = path_1.default.join(projectPath, target);
    }
    let relativePath = path_1.default.relative(projectPath, target);
    if (path_1.default.sep === '\\') {
        relativePath = relativePath.replace(/\\/g, '/');
    }
    return `http://localhost:${port}/link/${relativePath}`;
}
exports.convertPathForServer = convertPathForServer;
//# sourceMappingURL=utils.js.map