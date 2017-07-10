'use babel';

import AtomLivecoderView from './atom-livecoder-view';
import { CompositeDisposable } from 'atom';
import validator from './validator';

export default {

  atomLivecoderView: null,
  editor: null,
  subscriptions: null,

  activate(state) {
    require('atom-package-deps').install('atom-livecoder')
      .then(() => this._activate(state));
  },

  _activate(state) {
    this.atomLivecoderView = new AtomLivecoderView(state.atomLivecoderViewState);
    atom.workspace.element.appendChild(this.atomLivecoderView.getElement());

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'atom-livecoder:toggle': () => this.toggle(),
      'atom-livecoder:load-shader': () => this.loadShader(),
      'atom-livecoder:watch-shader': () => this.watchShader(),
      'atom-livecoder:watch-active-shader': () => this.watchActiveShader(),
      'atom-livecoder:stop-watching': () => this.stopWatching(),
    }));

    this.toggle();
  },

  deactivate() {
    this.subscriptions.dispose();
    this.atomLivecoderView.destroy();
  },

  serialize() {
    return {
      atomLivecoderViewState: this.atomLivecoderView.serialize()
    };
  },

  toggle() {
    return (
      this.atomLivecoderView.isVisible ?
      this.atomLivecoderView.hide() :
      this.atomLivecoderView.show()
    );
  },

  watchActiveShader() {
    this.editor = atom.workspace.getActiveTextEditor();
    this.loadShaderOfEditor(this.editor);

    atom.workspace.onDidChangeActiveTextEditor(() => {
      this.editor = atom.workspace.getActiveTextEditor();
      this.editor.onDidStopChanging(() => {
        this.loadShaderOfEditor(this.editor);
      });
    });
  },

  watchShader() {
    this.editor = atom.workspace.getActiveTextEditor();
    this.loadShaderOfEditor(this.editor);

    this.editor.onDidChange(() => {
      this.loadShaderOfEditor(this.editor);
    });
  },

  loadShader() {
    const editor = atom.workspace.getActiveTextEditor();
    this.loadShaderOfEditor(editor);
  },

  stopWatching() {
    this.editor = null;
  },

  /**
   * @private
   */
  loadShaderOfEditor(editor) {
    if (!editor) { return; }
    const shader = editor.getText();

    validator(shader).then(() => {
      this.atomLivecoderView.loadShader(shader);
    })
    .catch(e => {
      console.error(e);
      throw e;
    });
  },

};