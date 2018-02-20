"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class View {
    constructor(wrapper) {
        this._wrapper = wrapper;
        this._element = document.createElement('div');
        this._element.classList.add('veda');
        this._canvas = document.createElement('canvas');
        this._element.appendChild(this._canvas);
        this._wrapper.appendChild(this._element);
    }
    destroy() {
        this._element.remove();
    }
    getCanvas() {
        return this._canvas;
    }
    show() {
        document.body.classList.add('veda-enabled');
    }
    hide() {
        document.body.classList.remove('veda-enabled');
    }
}
exports.default = View;
//# sourceMappingURL=view.js.map