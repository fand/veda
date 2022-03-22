#version 300 es
/*{
  frameskip: 1,
}
*/

precision highp float;
precision highp int;

out vec4 FragColor;
uniform vec2 resolution;
uniform float time;
uniform sampler2D backbuffer;

void main(){
  vec2 uv = gl_FragCoord.xy / resolution;
  vec2 p = (gl_FragCoord.xy * 2. - resolution) / min(resolution.x, resolution.y);

  float c;

  int N = (int(time) % 10);
  for (int i = 0; i < N; i++) {
    float fi = float(i) * 0.7 + time * 0.3;
    c += .01 / length(p - vec2(cos(fi * 2.), sin(fi * 5.)) * 0.8);
  }

  c = smoothstep(0., 1., c);

  FragColor = vec4(c);
  FragColor += texture(backbuffer, uv) * 0.9;
}
