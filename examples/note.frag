/*{ "midi": true }*/
precision mediump float;
uniform float time;
uniform vec2 resolution;
uniform sampler2D backbuffer;
uniform sampler2D midi;
uniform sampler2D note;

vec2 rotate(in vec2 p, in float t) {
    t *= .2;
    return mat2(
        cos(t), -sin(t),
        sin(t), cos(t)
    ) * p;
}

float random(in vec2 st) {
    return fract(abs(sin(dot(st, vec2(94.2984, 488.923))) * 234.9892));
}

float rects(in vec2 p, in float t) {
    float s = random(vec2(p.x * .0001 + t * .00008, floor(p.y * 32.)));
    return s;
}

void main() {
    vec2 p = (gl_FragCoord.xy * 2. - resolution) / min(resolution.x, resolution.y);
    vec2 uv = gl_FragCoord.xy / resolution;
    float n = rects(p, time);
    float l = length(p) * .1;

    float r = texture2D(note, vec2(l * 2. +.5, 0.)).r;
    float g = texture2D(note, vec2(l * 3. +.3, 0.)).r;
    float b = texture2D(note, vec2(l * 5. +.2, 0.)).r;

    gl_FragColor = n * (
        r * vec4(1,.4,1,1) +
        g * vec4(.8,-1.,2.,1) +
        b * vec4(0,3.3,3.,1)
    ) + texture2D(backbuffer, (uv - .5) * 1.02 +.5 ) * .96;
}
