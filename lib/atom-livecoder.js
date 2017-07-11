'use babel';

import AtomLivecoderView from './atom-livecoder-view';
import validator from './validator';
import ThreeShader from './three-shader';

const fragment = `
precision mediump float;
uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

void main() {
	vec2 uv = gl_FragCoord.xy / resolution.xy;
	gl_FragColor = vec4(uv,0.5+0.5*sin(time),1.0);
}
`;

export default class AtomLivecoder {
  // view: AtomLivecoderView;
  // editor: TextEditor;
  // three: ThreeShader;

  constructor(state) {
    this.view = new AtomLivecoderView(state.view);
    atom.workspace.element.appendChild(this.view.getElement());

    // this.three = new ThreeShader(1, 3);
    this.three = new ThreeShader(2, 2);
    this.three.setCanvas(this.view.getCanvas());

    this.state = {
      isPlaying: false,
    };
  }

  destroy() {
    this.three.stop();
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
    this.three.loadShader(fragment);
    this.three.play();
    this.state.isPlaying = true;
  }

  stop() {
    this.view.hide();
    this.three.stop();
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
        this.three.loadShader(shader);
      })
      .catch(e => {
        console.error(e);
        throw e;
      });
  }
}
