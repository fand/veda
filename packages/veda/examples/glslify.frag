/*{ "glslify": true }*/

#pragma glslify: import('./common.glsl')
#pragma glslify: rotate2D = require(./rotate2d.frag)

void main() {
    vec2 p = (gl_FragCoord.xy * 2. - resolution) / min(resolution.x, resolution.y);
    p = rotate2D(p, time);

    gl_FragColor = vec4(
        sin(atan(p.y, p.x)),
        sin(atan(p.y, p.x) + 1.),
        sin(atan(p.y, p.x) + 2.),
        1.
    );
}
