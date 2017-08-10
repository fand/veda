/* @flow */
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

declare var atom: any;
type TextEditor = any;
type GlslLivecoderOpts = {
  pixelRatio: number;
  frameskip: number;
};
type GlslLivecoderState = {
  isPlaying: boolean;
  activeEditorDisposer?: any;
  editorDisposer?: any;
  editor?: TextEditor;
};

export default class GlslLivecoder {
  _view: GlslLivecoderView;
  _three: ThreeShader;
  _rcLoader: RcLoader;
  _state: GlslLivecoderState;
  _glslangValidatorPath: string;

  constructor({ pixelRatio, frameskip }: GlslLivecoderOpts) {
    this._view = new GlslLivecoderView();
    atom.workspace.element.appendChild(this._view.getElement());

    this._three = new ThreeShader(pixelRatio, frameskip);
    this._three.setCanvas(this._view.getCanvas());

    let lastImportedHash = {};
    this._rcLoader = new RcLoader(atom);
    this._rcLoader.watch(rc => {
      if (rc.IMPORTED) {
        Object.keys(lastImportedHash).forEach(key => {
          const imported = rc.IMPORTED[key];
          const lastImported = lastImportedHash[key];
          if (!imported || imported.PATH !== lastImported.PATH) {
            this._three.unloadTexture(key, lastImported.PATH);
          }
        });
        Object.keys(rc.IMPORTED).forEach(key => {
          const imported = rc.IMPORTED[key];
          this._three.loadTexture(key, imported.PATH);
        });
        lastImportedHash = rc.IMPORTED;
      }
    });

    this._state = {
      isPlaying: false,
    };
  }

  destroy(): void {
    this._three.stop();
    this._view.destroy();
  }

  setValidatorPath(path: string): void {
    this._glslangValidatorPath = path;
  }

  setPixelRatio(x: number): void {
    this._three.setPixelRatio(x);
  }

  setFrameskip(x: number): void {
    this._three.setFrameskip(x);
  }

  toggle(): void {
    return (
      this._state.isPlaying ?
        this.stop() :
        this.play()
    );
  }

  play(): void {
    this._view.show();
    this._three.loadShader(DEFAULT_SHADER);
    this._three.play();
    this._state.isPlaying = true;
  }

  stop(): void {
    this._view.hide();
    this._three.stop();
    this._state.isPlaying = false;
    this.stopWatching();
  }

  watchActiveShader(): void {
    if (this._state.activeEditorDisposer) {
      return;
    }

    this.watchShader();
    this._state.activeEditorDisposer = atom.workspace.onDidChangeActiveTextEditor(() => {
      this.watchShader();
    });
  }

  watchShader(): void {
    if (this._state.editorDisposer) {
      this._state.editorDisposer.dispose();
      this._state.editorDisposer = null;
    }

    const editor = atom.workspace.getActiveTextEditor();
    this._state.editor = editor;
    this.loadShaderOfEditor(editor);

    this._state.editorDisposer = editor.onDidStopChanging(() => {
      this.loadShaderOfEditor(editor);
    });
  }

  loadShader(): void {
    const editor = atom.workspace.getActiveTextEditor();
    this.loadShaderOfEditor(editor);
  }

  stopWatching(): void {
    this._state.editor = null;
    if (this._state.activeEditorDisposer) {
      this._state.activeEditorDisposer.dispose();
      this._state.activeEditorDisposer = null;
    }
    if (this._state.editorDisposer) {
      this._state.editorDisposer.dispose();
      this._state.editorDisposer = null;
    }
  }

  /**
  * @private
  */
  loadShaderOfEditor(editor: TextEditor): void {
    const path = editor.getPath();
    if (!path || !/\.(glsl|frag|vert)$/.test(path)) {
      console.error('The filename for current doesn\'t seems to be GLSL.');
      return;
    }

    const shader = editor.getText();
    validator(this._glslangValidatorPath, shader)
      .then(() => {
        this._three.loadShader(shader);
      })
      .catch(e => {
        console.error(e);
      });
  }
}
