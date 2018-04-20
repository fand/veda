/*{
  frameskip: 1,
  vertexMode: "TRIANGLES",
  PASSES: [{
    MODEL: { PATH: './deer.obj' },
    vs: './obj.vert',
    TARGET: 'deer',
  }, {}]
}*/
precision mediump float;
uniform float time;
uniform vec2 resolution;
uniform int PASSINDEX;
uniform sampler2D deer;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    if (PASSINDEX == 0) {
      gl_FragColor = vec4(1);
    }
    else {
      vec4 deer = texture2D(deer, uv);
      gl_FragColor = vec4(uv.x, 0, uv.y, 1.) * .5 / deer;
    }
}
