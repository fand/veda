'use babel';

import AtomLivecoderView from './atom-livecoder-view';
import validator from './validator';

export default class AtomLivecoder {
  // view: AtomLivecoderView;
  // editor: TextEditor;

  constructor(state) {
    this.view = new AtomLivecoderView(state.view);
    atom.workspace.element.appendChild(this.view.getElement());

    this.state = {
      isPlaying: false,
    };
  }

  destroy() {
    this.view.destroy();
  }

  serialize() {
    return {
      ...this.state,
      view: this.view.serialize(),
    };
  }

  setValidatorPath(path) {
    this.glslangValidatorPath = path;
  }

  toggle() {
    return (
      this.state.isPlaying ?
        this.stop() :
        this.play()
    );
  }

  play() {
    this.view.show();
    this.state.isPlaying = true;
  }

  stop() {
    this.view.hide();
    this.state.isPlaying = false;
  }

  watchActiveShader() {
    this.editor = atom.workspace.getActiveTextEditor();
    this.loadShaderOfEditor(this.editor);

    atom.workspace.onDidChangeActiveTextEditor(() => {
      this.editor = atom.workspace.getActiveTextEditor();
      this.editor.onDidStopChanging(() => {
        this.loadShaderOfEditor(this.editor);
      });
    });
  }

  watchShader() {
    this.editor = atom.workspace.getActiveTextEditor();
    this.loadShaderOfEditor(this.editor);

    this.editor.onDidChange(() => {
      this.loadShaderOfEditor(this.editor);
    });
  }

  loadShader() {
    const editor = atom.workspace.getActiveTextEditor();
    this.loadShaderOfEditor(editor);
  }

  stopWatching() {
    this.editor = null;
  }

  /**
   * @private
   */
  loadShaderOfEditor(editor) {
    if (!editor) {
      return;
    }

    const shader = editor.getText();

    validator(this.glslangValidatorPath, shader)
      .then(() => {
        this.view.loadShader(shader);
      })
      .catch(e => {
        console.error(e);
        throw e;
      });
  }
}
