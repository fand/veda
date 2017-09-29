/* @flow */
import path from 'path';
import glslify from 'glslify';
import GlslLivecoderView from './glsl-livecoder-view';
import { validator, loadFile } from './validator';
import ThreeShader from './three-shader';
import Config from './config';
import type { Pass } from './three-shader';
import type { RcDiff } from './config';
import { DEFAULT_VERTEX_SHADER, DEFAULT_FRAGMENT_SHADER } from './constants';

declare var atom: any;
type TextEditor = any;
type GlslLivecoderState = {
  isPlaying: boolean;
  activeEditorDisposer?: any;
  editorDisposer?: any;
  editor?: TextEditor;
};

export default class GlslLivecoder {
  _view: GlslLivecoderView;
  _three: ThreeShader;
  _state: GlslLivecoderState;
  _glslangValidatorPath: string;
  _lastShader: Pass[];

  _config: Config;

  constructor(config: Config) {
    this._view = new GlslLivecoderView();
    atom.workspace.element.appendChild(this._view.getElement());

    this._config = config;
    this._config.on('change', this.onChange);

    const rc = this._config.rc;
    this._glslangValidatorPath = rc.glslangValidatorPath;

    this._three = new ThreeShader(rc);
    this._three.setCanvas(this._view.getCanvas());

    this._state = {
      isPlaying: false,
    };
  }

  destroy(): void {
    this._three.stop();
    this._view.destroy();
  }

  onChange = ({ newConfig, added, removed }: RcDiff) => {
    console.log('Update config', newConfig);
    // Get paths for videos still in use
    const importedPaths = {};
    Object.values(newConfig.IMPORTED).forEach(imported => {
      importedPaths[(imported: any).PATH] = true;
    });

    Object.keys(removed.IMPORTED).forEach(key => {
      const path = removed.IMPORTED[key].PATH;
      this._three.unloadTexture(key, path, !importedPaths[path]);
    });
    Object.keys(added.IMPORTED || {}).forEach(key => {
      this._three.loadTexture(key, added.IMPORTED[key].PATH);
    });
    if (added.vertexMode) {
      this._three.setVertexMode(added.vertexMode);
    }
    if (added.vertexCount) {
      this._three.setVertexCount(added.vertexCount);
    }
    if (added.pixelRatio) {
      this._three.setPixelRatio(added.pixelRatio);
    }
    if (added.frameskip) {
      this._three.setFrameskip(added.frameskip);
    }
    if (added.glslangValidatorPath) {
      this._glslangValidatorPath = added.glslangValidatorPath;
    }
    if (added.audio !== undefined) {
      this._three.toggleAudio(added.audio);
    }
    if (added.midi !== undefined) {
      this._three.toggleMidi(added.midi);
    }
    if (added.keyboard !== undefined) {
      this._three.toggleKeyboard(added.keyboard);
    }
    if (added.gamepad !== undefined) {
      this._three.toggleGamepad(added.gamepad);
    }
    if (added.camera !== undefined) {
      this._three.toggleCamera(added.camera);
    }

    this.loadLastShader();
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

  setVertexCount(x: number): void {
    this._three.setVertexCount(x);
  }

  setVertexMode(x: string): void {
    this._three.setVertexMode(x);
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
    this._three.loadShader([{
      vs: DEFAULT_VERTEX_SHADER,
      fs: DEFAULT_FRAGMENT_SHADER,
    }]);
    this._three.play();
    this._state.isPlaying = true;
  }

  stop(): void {
    this._view.hide();
    this._three.stop();
    this._state.isPlaying = false;
    this.stopWatching();
    this._config.reset();
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
    this._loadShaderOfEditor(editor);

    if (editor !== undefined) {
      this._state.editorDisposer = editor.onDidStopChanging(() => {
        this._loadShaderOfEditor(editor);
      });
    }
  }

  loadShader(): void {
    const editor = atom.workspace.getActiveTextEditor();
    this._loadShaderOfEditor(editor);
  }

  loadLastShader(): void {
    if (!this._lastShader) {
      return;
    }
    this._three.loadShader(this._lastShader);
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

  _loadShaderOfEditor(editor: TextEditor): void {
    if (editor === undefined) {
      // This case occurs when no files are open/active
      return;
    }
    const filepath = editor.getPath();
    const dirname = path.dirname(filepath);

    const m = (filepath || '').match(/(\.(?:glsl|frag|vert|fs|vs))$/);
    if (!m) {
      console.error('The filename for current doesn\'t seems to be GLSL.');
      return;
    }
    const postfix = m[1];

    let shader = editor.getText();
    let rc;
    Promise.resolve()
      .then(() => {
        const headComment = (shader.match(/(?:\/\*)((?:.|\n|\r|\n\r)*)(?:\*\/)/) || [])[1];
        this._config.setCommentByString(filepath, headComment);
        rc = this._config.createRc();
      })
      .then(() => {
        if (rc.glslify) {
          shader = glslify(shader, { basedir: path.dirname(filepath) });
        }
      })
      .then(() => validator(this._glslangValidatorPath, shader, postfix))
      .then(() => {
        const rcPasses = rc.PASSES;
        if (rcPasses.length === 0) {
          rcPasses.push({});
        }
        return Promise.all(rcPasses.map(async rcPass => {
          const pass: any = { TARGET: rcPass.TARGET };

          if (!rcPass.fs && !rcPass.vs) {
            if (postfix === '.vert' || postfix === '.vs') {
              pass.vs = shader;
            } else {
              pass.fs = shader;
            }
          } else {
            if (rcPass.vs) {
              pass.vs = await loadFile(this._glslangValidatorPath, path.resolve(dirname, rcPass.vs));
            }
            if (rcPass.fs) {
              pass.fs = await loadFile(this._glslangValidatorPath, path.resolve(dirname, rcPass.fs));
            }
          }

          return pass;
        }));
      })
      .then(passes => {
        this._three.loadShader(passes);
        this._lastShader = passes;
      })
      .catch(e => {
        console.error(e);
      });
  }
}
