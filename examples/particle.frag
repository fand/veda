/*{
    "pixelRatio": 1,
    "vertexCount": 5000,
    "vertexMode": "POINTS",
    "PASSES": [{
        "TARGET": "renderBuffer",
        "vs": "./particle.vert",
    }, {
    }]
}*/
precision mediump float;
uniform float time;
uniform vec2 resolution;
uniform int	PASSINDEX;
uniform sampler2D renderBuffer;
uniform sampler2D backbuffer;
varying vec4 v_color;

void main() {
    vec2 p = (gl_FragCoord.xy * 2. - resolution) / min(resolution.x, resolution.y);
    vec2 uv = gl_FragCoord.xy / resolution;
    p = fract(abs(p));
    float d = .001;

    gl_FragColor.gb = vec2((
        texture2D(renderBuffer, p) +
        texture2D(renderBuffer, p + vec2(d, 0)) +
        texture2D(renderBuffer, p - vec2(d, 0)) +
        texture2D(renderBuffer, p + vec2(0, d)) +
        texture2D(renderBuffer, p - vec2(0, d))
    ).b);
    gl_FragColor += texture2D(backbuffer, uv).b * .8;
    gl_FragColor.r = texture2D(backbuffer, uv + .004).b;
}
