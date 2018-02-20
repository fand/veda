"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var app_1 = require("./app");
var config_1 = require("./config");
var atom_1 = require("atom");
var fs = require("fs");
var which = require("which");
var atom_message_panel_1 = require("atom-message-panel");
var Wrapper = (function () {
    function Wrapper(state) {
        var _this = this;
        this.messages = null;
        console.log(state);
        this.config = new config_1.default(this.getProjectPath(atom), {
            pixelRatio: atom.config.get('veda.pixelRatio'),
            frameskip: atom.config.get('veda.frameskip'),
            vertexMode: atom.config.get('veda.vertexMode'),
            vertexCount: atom.config.get('veda.vertexCount'),
            glslangValidatorPath: atom.config.get('veda.glslangValidatorPath'),
            fftSize: atom.config.get('veda.fftSize'),
            fftSmoothingTimeConstant: atom.config.get('veda.fftSmoothingTimeConstant'),
        });
        this.app = new app_1.default(this.config);
        atom.config.observe('veda.glslangValidatorPath', function (x) { return _this.setGlslangValidatorPath(x); });
        atom.config.observe('veda.pixelRatio', function (x) { return _this.config.setGlobalSettings({ pixelRatio: x }); });
        atom.config.observe('veda.frameskip', function (x) { return _this.config.setGlobalSettings({ frameskip: x }); });
        atom.config.observe('veda.vertexMode', function (x) { return _this.config.setGlobalSettings({ vertexMode: x }); });
        atom.config.observe('veda.vertexCount', function (x) { return _this.config.setGlobalSettings({ vertexCount: x }); });
        atom.config.observe('veda.fftSize', function (x) { return _this.config.setGlobalSettings({ fftSize: x }); });
        atom.config.observe('veda.fftSmoothingTimeConstant', function (x) { return _this.config.setGlobalSettings({ fftSmoothingTimeConstant: x }); });
        this.subscriptions = new atom_1.CompositeDisposable();
        this.subscriptions.add(atom.commands.add('atom-workspace', {
            'veda:toggle': function () { return _this.app.toggle(); },
            'veda:load-shader': function () { return _this.app.loadShader(); },
            'veda:watch-shader': function () { return _this.app.watchShader(); },
            'veda:watch-active-shader': function () { return _this.app.watchActiveShader(); },
            'veda:stop-watching': function () { return _this.app.stopWatching(); },
            'veda:load-sound-shader': function () { return _this.app.playSound(); },
            'veda:stop-sound-shader': function () { return _this.app.stopSound(); },
        }));
        this.app.play();
    }
    Wrapper.prototype.destroy = function () {
        this.subscriptions.dispose();
        this.app.destroy();
    };
    Wrapper.prototype.showError = function (message) {
        if (!this.messages) {
            this.messages = new atom_message_panel_1.MessagePanelView({
                title: 'veda',
            });
            this.messages.attach();
            this.messages.toggle();
        }
        this.messages.clear();
        this.messages.add(new atom_message_panel_1.PlainMessageView({
            message: message,
            className: 'text-error',
        }));
    };
    Wrapper.prototype.hideError = function () {
        if (this.messages) {
            this.messages.close();
            this.messages = null;
        }
    };
    Wrapper.prototype.checkExistence = function (path) {
        var result = null;
        if (fs.existsSync(path) && fs.statSync(path).isFile()) {
            try {
                fs.accessSync(path, fs.X_OK);
                result = path;
            }
            catch (error) {
                console.log(error);
            }
        }
        else {
            try {
                result = which.sync(path);
            }
            catch (error) {
                console.log(error);
            }
        }
        return result;
    };
    Wrapper.prototype.setGlslangValidatorPath = function (glslangValidatorPath) {
        var result = this.checkExistence(glslangValidatorPath);
        if (result) {
            this.hideError();
            this.config.setGlobalSettings({ glslangValidatorPath: result });
        }
        else {
            this.showError("Unable to locate glslangValidator at '" + glslangValidatorPath + "'");
        }
    };
    Wrapper.prototype.getProjectPath = function (atom) {
        var projectPaths = atom.project.getPaths();
        if (projectPaths.length === 0) {
            atom.notifications.addError('[VEDA] No projects found in this window');
            throw new Error('[VEDA] No projects found in this window');
        }
        if (projectPaths.length > 1) {
            atom.notifications.addWarning('[VEDA] There are more than 1 project in this window. <br>veda only recognizes the 1st project.');
        }
        return projectPaths[0];
    };
    return Wrapper;
}());
exports.default = Wrapper;
//# sourceMappingURL=wrapper.js.map