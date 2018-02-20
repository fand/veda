"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.INITIAL_FRAGMENT_SHADER = "\nprecision mediump float;\nuniform float time;\nuniform vec2 mouse;\nuniform vec2 resolution;\n\nvoid main() {\n  vec2 uv = gl_FragCoord.xy / resolution.xy;\n  gl_FragColor = vec4(uv,0.5+0.5*sin(time),1.0);\n}\n";
exports.INITIAL_SOUND_SHADER = "\nprecision mediump float;\nvec2 mainSound(in float time) {\n  return vec2(sin(time* 440.), sin(time * 660.));\n}\n";
exports.INITIAL_SHADER = [{
        fs: exports.INITIAL_FRAGMENT_SHADER,
    }];
//# sourceMappingURL=constants.js.map