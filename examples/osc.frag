/*{ "osc": 4000 }*/
precision mediump float;
uniform float time;
uniform vec2 resolution;
uniform sampler2D osc_foo;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution;
    gl_FragColor = texture2D(osc_foo, uv) / 255.;
}
