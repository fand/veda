precision mediump float;

uniform vec2 resolution;


// ray primitive

struct ray{
  vec3 o, dir;
};

vec3 ray_at(ray r, float t){
  return r.o + r.dir*t;
}

// intersections
struct sphere{
  vec3 center;
  float radius;
};

bool hit_sphere(sphere s, ray r){
  vec3 oc = r.o - s.center;
  float a = dot(r.dir,r.dir);
  float b = 2. * dot(oc, r.dir);
  float c = dot(oc,oc) - s.radius*s.radius;
  float d = b*b - 4.*a*c;
  if(d < 0.){ return false;}

// check if we are inside the sphere and the closest intersection is behind us.
  float t1 = (-b - sqrt(d)) / (2.*a);
  float t2 = (-b + sqrt(d)) / (2.*a);
  float t = t1 < 0.05 ? t2 : t1;


  if(t < 0.05 || t > 1000.){
    return false;
  }

  return true;
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
  sphere s = sphere(vec3(0.,0.,-2.), 1.);
  bool is_hit = hit_sphere(s,r);
  if(is_hit){
    return vec3(1.,0.,0.);
  }
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
