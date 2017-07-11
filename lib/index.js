'use babel';

import AtomLivecoder from './atom-livecoder';
import { CompositeDisposable } from 'atom';
import fs from 'fs';
import which from 'which';
import { MessagePanelView, PlainMessageView } from 'atom-message-panel';

export default {

  config: {
    glslangValidatorPath: {
      type: 'string',
      default: 'glslangValidator',
      order: 1,
    },
  },

  activate(state) {
    require('atom-package-deps').install('atom-livecoder')
      .then(() => this._activate(state));
  },

  _activate(state) {
    this.app = new AtomLivecoder(state);

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-livecoder:toggle': () => this.app.toggle(),
      'atom-livecoder:load-shader': () => this.app.loadShader(),
      'atom-livecoder:watch-shader': () => this.app.watchShader(),
      'atom-livecoder:watch-active-shader': () => this.app.watchActiveShader(),
      'atom-livecoder:stop-watching': () => this.app.stopWatching(),
    }));

    this.validateGlslangValidatorPath();

    this.app.play();
  },

  deactivate() {
    this.subscriptions.dispose();
    this.app.destroy();
  },

  showError(message) {
    if (!this.messages) {
      this.messages = new MessagePanelView({
        title: 'atom-livecoder',
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

  validateGlslangValidatorPath() {
    atom.config.observe('atom-livecoder.glslangValidatorPath', glslangValidatorPath => {
      const defaultGlslangValidatorPath = module.exports.config.glslangValidatorPath.default;
      const result = this.checkExistence(glslangValidatorPath) || this.checkExistence(defaultGlslangValidatorPath);

      if (result) {
        this.hideError();
        this.app.setValidatorPath(result);
      } else {
        this.showError(`Unable to locate glslangValidator at '${glslangValidatorPath}'`);
      }
    });
  },

};
