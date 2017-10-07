'use babel';

import GlslLivecoder from './glsl-livecoder';
import Config from './config';
import { CompositeDisposable } from 'atom';
import fs from 'fs';
import which from 'which';
import { MessagePanelView, PlainMessageView } from 'atom-message-panel';

export default {

  config: {
    glslangValidatorPath: {
      title: 'glslangValidator path',
      description: 'glsl-livecoder uses glslangValidator. Install it from https://github.com/KhronosGroup/glslang or homebrew.',
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
  },

  activate(state) {
    require('atom-package-deps').install('glsl-livecoder')
      .then(() => this._activate(state));
  },

  _activate(state) {
    // TODO: Recover state
    console.log(state);

    this.config = new Config(this.getProjectPath(atom), {
      pixelRatio: atom.config.get('glsl-livecoder.pixelRatio'),
      frameskip: atom.config.get('glsl-livecoder.frameskip'),
      vertexMode: atom.config.get('glsl-livecoder.vertexMode'),
      vertexCount: atom.config.get('glsl-livecoder.vertexCount'),
      glslangValidatorPath: atom.config.get('glsl-livecoder.glslangValidatorPath'),
    });

    this.app = new GlslLivecoder(this.config);

    atom.config.observe('glsl-livecoder.glslangValidatorPath', x => this.setGlslangValidatorPath(x));
    atom.config.observe('glsl-livecoder.pixelRatio', x => this.config.setGlobal({ pixelRatio: x }));
    atom.config.observe('glsl-livecoder.frameskip', x => this.config.setGlobal({ frameskip: x }));
    atom.config.observe('glsl-livecoder.vertexMode', x => this.config.setGlobal({ vertexMode: x }));
    atom.config.observe('glsl-livecoder.vertexCount', x => this.config.setGlobal({ vertexCount: x }));

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'glsl-livecoder:toggle': () => this.app.toggle(),
      'glsl-livecoder:load-shader': () => this.app.loadShader(),
      'glsl-livecoder:watch-shader': () => this.app.watchShader(),
      'glsl-livecoder:watch-active-shader': () => this.app.watchActiveShader(),
      'glsl-livecoder:stop-watching': () => this.app.stopWatching(),
    }));

    this.app.play();
  },

  deactivate() {
    this.subscriptions.dispose();
    this.app.destroy();
  },

  showError(message) {
    if (!this.messages) {
      this.messages = new MessagePanelView({
        title: 'glsl-livecoder',
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

  hideError() {
    if (this.messages) {
      this.messages.close();
      this.messages = undefined;
    }
  },

  checkExistence(path) {
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

  setGlslangValidatorPath(glslangValidatorPath) {
    const result = this.checkExistence(glslangValidatorPath);

    if (result) {
      this.hideError();
      this.config.setGlobal({ glslangValidatorPath: result });
    } else {
      this.showError(`Unable to locate glslangValidator at '${glslangValidatorPath}'`);
    }
  },

  getProjectPath(atom) {
    const projectPaths = atom.project.getPaths();
    if (projectPaths.length === 0) {
      atom.notifications.addError('[glsl-livecoder] No projects found in this window');
      return;
    }
    if (projectPaths.length > 1) {
      atom.notifications.addWarning('[glsl-livecoder] There are more than 1 project in this window. <br>glsl-livecoder only recognizes the 1st project.');
    }
    return projectPaths[0];
  },
};
