precision mediump float;
uniform float time;
uniform vec2 resolution;
uniform sampler2D image1;
uniform sampler2D image2;
uniform vec2 image1Size;
uniform vec2 image2Size;

vec2 crop(in vec2 uv, in vec2 res) {
    float aspect = resolution.y / resolution.x;
    if (aspect > (res.y / res.x)) {
        // if taller
        return vec2(
            (uv.x - .5) / aspect + .5,
            uv.y
        );
    } else {
        // if wider
        return vec2(
            uv.x,
            (uv.y - .5) * aspect + .5
        );
    }
}

void main() {
    vec2 uv = gl_FragCoord.xy / resolution;
    uv = (uv - .5) / (mod(time * 2., 3.141592) + 1.) + .5;

    gl_FragColor = mix(
        1. - texture2D(image1, crop(uv, image1Size)),
        1. - texture2D(image2, crop(uv, image2Size)),
        cos(time * 2.) * .5 + .5
    );
    gl_FragColor.a = 1.;
}
