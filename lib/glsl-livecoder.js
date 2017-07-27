'use babel';

import GlslLivecoderView from './glsl-livecoder-view';
import validator from './validator';
import ThreeShader from './three-shader';
import RcLoader from './rc-loader';

const DEFAULT_SHADER = `
precision mediump float;
uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

void main() {
	vec2 uv = gl_FragCoord.xy / resolution.xy;
	gl_FragColor = vec4(uv,0.5+0.5*sin(time),1.0);
}
`;

export default class GlslLivecoder {
  // view: GlslLivecoderView;
  // editor: TextEditor;
  // three: ThreeShader;

  constructor({ pixelRatio, frameskip }) {
    this.view = new GlslLivecoderView();
    atom.workspace.element.appendChild(this.view.getElement());

    this.three = new ThreeShader(pixelRatio, frameskip);
    this.three.setCanvas(this.view.getCanvas());

    this.rcLoader = new RcLoader(atom);
    this.rcLoader.watch(rc => {
      if (rc.IMPORTED) {
        Object.keys(rc.IMPORTED).forEach(key => {
          const imported = rc.IMPORTED[key];
          this.three.loadTexture(key, imported.PATH);
        });
      }
    });

    this.state = {
      isPlaying: false,
    };
  }

  destroy() {
    this.three.stop();
    this.view.destroy();
  }

  setValidatorPath(path) {
    this.glslangValidatorPath = path;
  }

  setPixelRatio(x) {
    this.three.setPixelRatio(x);
  }

  setFrameskip(x) {
    this.three.setFrameskip(x);
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
    this.three.loadShader(DEFAULT_SHADER);
    this.three.play();
    this.state.isPlaying = true;
  }

  stop() {
    this.view.hide();
    this.three.stop();
    this.state.isPlaying = false;
    this.stopWatching();
  }

  watchActiveShader() {
    if (this.state.activeEditorDisposer) {
      return;
    }

    this.watchShader();
    this.state.activeEditorDisposer = atom.workspace.onDidChangeActiveTextEditor(() => {
      this.watchShader();
    });
  }

  watchShader() {
    if (this.state.editorDisposer) {
      this.state.editorDisposer.dispose();
      this.state.editorDisposer = null;
    }

    this.editor = atom.workspace.getActiveTextEditor();
    this.loadShaderOfEditor(this.editor);

    this.state.editorDisposer = this.editor.onDidStopChanging(() => {
      this.loadShaderOfEditor(this.editor);
    });
  }

  loadShader() {
    const editor = atom.workspace.getActiveTextEditor();
    this.loadShaderOfEditor(editor);
  }

  stopWatching() {
    this.editor = null;
    if (this.state.activeEditorDisposer) {
      this.state.activeEditorDisposer.dispose();
      this.state.activeEditorDisposer = null;
    }
    if (this.state.editorDisposer) {
      this.state.editorDisposer.dispose();
      this.state.editorDisposer = null;
    }
  }

  /**
   * @private
   */
  loadShaderOfEditor(editor) {
    if (!editor) {
      return;
    }

    const path = editor.getPath();
    if (!path || !/\.(glsl|frag|vert)$/.test(path)) {
      console.error('The filename for current doesn\'t seems to be GLSL.');
      return;
    }

    const shader = editor.getText();
    validator(this.glslangValidatorPath, shader)
      .then(() => {
        this.three.loadShader(shader);
      })
      .catch(e => {
        console.error(e);
      });
  }
}
