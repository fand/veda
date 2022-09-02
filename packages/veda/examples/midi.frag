/*{
    "midi": true,
    "frameskip": 1
}*/
precision mediump float;
uniform float time;
uniform vec2 resolution;
uniform vec2 mouse;
uniform sampler2D spectrum;
uniform sampler2D midi;

vec2 rotate(in vec2 p, in float t) {
    t *= .2;
    return mat2(
        cos(t), -sin(t),
        sin(t), cos(t)
    ) * p;
}

vec4 circle(in vec2 p, in float t) {
    vec2 st = (gl_FragCoord.xy  / resolution);
    vec2 d = st - mouse;
    float l = length(d * d);
    l *= sin(t * 2.) * .2;
    return vec4(-1, 1, 1, 1) * abs(sin(l * t * 30.));
}

vec4 plasma(in vec2 p, in float t) {
    p *= rotate(p, -7.);
    float s = sin(p.x * (1. - p.x) * 20. +t) * cos(p.y * 40. + time * 8.);
    return vec4(2, 3, -2, 1) * s;
}

float random(in vec2 st) {
    return fract(abs(sin(dot(st, vec2(94.2984, 488.923))) * 234.9892));
}

vec4 rects(in vec2 p, in float t) {
    float s = random(vec2(p.x * .0001 + t * .00008, floor(p.y * 32.)));
    return vec4(2, -1, 1, 1) * s;
}

void main() {
    vec2 p = (gl_FragCoord.xy * 2. - resolution) / min(resolution.x, resolution.y);
    float t = time * 2.7;

    gl_FragColor = (
        circle(p, t) * texture2D(midi, vec2(176. / 256., 0. / 128.)).x * 2. +
        plasma(p, t) * texture2D(midi, vec2(176. / 256., 1. / 128.)).x * 2. +
        rects(p, t)  * texture2D(midi, vec2(176. / 256., 2. / 128.)).x * 2.
    );
}
