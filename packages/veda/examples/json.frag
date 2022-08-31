/*{
  frameskip: 1,
  vertexMode: "TRIANGLES",
  PASSES: [{
    MODEL: {
      // PATH: './models/json/teapot-claraio.json',
      // PATH: './models/json/suzanne_geometry.json',
      // PATH: './models/json/WaltHeadLo.json',
      // PATH: './models/animated/flamingo.js',
      // PATH: './models/animated/horse.js',
      // PATH: './models/animated/parrot.js',
      // PATH: './models/animated/sittingBox.js',
      // PATH: './models/animated/stork.js',
      PATH: './models/animated/monster/monster.js',
    },
    vs: './json.vert',
    fs: './json.frag',
    TARGET: 'pass1',
    BLEND: 'NORMAL',
  }, {
  }],
}*/
precision mediump float;
uniform float time;
uniform int PASSINDEX;
uniform sampler2D material0;
uniform sampler2D pass1;
uniform sampler2D backbuffer;
uniform vec2 resolution;
varying vec2 vUv;

varying vec4 v_color;
varying float vObjectId;
uniform sampler2D vm;

vec2 rot(in vec2 p, in float t) {
  float s = sin(t);
  float c = cos(t);
  return mat2(s, c, -c, s) * p;
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;

  if (PASSINDEX == 0) {
    if (vObjectId == 0.) {
      gl_FragColor = texture2D(material0, vUv);
      gl_FragColor *= 2.;
    }
  }
  if (PASSINDEX == 1) {
    float r = length(uv - .5) + time *.3;
    gl_FragColor = texture2D(backbuffer, fract(uv + rot(uv - .5, r))) * 0.6;
    gl_FragColor.r *= 1.3;

    vec4 c = texture2D(pass1, uv);
    if (c.a > .5) {
      gl_FragColor = c;
    }
  }
}
