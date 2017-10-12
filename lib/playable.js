import type { Shader } from './constants';
import type { RcDiff } from './config';

export interface Playable {
  destroy: () => void;
  onChange: (rcDiff: RcDiff) => void;
  play: () => void;
  stop: () => void;
  loadShader: (shader: Shader) => void;
}
