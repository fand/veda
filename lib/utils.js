"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const isRelative = require('is-relative');
function convertPathForServer(projectPath, port, target) {
    if (target.match(/^(?:https?:)?\/\//)) {
        return target;
    }
    if (isRelative(target)) {
        target = path.join(projectPath, target);
    }
    const relativePath = path.relative(projectPath, target);
    return `http://localhost:${port}/link/${relativePath}`;
}
exports.convertPathForServer = convertPathForServer;
//# sourceMappingURL=utils.js.map