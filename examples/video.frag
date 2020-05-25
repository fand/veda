precision mediump float;
uniform float time;
uniform vec2 resolution;
uniform sampler2D video1;
uniform sampler2D video2;
uniform sampler2D video3;
uniform vec2 video1Size;
uniform vec2 video2Size;
uniform vec2 video3Size;

vec2 rotate(in vec2 p, in float t) {
    return mat2(
        sin(t), cos(t),
        cos(t), -sin(t)
    ) * p;
}

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
    float t = time * .3;

    vec2 uv = gl_FragCoord.xy / resolution;
    uv -= .5;
    // uv *= uv;
    // uv = rotate(uv, t);
    uv += .5;

    // gl_FragColor = texture2D(video1, crop(uv, video1Size));;
    gl_FragColor = (
        texture2D(video1, crop(uv, video1Size)) * smoothstep(.3, .5, sin(t + 0.)) +
        texture2D(video2, crop(uv, video2Size)) * smoothstep(.3, .5, sin(t + 2.)) +
        texture2D(video3, crop(uv, video3Size)) * smoothstep(.3, .5, sin(t + 4.))
    );
}
