/*{ "osc": 4000 }*/
precision mediump float;
uniform float time;
uniform vec2 resolution;
uniform sampler2D osc_foo;      // OSC on /foo
uniform sampler2D osc_foo_bar;  // OSC on /foo/bar

void main() {
    vec2 uv = gl_FragCoord.xy / resolution;
    if (uv.y < .5) {
        // The texture is resized automatically.
        // When you send [0, 1] to /foo,
        // the left half of the screen will be black and the right will be white.
        gl_FragColor = texture2D(osc_foo, uv);
    } else {
        gl_FragColor = texture2D(osc_foo_bar, uv);
    }
}
