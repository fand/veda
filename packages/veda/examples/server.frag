/*{
  "server": 3000,
  "IMPORTED": {
    "font": { "PATH": "./images/font.png" },
  }
}*/
precision mediump float;
uniform float time;
uniform vec2 resolution;
uniform sampler2D font;

float chara(in vec2 uv, in float code) {
    uv = clamp(uv, 0., 1.);
    uv.x *= abs(sin(time + cos(uv.y * 1070. + time))) + .3;
    float x = mod(code, 16.) / 16.;
    float y = 1. - ((floor(code / 16.) + 1.) / 16.);
    return texture2D(font, vec2(x, y) + uv / 16.).r;
}

void main() {
    vec2 uv = gl_FragCoord.xy / resolution;

    uv.x *= 9.;
    uv.y *= 4.;
    vec4 text = vec4(
        chara(uv - vec2(1, 2), 72.) +
        chara(uv - vec2(2, 2), 69.) +
        chara(uv - vec2(3, 2), 76.) +
        chara(uv - vec2(4, 2), 76.) +
        chara(uv - vec2(5, 2), 79.) +
        chara(uv - vec2(1, 1), 66.) +
        chara(uv - vec2(2, 1), 82.) +
        chara(uv - vec2(3, 1), 79.) +
        chara(uv - vec2(4, 1), 87.) +
        chara(uv - vec2(5, 1), 83.) +
        chara(uv - vec2(6, 1), 69.) +
        chara(uv - vec2(7, 1), 82.)
    );

    gl_FragColor = text;
}
