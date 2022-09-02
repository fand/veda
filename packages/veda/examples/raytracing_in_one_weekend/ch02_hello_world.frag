
precision mediump float;

uniform vec2 resolution;

void main(){
  vec2 uv = gl_FragCoord.xy / resolution;

  gl_FragColor = vec4(uv, 0., 1.);
}
