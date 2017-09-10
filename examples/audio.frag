/*{ "audio": true }*/
precision mediump float;
uniform float time;
uniform vec2  resolution;
uniform sampler2D texture;
uniform sampler2D spectrum;
uniform sampler2D samples;
uniform float volume;

void main (void) {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    vec4 color = texture2D(texture, uv);

    float freq = texture2D(spectrum, vec2(uv.x, .5)).r;
    float wave = texture2D(samples, vec2(uv.x, .5)).r;

    float r = 1. - step(0.01, abs(wave - uv.y));
    float g = 1. - step(0.01, abs(freq - uv.y));
    float b = 1. - step(0.01, abs(volume / 255. - uv.y));

    gl_FragColor = vec4(r, g, b, 1.);
}
