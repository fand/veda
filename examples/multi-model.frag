/*{
  pixelRatio: 1,
  frameskip: 1,
  vertexMode: "TRIANGLES",
  audio: true,
  PASSES: [
    {
      MODEL: {
        PATH: './models/obj/apple/apple.obj',
        MATERIAL: './models/obj/apple/apple.mtl',
      },
      vs: './obj-mtl.vert',
      fs: './multi-model.frag',
      TARGET: 'pass1',
      BLEND: 'NORMAL',
    },
    {
      MODEL: {
        PATH: './models/obj/pokemon/pokemon.obj',
        MATERIAL: './models/obj/pokemon/pokemon.mtl',
      },
      vs: './obj-mtl.vert',
      fs: './multi-model.frag',
      TARGET: 'pass2',
      BLEND: 'NORMAL',
    },
    {}
  ],
  IMPORTED: {
    video: { PATH: './videos/1.mp4' },
  }
}*/
precision mediump float;
uniform float time;
uniform int PASSINDEX;
uniform sampler2D material0;
uniform sampler2D pass1;
uniform sampler2D pass2;
uniform sampler2D backbuffer;
uniform vec2 resolution;
uniform float volume;
varying vec2 vUv;

varying vec4 v_color;
varying float vObjectId;
uniform sampler2D video;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;

  if (PASSINDEX == 0) {
    gl_FragColor = texture2D(material0, vUv);
  }
  if (PASSINDEX == 1) {
    gl_FragColor = texture2D(material0, vUv);
  }
  if (PASSINDEX == 2) {
    gl_FragColor = texture2D(pass1, uv + vec2(0.2, 0));
    gl_FragColor += texture2D(pass2, uv - vec2(0.2, 0));
    if (gl_FragColor.a < .5) {
      gl_FragColor = texture2D(video, abs(uv - .5)) * 2. - 1.;
      gl_FragColor = gl_FragColor.rrrr;
    }
  }
}
