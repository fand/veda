/*{
  frameskip: 1,
  vertexMode: "TRIANGLES",
  PASSES: [{
    MODEL: {
      PATH: './models/json/teapot-claraio.json',
    },
  }]
}*/
precision mediump float;
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;
attribute float vertexId;
attribute float objectId;
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform mat3 uvTransform;
uniform float time;
uniform vec2 resolution;
varying vec2 vUv;
varying float vObjectId;
varying vec4 v_color;

vec2 rot(in vec2 p, in float t) {
  float s = sin(t);
  float c = cos(t);
  return mat2(s, c, -c, s) * p;
}

void main() {
  vec3 pos = position;
  pos.xz = rot(pos.xz, time * 0.2);
  pos.x *= resolution.y / resolution.x;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);

  vUv = uv;
  vObjectId = objectId;
  v_color = vec4(vUv, 1, 1);
}
