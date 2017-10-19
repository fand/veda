precision mediump float;
uniform float time;
uniform vec2 resolution;
uniform sampler2D gif;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution;
    float t = time * .3;
    gl_FragColor = fract(texture2D(gif, fract(uv+t)) + t);
}
