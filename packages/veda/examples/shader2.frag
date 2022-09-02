precision mediump float;
uniform float time;
uniform vec2 resolution;

void main() {
    vec2 p = (gl_FragCoord.xy * 2. - resolution) / min(resolution.x, resolution.y);

    gl_FragColor = vec4(
        0.3 / length(p + vec2(sin(time * 1.23) * 0.4, 0)),
        0.3 / length(p + vec2(sin(time * 2.23) * 0.4, 0)),
        0.3 / length(p + vec2(sin(time * 3.23) * 0.4, 0)),
        1.
    );
}
