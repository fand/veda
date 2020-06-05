precision mediump float;

uniform vec2 resolution;


// ray primitive

struct ray{
  vec3 o, dir;
};

vec3 ray_at(ray r, float t){
  return r.o + r.dir*t;
}

// camera

struct camera{
  vec3 o, lower_left, horizontal, vertical;
};

camera make_camera(){
  float h = 2.0;
  float aspect = (resolution.x / resolution.y);
  float w = h * aspect;

  vec3 o = vec3(0.,0.,0.);
  vec3 horizontal = vec3(4., 0,0);
  vec3 vertical = vec3(0.,4./aspect,0.);
  vec3 lower_left = vec3(-2., -1., -1.);
  return camera(o, lower_left, horizontal, vertical);
}

ray camera_get_ray(camera c, vec2 uv){
  ray r =  ray(c.o,
    normalize(c.lower_left + uv.x * c.horizontal + uv.y * c.vertical - c.o));
    return r;
}

vec3 ray_color(ray r){
  vec3 unit_dir = normalize(r.dir);
  float t = 0.5 * (unit_dir.y + 1.0);
  return (1.0 - t)*vec3(1.0) + t*vec3(0.5,0.7,1.0);
}

void main(){
  vec2 p = (gl_FragCoord.xy * 2. - resolution) / min(resolution.x, resolution.y);
  vec2 uv = gl_FragCoord.xy / resolution;

camera c = make_camera();

    ray r = camera_get_ray(c, uv);
    vec3 col = ray_color(r);

    vec4 result = vec4(col,1.);
    gl_FragColor = result;
}
