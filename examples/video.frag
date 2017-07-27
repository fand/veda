precision mediump float;
uniform float time;
uniform vec2 resolution;
uniform sampler2D video1;
uniform sampler2D video2;
uniform sampler2D video3;

vec2 rotate(in vec2 p, in float t) {
  return mat2(
    sin(t), cos(t),
    cos(t), -sin(t)
  ) * p;
}

void main() {
  float t = time * .3;

	vec2 uv = gl_FragCoord.xy / resolution;
  uv -= .5;
  uv.y *= resolution.y / resolution.x;
  // uv *= uv;
  uv = rotate(uv, t) + .5;

	gl_FragColor = (
		texture2D(video1, uv) * sin(t + 0.) +
		texture2D(video2, uv) * sin(t + 2.) +
		texture2D(video3, uv) * sin(t + 4.)
	);
}
