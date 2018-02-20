"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = require("events");
var fs = require("fs");
var path = require("path");
var JSON5 = require("json5");
var p = require("pify");
var lodash_1 = require("lodash");
var DEFAULT_RC = {
    glslangValidatorPath: 'glslangValidator',
    IMPORTED: {},
    PASSES: [],
    pixelRatio: 2,
    frameskip: 2,
    vertexMode: 'LINE_STRIP',
    vertexCount: 3000,
    fftSize: 2048,
    fftSmoothingTimeConstant: 0.8,
    audio: false,
    midi: false,
    keyboard: false,
    gamepad: false,
    camera: false,
    glslify: false,
    server: null,
    osc: null,
    soundLength: 30,
};
function resolvePath(val, projectPath) {
    if (val.match('https?://')) {
        return val;
    }
    return path.resolve(projectPath, val);
}
function parseImported(projectPath, importedHash) {
    if (!importedHash) {
        return null;
    }
    var newImportedHash = {};
    Object.keys(importedHash).forEach(function (key) {
        var imported = importedHash[key];
        if (!imported || !imported.PATH) {
            return;
        }
        var importedPath = imported.PATH;
        if (!/^\/$/.test(importedPath)) {
            importedPath = resolvePath(importedPath, projectPath);
        }
        newImportedHash[key] = {
            PATH: importedPath,
            SPEED: imported.SPEED || 1,
        };
    });
    return newImportedHash;
}
var Config = (function (_super) {
    __extends(Config, _super);
    function Config(projectPath, rc) {
        var _this = _super.call(this) || this;
        _this._globalRc = {};
        _this._projectRc = {};
        _this._fileRc = {};
        _this._soundRc = {};
        _this._lastImportedHash = {};
        _this._isWatching = false;
        _this._readConfigFile = function (filename) {
            return p(fs.readFile)(path.resolve(_this.projectPath, filename), 'utf8').then(function (data) { return ({ filename: filename, data: data }); });
        };
        _this.load = function () {
            if (!_this._isWatching) {
                return null;
            }
            return _this._readConfigFile('.liverc')
                .then(function (d) {
                console.log('[VEDA] `.liverc` is deprecated. Use `.vedarc` instead.');
                return d;
            })
                .catch(function () { return _this._readConfigFile('.vedarc'); })
                .then(function (_a) {
                var filename = _a.filename, data = _a.data;
                try {
                    var rc = JSON5.parse(data);
                    rc.IMPORTED = parseImported(_this.projectPath, rc.IMPORTED);
                    _this.setProjectSettings(rc);
                }
                catch (e) {
                    console.log('[VEDA] Failed to parse rc file:', filename);
                }
            })
                .catch(function () {
                console.log('[VEDA] config file not found');
            });
        };
        _this.onChange = lodash_1.throttle(function () {
            var newRc = _this.createRc();
            _this.emit('change', _this._getDiff(_this.rc, newRc));
            _this.rc = newRc;
        }, 100);
        _this.onChangeSound = lodash_1.throttle(function () {
            var newRc = _this.createSoundRc();
            _this.emit('changeSound', _this._getDiff(_this.soundRc, newRc));
            _this.soundRc = newRc;
        }, 100);
        _this.rc = DEFAULT_RC;
        _this.soundRc = DEFAULT_RC;
        _this.setGlobalSettings(rc);
        _this.projectPath = projectPath;
        if (projectPath) {
            fs.watch(projectPath, function (_, filename) {
                if (filename === '.liverc' || filename === '.vedarc') {
                    _this.load();
                }
            });
        }
        return _this;
    }
    Config.prototype.play = function () {
        this._isWatching = true;
        this.load();
    };
    Config.prototype.stop = function () {
        this._isWatching = false;
        this.rc = DEFAULT_RC;
        this.soundRc = DEFAULT_RC;
    };
    Config.prototype.createRc = function () {
        var IMPORTED = __assign({}, this._projectRc.IMPORTED, this._fileRc.IMPORTED);
        return __assign({}, DEFAULT_RC, this._globalRc, this._projectRc, this._fileRc, { IMPORTED: IMPORTED });
    };
    Config.prototype.createSoundRc = function () {
        var IMPORTED = __assign({}, this._projectRc.IMPORTED, this._soundRc.IMPORTED);
        return __assign({}, DEFAULT_RC, this._globalRc, this._projectRc, this._soundRc, { IMPORTED: IMPORTED });
    };
    Config.prototype.setGlobalSettings = function (rc) {
        this._globalRc = __assign({}, this._globalRc, rc);
        this.onChange();
    };
    Config.prototype.setProjectSettings = function (rc) {
        this._projectRc = rc;
        this.onChange();
    };
    Config.prototype.setFileSettings = function (rc) {
        this._fileRc = rc;
        this.onChange();
    };
    Config.prototype.setSoundSettings = function (rc) {
        this._soundRc = rc;
        this.onChangeSound();
    };
    Config.prototype._parseComment = function (filepath, comment) {
        var rc = {};
        try {
            rc = JSON5.parse(comment);
        }
        catch (e) { }
        var IMPORTED = parseImported(path.dirname(filepath), rc.IMPORTED);
        if (IMPORTED) {
            rc.IMPORTED = IMPORTED;
        }
        return rc;
    };
    Config.prototype.setFileSettingsByString = function (filepath, comment) {
        this.setFileSettings(this._parseComment(filepath, comment));
    };
    Config.prototype.setSoundSettingsByString = function (filepath, comment) {
        this.setSoundSettings(this._parseComment(filepath, comment));
    };
    Config.prototype._getDiff = function (oldObj, newObj) {
        var diff = {
            newConfig: newObj,
            added: { IMPORTED: {} },
            removed: { IMPORTED: {} },
        };
        var newIMPORTED = newObj.IMPORTED;
        var oldIMPORTED = oldObj.IMPORTED;
        Object.keys(newIMPORTED).forEach(function (key) {
            var newImport = newIMPORTED[key] || {};
            var oldImport = oldIMPORTED[key] || {};
            if (oldImport.PATH && (newImport.PATH !== oldImport.PATH || newImport.SPEED !== oldImport.SPEED)) {
                diff.removed.IMPORTED[key] = oldImport;
            }
            if (newImport.PATH && (newImport.PATH !== oldImport.PATH || newImport.SPEED !== oldImport.SPEED)) {
                diff.added.IMPORTED[key] = newImport;
            }
        });
        if (newObj.pixelRatio !== oldObj.pixelRatio) {
            diff.added.pixelRatio = newObj.pixelRatio;
        }
        if (newObj.frameskip !== oldObj.frameskip) {
            diff.added.frameskip = newObj.frameskip;
        }
        if (newObj.vertexMode !== oldObj.vertexMode) {
            diff.added.vertexMode = newObj.vertexMode;
        }
        if (newObj.vertexCount !== oldObj.vertexCount) {
            diff.added.vertexCount = newObj.vertexCount;
        }
        if (newObj.glslangValidatorPath !== oldObj.glslangValidatorPath) {
            diff.added.glslangValidatorPath = newObj.glslangValidatorPath;
        }
        if (newObj.fftSize !== oldObj.fftSize) {
            diff.added.fftSize = newObj.fftSize;
        }
        if (newObj.fftSmoothingTimeConstant !== oldObj.fftSmoothingTimeConstant) {
            diff.added.fftSmoothingTimeConstant = newObj.fftSmoothingTimeConstant;
        }
        if (newObj.audio !== oldObj.audio) {
            diff.added.audio = newObj.audio;
        }
        if (newObj.camera !== oldObj.camera) {
            diff.added.camera = newObj.camera;
        }
        if (newObj.gamepad !== oldObj.gamepad) {
            diff.added.gamepad = newObj.gamepad;
        }
        if (newObj.midi !== oldObj.midi) {
            diff.added.midi = newObj.midi;
        }
        if (newObj.keyboard !== oldObj.keyboard) {
            diff.added.keyboard = newObj.keyboard;
        }
        if (newObj.server !== oldObj.server) {
            diff.added.server = newObj.server;
        }
        if (newObj.osc !== oldObj.osc) {
            diff.added.osc = newObj.osc;
        }
        if (newObj.soundLength !== oldObj.soundLength) {
            diff.added.soundLength = newObj.soundLength;
        }
        return diff;
    };
    return Config;
}(events_1.EventEmitter));
exports.default = Config;
//# sourceMappingURL=config.js.map