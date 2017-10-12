/* @flow */

export const INITIAL_FRAGMENT_SHADER = `
precision mediump float;
uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  gl_FragColor = vec4(uv,0.5+0.5*sin(time),1.0);
}
`;

export const INITIAL_SHADER = [{
  fs: INITIAL_FRAGMENT_SHADER,
}];
