/*{ "camera": true }*/
precision mediump float;
uniform float time;
uniform vec2 resolution;
uniform sampler2D camera;

vec2 rotate(in vec2 p, in float t) {
    return mat2(
        sin(t), cos(t),
        cos(t), -sin(t)
    ) * p;
}

void main() {
    float t = time * .3;

    vec2 uv = gl_FragCoord.xy / resolution;
    uv -= .5;
    uv.y *= resolution.y / resolution.x;

    uv *= uv;
    uv = rotate(uv, t) + .5;
    // uv = fract(uv * fract(time) * 2.);

    gl_FragColor = fract(texture2D(camera, uv) * 3.);
    gl_FragColor.r *= .7;
}
