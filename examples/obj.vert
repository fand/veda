/*{
    frameskip: 1,
    vertexMode: "TRIANGLES",
    PASSES: [{
      OBJ: './deer.obj'
    }]
}*/
precision mediump float;
attribute vec3 position;
attribute vec3 normal;
attribute float vertexId;
uniform float vertexCount;
uniform float time;
uniform vec2 resolution;
uniform vec2 mouse;
uniform sampler2D spectrum;
uniform float volume;
varying vec4 v_color;

vec2 rot(in vec2 p, in float t) {
  float s = sin(t);
  float c = cos(t);
  return mat2(s, c, -c, s) * p;
}

vec3 sphere(in vec3 p) {
  float rz = 1. - (vertexId / 1000.) * .1;
  float h = sqrt(1. - rz * rz);
  return vec3(
    cos(vertexId * .3 + time) * h,
    sin(vertexId * .3 + time) * h,
    rz
  ) * .3;
}

vec3 rects(in vec3 p) {
  float xo = mod(floor(vertexId / 768.), 2.) - 1.;
  float yo = mod(floor(vertexId / 768. / 2.), 2.) - 1.;
  vec3 pRects = vec3(
    mod(vertexId * 4.3, 2.0) / 2.0,
    mod(vertexId * 8.3, 3.0) / 3.0,
    mod(vertexId * 3.3, 4.0) / 4.0
  ) - .5;
  pRects.xz = rot(pRects.xz, time);
  pRects.x += xo * 1.3;
  pRects.y += yo * 1.3;
  pRects += .6;
  pRects *= .4;
  return pRects;
}

void main() {
  vec3 pos = position;
  pos *= .6;
  pos.xz = rot(pos.xz, time);

  // Morphing
  float tt = time;
  float d = mod(tt, 9.) * .5;
  pos = mix(pos, sphere(pos), clamp(max(d - 3., 1.5 - d), 0., 1.));
  pos = mix(pos, rects(pos), clamp(min(d - 2., 4.5 - d), 0., 1.));

  pos.y *= resolution.x / resolution.y;
  gl_Position = vec4(pos, 1);

  v_color = vec4(
    normalize(normal),
    1.
  );
  v_color *= 1. + dot(normalize(normal), vec3(1));
  v_color.a = 1.;
}
