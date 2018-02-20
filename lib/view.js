"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var View = (function () {
    function View(wrapper) {
        this._wrapper = wrapper;
        this._element = document.createElement('div');
        this._element.classList.add('veda');
        this._canvas = document.createElement('canvas');
        this._element.appendChild(this._canvas);
        this._wrapper.appendChild(this._element);
    }
    View.prototype.destroy = function () {
        this._element.remove();
    };
    View.prototype.getCanvas = function () {
        return this._canvas;
    };
    View.prototype.show = function () {
        document.body.classList.add('veda-enabled');
    };
    View.prototype.hide = function () {
        document.body.classList.remove('veda-enabled');
    };
    return View;
}());
exports.default = View;
//# sourceMappingURL=view.js.map