/*{
    "pixelRatio": 1,
    "vertexCount": 3000,
    "vertexMode": "POINTS",
    "PASSES": [{
        "fs": "./combination.frag",
    }]
}*/
precision mediump float;
attribute float vertexId;
uniform float vertexCount;
uniform float time;
uniform vec2 resolution;
varying vec4 v_color;

void main() {
  float t = time * .3;
  float i = vertexId * .2 + sin(vertexId) * 1.;

  vec3 pos = vec3(
    sin(t + i * 9.),
    cos(t + i * 11.),
    0.
  ) * .7;

  gl_Position = vec4(pos.x, pos.y * resolution.x / resolution.y, pos.z * .1, 1);
  gl_PointSize = 2.;

  v_color = vec4(
    sin(i + 1.),
    sin(i + 2.),
    sin(i + 3.),
    1
  );
}
