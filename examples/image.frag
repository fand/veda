precision mediump float;
uniform float time;
uniform vec2 resolution;
uniform sampler2D image1;
uniform sampler2D image2;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution;
    uv = (uv - .5) / (mod(time * 2., 3.141592) + 1.) + .5;

    gl_FragColor = mix(
        1. - texture2D(image1, uv),
        1. - texture2D(image2, uv),
        cos(time * 2.) * .5 + .5
    );
}
