precision mediump float;
uniform float time;
uniform vec2 resolution;
uniform sampler2D backbuffer;

void main() {
	vec2 p = (gl_FragCoord.xy * 2. - resolution) / min(resolution.x, resolution.y);
	float t = time * 2.7;
	p = p * p * 2.;

    float c = 0.;
	c += 0.01 / length(p - vec2(sin(t * 2.), cos(t * 1.)));
	c += 0.01 / length(p - vec2(sin(t * 1.3), cos(t * .8)));
	c += 0.01 / length(p - vec2(sin(t * .9 + time), cos(t * 1.7)));
	c += 0.01 / length(p - vec2(cos(t * .47), sin(t * 1.9 + time)));

	vec4 b = texture2D(backbuffer, gl_FragCoord.xy / resolution);

	gl_FragColor = c * vec4(0.2, 0.3, 0.8, 1) + b * 0.9;
}
