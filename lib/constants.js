/* @flow */

export const DEFAULT_VERTEX_SHADER = `
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;
export const DEFAULT_FRAGMENT_SHADER = `
precision mediump float;
varying vec4 v_color;
void main() {
  gl_FragColor = v_color;
}
`;
