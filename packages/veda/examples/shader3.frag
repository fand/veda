/*{ "audio": true }*/
precision mediump float;
uniform float time;
uniform vec2 resolution;
uniform sampler2D spectrum;

void main() {
    vec2 p = (gl_FragCoord.xy * 2. - resolution) / min(resolution.x, resolution.y);

    float freq = (
        texture2D(spectrum, vec2(abs(p.x * .3), .5)).r *.3
        * texture2D(spectrum, vec2(abs(p.y * 0.3), .5)).r * 2.
        );
        freq *= freq;

        gl_FragColor = vec4(
            freq / length(p + vec2(sin(time * 1.23 + 3.), 0)),
            freq / length(p + vec2(sin(time * 2.23 + 4.), 0)),
            freq / length(p + vec2(sin(time * 3.23 + 5.), 0)),
            1.
        );
    }
