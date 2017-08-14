precision mediump float;
uniform float time;
uniform vec2 resolution;
uniform sampler2D key;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution;
    float k = texture2D(key, uv).x;
    gl_FragColor = vec4(k);
}
