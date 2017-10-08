import type { Pass } from './three-shader';
import type { RcDiff } from './config';

export interface Playable {
  destroy: () => void;
  onChange: (rcDiff: RcDiff) => void;
  play: () => void;
  stop: () => void;
  loadShader: (passes: Pass[]) => void;
}
