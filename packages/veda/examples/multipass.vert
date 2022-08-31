/*{
    "pixelRatio": 1,
    "vertexCount": 100,
    "vertexMode": "POINTS",
    "PASSES": [{
        "TARGET": "vertexBuffer",
    }, {}]
}*/
precision mediump float;
attribute float vertexId;
uniform float vertexCount;
uniform float time;
uniform vec2 resolution;
uniform vec2 mouse;
varying vec4 v_color;
uniform int	PASSINDEX;
uniform sampler2D vertexBuffer;

void main() {
    float t = vertexId + time * 3.;
    vec3 pos = vec3(cos(t), sin(t), 0);
    gl_PointSize = 100.;

    if (PASSINDEX == 0) {
        gl_Position = vec4(pos.x, pos.y * resolution.x / resolution.y, 0, 1);
        v_color = vec4(pos.x, pos.y, fract(t), 1);
    }
    else {
        float x = mod(vertexId, 10.) * .2 - .9;
        float y = floor(vertexId / 10.) * .2 - .9;
        gl_Position = vec4(x, y, 0, 1);
        v_color = texture2D(vertexBuffer, pos.xy * .5 + .5);
    }
}
