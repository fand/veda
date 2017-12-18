/*{ "audio": true, "fftSmoothingTimeConstant": .1 }*/
precision mediump float;
uniform float time;
uniform vec2 resolution;
uniform sampler2D intspectrum;

const float is3 = 1./sqrt(3.);
const mat2 sk = mat2(2.*is3, is3, 0., 1.) * 3.;

#define hash(x) fract(sin(x) * 1e4)

float rand(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

mat2 rot(float a) {
    float c = cos(a), s = sin(a);
    return mat2(c, -s, s, c);
}

void main (void) {
    vec2 uv = gl_FragCoord.xy / resolution.xy;
    uv -= .5;
    uv.x *= resolution.x/resolution.y;
    uv *= rot(time * .1);

    vec2 skuv = sk*uv,
        fuv = fract(skuv),
        iuv = floor(skuv);
    if (fuv.y > fuv.x)
        iuv.x += 10. + iuv.y;
    float r = rand(iuv);
    vec4 rr = hash(r + vec4(0., 3., 5., 14.));

    float x = (rot(rr.w * 6.28358135) * uv).x;
    x *= 10. + rr.x * 5.;
    x += texture2D(intspectrum, vec2(mix(.1, .9, rr.y), .5)).r * 2.;
    float c = smoothstep(.0, .05, fract(x) - mix(.7, .9, rr.z)) - smoothstep(.98, 1., fract(x));
    gl_FragColor = vec4(c, c, c, 1.);
}
