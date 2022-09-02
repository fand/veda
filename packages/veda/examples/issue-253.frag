/*
{
  audio: true,
}
*/
precision mediump float;
uniform vec2 resolution;
uniform float volume;
uniform sampler2D samples;
uniform sampler2D spectrum;

void main() {
  vec2 uv = gl_FragCoord.xy/resolution.xy;
  gl_FragColor=texture2D(spectrum,uv);
  gl_FragColor.a=1.;
}
