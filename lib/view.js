"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class View {
    constructor(wrapper) {
        this.isFullscreen = false;
        this.wrapper = wrapper;
        this.element = document.createElement('div');
        this.element.classList.add('veda');
        this.canvas = document.createElement('canvas');
        this.settings = document.createElement('div');
        this.settings.innerHTML = '<h3>settings</h3>';
        this.element.appendChild(this.canvas);
        this.element.appendChild(this.settings);
        this.wrapper.appendChild(this.element);
    }
    destroy() {
        this.element.remove();
    }
    getCanvas() {
        return this.canvas;
    }
    show() {
        document.body.classList.add('veda-enabled');
    }
    hide() {
        document.body.classList.remove('veda-enabled');
    }
    toggleFullscreen() {
        this.isFullscreen = !this.isFullscreen;
        if (this.isFullscreen) {
            document.body.classList.add('veda-fullscreen');
        }
        else {
            document.body.classList.remove('veda-fullscreen');
        }
    }
}
exports.default = View;
//# sourceMappingURL=view.js.map