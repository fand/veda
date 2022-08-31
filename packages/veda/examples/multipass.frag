/*{
    "PASSES": [{
        "TARGET": "renderBuffer",
    }, {
        "TARGET": "myBackBuffer",
    }]
}*/
precision mediump float;
uniform float time;
uniform vec2 resolution;
uniform int	PASSINDEX;
uniform sampler2D renderBuffer;
uniform sampler2D myBackBuffer;

void main() {
    vec2 p = (gl_FragCoord.xy * 2. - resolution) / min(resolution.x, resolution.y);
    vec2 uv = gl_FragCoord.xy / resolution;

    if (PASSINDEX == 0) {
        float c = abs(sin(time) * .1) / length(p);
        gl_FragColor = vec4(c);
    }
    else {
        gl_FragColor = texture2D(renderBuffer, fract(uv * floor(mod(time, 4.) + 1.)));
    }

    gl_FragColor += texture2D(myBackBuffer, uv) * .2;
}
