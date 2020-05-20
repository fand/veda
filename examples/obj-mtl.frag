/*{
  frameskip: 1,
  vertexMode: "TRIANGLES",
  PASSES: [{
    MODEL: {
      PATH: './models/obj/male02/male02.obj',
      MATERIAL: './models/obj/male02/male02.mtl',
    },
    vs: './obj-mtl.vert',
    fs: './obj-mtl.frag',
    TARGET: 'pass1',
    BLEND: 'NORMAL',
  }, {
  }],
  IMPORTED: {
    vm: { PATH: './videos/1.mp4' },
  }
}*/
precision mediump float;
uniform float time;
uniform int PASSINDEX;
uniform sampler2D material0;
uniform sampler2D material1;
uniform sampler2D material2;
uniform sampler2D material3;
uniform sampler2D material4;
uniform sampler2D material5;
uniform sampler2D material6;
uniform sampler2D material7;
uniform sampler2D material8;
uniform sampler2D material9;
uniform sampler2D material10;
uniform sampler2D material11;
uniform sampler2D pass1;
uniform sampler2D backbuffer;
uniform vec2 resolution;
varying vec2 vUv;

varying vec4 v_color;
varying float vObjectId;
uniform sampler2D vm;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;

  if (PASSINDEX == 0) {
    // gl_FragColor = (
    //   (vObjectId == 0.) ? texture2D(material0, vUv) :
    //   (vObjectId == 1.) ? texture2D(material1, vUv) :
    //   (vObjectId == 2.) ? texture2D(material2, vUv) :
    //   (vObjectId == 3.) ? texture2D(material3, vUv) :
    //   (vObjectId == 4.) ? texture2D(material4, vUv) :
    //   (vObjectId == 5.) ? texture2D(material5, vUv) :
    //   (vObjectId == 6.) ? texture2D(material6, vUv) :
    //   (vObjectId == 7.) ? texture2D(material7, vUv) :
    //   (vObjectId == 8.) ? texture2D(material8, vUv) :
    //   (vObjectId == 9.) ? texture2D(material9, vUv) :
    //   (vObjectId == 10.) ? texture2D(material10, vUv) :
    //   texture2D(material11, vUv)
    // );
    // gl_FragColor += texture2D(vm, fract(vUv * 2. + time * .3)) * (sin(time) * 0.5 + 0.5);
    gl_FragColor = texture2D(material0, vUv);

  }
  if (PASSINDEX == 1) {
    gl_FragColor = texture2D(pass1, uv);
    if (gl_FragColor.a < .5) {
      gl_FragColor = texture2D(vm, abs(uv - .5)) * 2. - 1.;
      gl_FragColor *= 0.2;
      gl_FragColor.g = texture2D(backbuffer, uv + 0.003).r;
      gl_FragColor.b = texture2D(backbuffer, uv + 0.006).r;
    }
  }
}
