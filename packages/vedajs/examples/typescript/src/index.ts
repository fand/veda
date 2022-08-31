import Veda from '../../../src';

const veda = new Veda({ frameskip: 2 });

// This line causes TypeScript error!
// const veda = new Veda({ frameskip: 'hello' });

veda.setCanvas(document.querySelector('canvas')!);

// This line causes TypeScript error!
// veda.setCanvas(document.querySelector('body'));

veda.loadShader([{
  fs: `
    precision mediump float;
    uniform float time;
    uniform vec2 mouse;
    uniform vec2 resolution;

    void main() {
      vec2 uv = gl_FragCoord.xy / resolution.xy;
      gl_FragColor = vec4(uv,0.5+0.5*sin(time),1.0);
    }
  `,
}]);
veda.play();
