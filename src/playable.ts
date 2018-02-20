import { Shader } from './constants';
import { RcDiff } from './config';

export interface Playable {
  destroy: () => void;
  onChange: (rcDiff: RcDiff) => void;
  onChangeSound: (rcDiff: RcDiff) => Promise<void>;
  play: () => void;
  stop: () => void;
  loadShader: (shader: Shader) => void;
  playSound: () => void;
  stopSound: () => void;
  loadSoundShader: (fs: string) => void;
  setOsc: (name: string, data: number[]) => void;
}
