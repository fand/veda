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
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var child_process_1 = require("child_process");
var events_1 = require("events");
var OscLoader = (function (_super) {
    __extends(OscLoader, _super);
    function OscLoader(port) {
        var _this = _super.call(this) || this;
        _this._addresses = {};
        _this.stdout = function (output) {
            var s = output.toString().trim();
            s.split('\n').forEach(function (line) {
                var msg;
                try {
                    msg = JSON.parse(line);
                }
                catch (e) { }
                if (msg) {
                    msg.address = 'osc_' + msg.address.replace(/^\//, '').replace('/', '_');
                    _this.emit('message', msg);
                    if (!_this._addresses[msg.address]) {
                        _this._addresses[msg.address] = true;
                        _this.emit('reload');
                    }
                }
                else {
                    console.log(line);
                }
            });
        };
        _this.stderr = function (output) {
            console.error(output.toString());
        };
        _this.exit = function (code) {
            console.log('[VEDA] OSC server exited with code', code);
        };
        _this.port = port;
        _this._server = child_process_1.spawn('node', [path.resolve(__dirname, 'osc-server.js'), _this.port.toString()], {
            cwd: path.resolve(__dirname, '..'),
        });
        _this._server.stdout.on('data', _this.stdout);
        _this._server.stderr.on('data', _this.stderr);
        _this._server.on('exit', _this.exit);
        return _this;
    }
    OscLoader.prototype.destroy = function () {
        try {
            this._server.kill();
        }
        catch (e) {
            console.error(e);
        }
    };
    return OscLoader;
}(events_1.EventEmitter));
exports.default = OscLoader;
//# sourceMappingURL=osc-loader.js.map