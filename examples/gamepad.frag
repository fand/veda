/*{ "gamepad": true }*/
precision mediump float;
uniform float time;
uniform vec2 resolution;
uniform sampler2D gamepad;
uniform sampler2D backbuffer;

float random (in vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // Smooth Interpolation

    // Cubic Hermine Curve.  Same as SmoothStep()
    // vec2 u = f * f * (3. - 2. * f);
    vec2 u = smoothstep(0., 1., f);

    // Mix 4 coorners porcentages
    return mix(a, b, u.x) +
        (c - a)* u.y * (1.0 - u.x) +
        (d - b) * u.x * u.y;
}

vec2 ax(in vec2 p) {
    return vec2(
        // Get left stick's status of Nintendo Switch Pro Controller
        texture2D(gamepad, vec2(0. / 128., 1.)).x - .5,
        .5 - texture2D(gamepad, vec2(1. / 128., 1.)).x
    );

}

float shot(in vec2 p, in vec2 c) {
    // Get buttons' status of Nintendo Switch Pro Controller
    float strength = texture2D(gamepad, vec2(7. / 128., 0.)).x;

    vec2 d = p - c * 2.;
    float l = length(d);
    float a = atan(d.y, d.x) * 2.;
    float n = noise(vec2(a * 3. + floor(time * 30.) * 2.)) * .4 * (random(vec2(time * 2.)) * .6 + .4);

    return (1. - step(n + .1, l)) * strength;
}

void main() {
    vec2 p = (gl_FragCoord.xy * 2. - resolution) / min(resolution.x, resolution.y);
    vec2 uv = gl_FragCoord.xy / resolution;
    float t = time * 3.;
    vec3 color = vec3(sin(t), sin(t + 2.), sin(t + 4.));

    vec2 c = ax(p);

    float l = .003 / length(p - c * 2.);
    gl_FragColor = vec4(color * l, 1);
    gl_FragColor += vec4(shot(p, c) * color, 1);
    gl_FragColor += texture2D(backbuffer, vec2(uv.x, uv.y)) * 0.4;
    gl_FragColor += texture2D(backbuffer, vec2(uv.x, uv.y + noise(vec2(uv.x  * 100.)) * .01)) * 0.5;
}
