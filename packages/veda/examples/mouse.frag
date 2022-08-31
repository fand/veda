precision mediump float;
uniform float time;
uniform vec2 resolution;
uniform vec2 mouse;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution;
    float t = time * 1.7;

    vec3 c = .08 / (
        vec3(1,1,0) * length(uv - mouse + .04 * vec2(sin(t * 1.3), cos(t * 0.7))) +
        vec3(1,0,1) * length(uv - mouse + .04 * vec2(cos(t * 2.3), sin(t * 1.7))) +
        vec3(0,1,1) * length(uv - mouse + .04 * vec2(sin(t * 3.3), sin(t * 2.7)))
    );

    gl_FragColor = vec4(c, 1);
}
