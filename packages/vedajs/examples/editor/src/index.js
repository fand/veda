import Veda from '../../../src';
const textarea = document.querySelector('textarea');
const canvas = document.querySelector('canvas');
const INITIAL_FS = `
precision mediump float;
uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  gl_FragColor = vec4(uv,0.5+0.5*sin(time),1.0);
}
`.trim();
textarea.value = INITIAL_FS;

const veda = new Veda();
veda.setCanvas(canvas);

const update = () => {
  veda.loadShader([{
    fs: textarea.value.trim(),
  }]);
};

update();
setInterval(update, 1000);

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth * 0.5;
  canvas.height = window.innerHeight;
});

veda.play();
