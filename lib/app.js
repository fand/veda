/* @flow */
import path from 'path';
import glslify from 'glslify';
import View from './view';
import { validator, loadFile } from './validator';
import type { Shader, SoundShader } from './constants';
import type Config, { RcDiff } from './config';
import type { Playable } from './playable';
import Player from './player';
import PlayerServer from './player-server';
import { INITIAL_SHADER, INITIAL_SOUND_SHADER } from './constants';
import OscLoader from './osc-loader';

declare var atom: any;
type TextEditor = any;
type GlslLivecoderState = {
  isPlaying: boolean;
  activeEditorDisposer?: any;
  editorDisposer?: any;
  editor?: TextEditor;
};

export default class GlslLivecoder {
  _player: Playable;
  _state: GlslLivecoderState;
  _glslangValidatorPath: string;
  _lastShader: Shader = INITIAL_SHADER;
  _lastSoundShader: SoundShader = INITIAL_SOUND_SHADER;
  _osc: ?OscLoader;

  _config: Config;

  constructor(config: Config) {
    const rc = config.rc;
    const view = new View(atom.workspace.element);
    this._player = new Player(view, rc, false, this._lastShader);

    this._config = config;
    this._config.on('change', this._onChange);
    this._config.on('changeSound', this._onChangeSound);

    this._glslangValidatorPath = rc.glslangValidatorPath;

    this._state = {
      isPlaying: false,
    };
  }

  destroy(): void {
    this._player.destroy();
    if (this._osc) {
      this._osc.destroy();
    }
  }

  _onAnyChanges = ({ added }: RcDiff) => {
    if (added.glslangValidatorPath) {
      this._glslangValidatorPath = added.glslangValidatorPath;
    }

    if (added.server !== undefined) {
      if (this._player) {
        this._player.stop();
      }

      const rc = this._config.createRc();

      if (added.server) {
        this._player = new PlayerServer(added.server, {
          rc,
          isPlaying: this._state.isPlaying,
          projectPath: this._config.projectPath,
          lastShader: this._lastShader,
        });
      } else {
        const view = new View(atom.workspace.element);
        this._player = new Player(view, rc, this._state.isPlaying, this._lastShader);
      }
    }

    if (added.osc !== undefined) {
      const port = added.osc;
      const osc = this._osc;
      if (osc && (!port || (osc.port !== parseInt(port, 10)))) {
        osc.destroy();
        this._osc = null;
      }
      if (port && !this._osc) {
        const oscLoader = new OscLoader(port);
        this._osc = oscLoader;
        oscLoader.on('message', this.onOsc);
        oscLoader.on('reload', () => this._loadLastShader());
      }
    }
  }

  _onChange = (rcDiff: RcDiff) => {
    this._onAnyChanges(rcDiff);
    this._player.onChange(rcDiff);
    this._loadLastShader();
  }

  _onChangeSound = (rcDiff: RcDiff) => {
    this._onAnyChanges(rcDiff);
    this._player.onChangeSound(rcDiff).then(() => {
      this._loadLastSoundShader();
    });
  }

  onOsc = (msg: { address: string, args: number[] }) => {
    this._player.setOsc(msg.address, msg.args);
  }

  toggle(): void {
    return (
      this._state.isPlaying ?
        this.stop() :
        this.play()
    );
  }

  play(): void {
    this._state.isPlaying = true;
    this._player.play();
    this._config.play();
  }

  stop(): void {
    this._state.isPlaying = false;
    this._player.stop();
    this._config.stop();
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

  loadSoundShader(): Promise<void> {
    const editor = atom.workspace.getActiveTextEditor();
    return this._loadShaderOfEditor(editor, true);
  }

  playSound(): void {
    this.loadSoundShader()
      .then(() => this._player.playSound());
  }

  stopSound(): void {
    this._player.stopSound();
  }

  _loadLastShader(): void {
    if (!this._lastShader) {
      return;
    }
    this._player.loadShader(this._lastShader);
  }

  _loadLastSoundShader(): void {
    if (!this._lastSoundShader) {
      return;
    }
    this._player.loadSoundShader(this._lastSoundShader);
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

  _createPasses(rcPasses: any, shader: string, postfix: string, dirname: string): Promise<any[]> {
    if (rcPasses.length === 0) {
      rcPasses.push({});
    }

    const lastPass = rcPasses.length - 1;

    return Promise.all(rcPasses.map(async (rcPass, i) => {
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
          if (i === lastPass && (postfix === '.frag' || postfix === '.fs')) {
            pass.fs = shader;
          }
        }
        if (rcPass.fs) {
          pass.fs = await loadFile(this._glslangValidatorPath, path.resolve(dirname, rcPass.fs));
          if (i === lastPass && (postfix === '.vert' || postfix === '.vs')) {
            pass.vs = shader;
          }
        }
      }
      return pass;
    }));
  }

  _loadShaderOfEditor(editor: TextEditor, isSound: ?boolean): Promise<void> {
    if (editor === undefined) {
      // This case occurs when no files are open/active
      return Promise.resolve();
    }
    const filepath = editor.getPath();
    const dirname = path.dirname(filepath);

    const m = (filepath || '').match(/(\.(?:glsl|frag|vert|fs|vs))$/);
    if (!m) {
      console.error('The filename for current doesn\'t seems to be GLSL.');
      return Promise.resolve();
    }
    const postfix = m[1];

    let shader = editor.getText();

    let rc;
    return Promise.resolve()
      .then(() => {
        const headComment = (shader.match(/(?:\/\*)((?:.|\n|\r|\n\r)*?)(?:\*\/)/) || [])[1];

        if (isSound) {
          this._config.setSoundSettingsByString(filepath, headComment);
          rc = this._config.createSoundRc();
        } else {
          this._config.setFileSettingsByString(filepath, headComment);
          rc = this._config.createRc();
        }

        if (rc.glslify) {
          shader = glslify(shader, { basedir: path.dirname(filepath) });
        }
      })
      .then(() => {
        if (!isSound) {
          return validator(this._glslangValidatorPath, shader, postfix);
        }
      })
      .then(() => this._createPasses(rc.PASSES, shader, postfix, dirname))
      .then(passes => {
        if (isSound) {
          this._player.loadSoundShader(shader);
          this._lastSoundShader = shader;
        } else {
          this._player.loadShader(passes);
          this._lastShader = passes;
        }
      })
      .catch(e => {
        console.error(e);
      });
  }
}
