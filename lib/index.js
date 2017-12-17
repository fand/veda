/* @flow */

import App from './app';
import Config from './config';
import { CompositeDisposable } from 'atom';
import fs from 'fs';
import which from 'which';
import { MessagePanelView, PlainMessageView } from 'atom-message-panel';
import type { VedaStatus } from './constants';

export default {

  config: {
    glslangValidatorPath: {
      title: 'glslangValidator path',
      description: 'VEDA uses glslangValidator. Install it from https://github.com/KhronosGroup/glslang or homebrew.',
      type: 'string',
      default: 'glslangValidator',
      order: 1,
    },
    pixelRatio: {
      title: 'Pixel Ratio',
      description: 'The ratio of pixel per rendering call. Increasing pixel ratio will reduce CPU/GPU load.',
      type: 'number',
      default: 2,
      minimum: 0.5,
      maximum: 8,
      order: 2,
    },
    frameskip: {
      title: 'Frameskip',
      description: 'Increasing frameskip will reduce CPU/GPU load. Default is 2 (= 30 fps).',
      type: 'integer',
      default: 2,
      minimum: 1,
      maximum: 10,
      order: 3,
    },
    vertexCount: {
      title: 'Vertex Count',
      description: 'The number of vertices in vertex shaders.',
      type: 'integer',
      default: 3000,
      minimum: 10,
      maximum: 20000,
      order: 4,
    },
    vertexMode: {
      title: 'Vertex Mode',
      description: 'How to draw vertices.',
      type: 'string',
      default: 'LINE_STRIP',
      enum: [
        { value: 'POINTS', description: 'POINTS' },
        { value: 'LINE_STRIP', description: 'LINE_STRIP' },
        { value: 'LINE_LOOP', description: 'LINE_LOOP' },
        { value: 'LINES', description: 'LINES' },
        { value: 'TRI_STRIP', description: 'TRI_STRIP' },
        { value: 'TRI_FAN', description: 'TRI_FAN' },
        { value: 'TRIANGLES', description: 'TRIANGLES' },
      ],
      order: 5,
    },
    fftSize: {
      title: 'FFT size',
      description: 'Represents the size of the FFT to be used to determine the frequency domain.',
      type: 'integer',
      default: 2048,
      enum: [32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768],
      order: 6,
    },
    fftSmoothingTimeConstant: {
      title: 'FFT smoothingTimeConstant',
      description: 'Represents the averaging constant with the last analysis frame.',
      type: 'number',
      default: 0.8,
      minimum: 0,
      maximum: 1,
      order: 7,
    },
  },

  activate(state: VedaStatus) {
    require('atom-package-deps').install('veda')
      .then(() => this._activate(state));
  },

  _activate(state: VedaStatus) {
    // TODO: Recover state
    console.log(state);

    this.config = new Config(this.getProjectPath(atom), {
      pixelRatio: atom.config.get('veda.pixelRatio'),
      frameskip: atom.config.get('veda.frameskip'),
      vertexMode: atom.config.get('veda.vertexMode'),
      vertexCount: atom.config.get('veda.vertexCount'),
      glslangValidatorPath: atom.config.get('veda.glslangValidatorPath'),
      fftSize: atom.config.get('veda.fftSize'),
      fftSmoothingTimeConstant: atom.config.get('veda.fftSmoothingTimeConstant'),
    });

    this.app = new App(this.config);

    atom.config.observe('veda.glslangValidatorPath', x => this.setGlslangValidatorPath(x));
    atom.config.observe('veda.pixelRatio', x => this.config.setGlobal({ pixelRatio: x }));
    atom.config.observe('veda.frameskip', x => this.config.setGlobal({ frameskip: x }));
    atom.config.observe('veda.vertexMode', x => this.config.setGlobal({ vertexMode: x }));
    atom.config.observe('veda.vertexCount', x => this.config.setGlobal({ vertexCount: x }));
    atom.config.observe('veda.fftSize', x => this.config.setGlobal({ fftSize: x }));
    atom.config.observe('veda.fftSmoothingTimeConstant', x => this.config.setGlobal({ fftSmoothingTimeConstant: x }));

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'veda:toggle': () => this.app.toggle(),
      'veda:load-shader': () => this.app.loadShader(),
      'veda:watch-shader': () => this.app.watchShader(),
      'veda:watch-active-shader': () => this.app.watchActiveShader(),
      'veda:stop-watching': () => this.app.stopWatching(),
      'veda:load-sound-shader': () => this.app.playSound(),
      'veda:stop-sound-shader': () => this.app.stopSound(),
    }));

    this.app.play();
  },

  deactivate() {
    this.subscriptions.dispose();
    this.app.destroy();
  },

  showError(message: string): void {
    if (!this.messages) {
      this.messages = new MessagePanelView({
        title: 'veda',
      });
      this.messages.attach();
      this.messages.toggle();
    }
    this.messages.clear();
    this.messages.add(new PlainMessageView({
      message: message,
      className: 'text-error',
    }));
  },

  hideError(): void {
    if (this.messages) {
      this.messages.close();
      this.messages = undefined;
    }
  },

  checkExistence(path: string): ?string {
    let result;

    // copied from https://github.com/AtomLinter/linter-glsl/blob/master/lib/linter-glsl.js
    if (fs.existsSync(path) && fs.statSync(path).isFile()) {
      try {
        fs.accessSync(path, fs.X_OK);
        result = path;
      } catch (error) {
        console.log(error);
      }
    } else {
      try {
        result = which.sync(path);
      } catch (error) {
        console.log(error);
      }
    }

    return result;
  },

  setGlslangValidatorPath(glslangValidatorPath: string) {
    const result = this.checkExistence(glslangValidatorPath);

    if (result) {
      this.hideError();
      this.config.setGlobal({ glslangValidatorPath: result });
    } else {
      this.showError(`Unable to locate glslangValidator at '${glslangValidatorPath}'`);
    }
  },

  getProjectPath(atom: Atom): ?string {
    const projectPaths = atom.project.getPaths();
    if (projectPaths.length === 0) {
      atom.notifications.addError('[VEDA] No projects found in this window');
      return;
    }
    if (projectPaths.length > 1) {
      atom.notifications.addWarning('[VEDA] There are more than 1 project in this window. <br>veda only recognizes the 1st project.');
    }
    return projectPaths[0];
  },
};
