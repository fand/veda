/*{
"PASSES": [{
        TARGET: "accum",
        FLOAT: true,
    }, {
        TARGET: "view",
        FLOAT: true,
    }]
}*/

precision mediump float;

uniform vec2 resolution;
uniform float time;

uniform int	PASSINDEX;
uniform sampler2D accum;
uniform sampler2D view;
uniform sampler2D backbuffer;

#define MAX_FLOAT 1e5
#define MAX_RECURSION 10
#define PI 3.1415926535897932385
#define TAU 2. * PI
// Φ = Golden Ratio
#define PHI 1.61803398874989484820459


float g_seed = 0.25;

// random number generator

//https://stackoverflow.com/a/34276128
bool isnan(float x){
  return !(x > 0. || x < 0. || x == 0.);
}

float rand(vec2 co){
    return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

// a variation of gold noise is used
// https://stackoverflow.com/a/28095165
// https://www.shadertoy.com/view/ltB3zD
// centered around [0-1] in gaussian
float random (vec2 st) {
     return fract(tan(distance(st*PHI, st)*g_seed)*st.x);
}

vec2 random2(float seed){
  return vec2(
    random(vec2(seed-1.23, (seed+3.1)* 3.2)),
    random(vec2(seed+12.678, seed - 5.8324))
    );
}

vec3 random3(float seed){
  return vec3(
    random(vec2(seed-0.678, seed-0.123)),
    random(vec2(seed-0.3, seed+0.56)),
    random(vec2(seed+0.1234, seed-0.523))
    );
}

vec3 random_in_unit_sphere( float seed) {
  vec2 tp = random2(seed);
  float theta = tp.x * TAU;
  float phi = tp.y * TAU;
  vec3 p = vec3(sin(theta) * cos(phi), sin(theta)*sin(phi), cos(theta));

  return normalize(p);
}

vec3 random_in_unit_disk(float seed){
  vec2 rand = random2(seed);
  float theta = rand.x * TAU;
  return vec3(cos(theta), sin(theta), 0)*rand.y;
}

vec3 random_unit(float seed){
    vec2 rand = random2(seed);
    float a = rand.x * TAU;
    float z = (2. * rand.y) - 1.;
    float r = sqrt(1. - z*z);
    return vec3(r*cos(a), r*sin(a), z);
}

// types

struct ray{
  vec3 o, dir;
};

struct mat{
  vec3 col;
  float scatter;
  int type;
};


struct hit{
  vec3 n,p;
  float t;
  bool front_face;
  mat m;
};

struct sphere{
  vec3 center;
  float radius;
  mat m;
};

// ray primitive

vec3 ray_at(ray r, float t){
  return r.o + r.dir*t;
}


// camera

struct camera{
  vec3 o, lower_left, horizontal, vertical;
  float lens_radius;
};

camera make_camera(){
  float aperature = 3.;
  float fov = 60.;
  float theta = radians(fov);
  float h = tan(theta / 2.) * 2.;
  float aspect = (resolution.x / resolution.y);
  float w = h * aspect;


  vec3 o = vec3(-3., 3., 0.);
  vec3 lookat = vec3(0., 0., -2.);
  float focal_depth = length(o - lookat);
  vec3 up = vec3(0., 1., 0.);
  vec3 to = normalize(o - lookat);
  vec3 u = normalize(cross(up, to));
  vec3 v = cross(to, u);

  vec3 horizontal = w * u * focal_depth;
  vec3 vertical = h * v * focal_depth;
  vec3 lower_left = o - horizontal/2. - vertical/2. - focal_depth*to;
  float lens_radius = aperature / 2.;
  return camera(o, lower_left, horizontal, vertical, lens_radius);
}

ray camera_get_ray(camera c, vec2 uv){
  vec3 rd = c.lens_radius * random_in_unit_disk(g_seed);
  vec3 offset = vec3(uv,0.) * rd;
  ray r =  ray(c.o + offset,
    normalize(c.lower_left + uv.x * c.horizontal + uv.y * c.vertical - c.o - offset));
    return r;
}


// intersections

bool hit_sphere(sphere s, ray r, vec2 t_min_max, inout hit rec){
  vec3 oc = r.o - s.center;
  float b = dot(oc, r.dir);
  float c = dot(oc,oc) - s.radius*s.radius;
  float d = b*b - c;
  if(d < 0.){ return false; }

  float t1 = (-b - sqrt(d));
  float t2 = (-b + sqrt(d));
  float t = t1 < t_min_max.x ? t2 : t1;

  vec3 p = ray_at(r, t);
  vec3 n = (p - s.center);
  // if front_face, the ray is in the sphere and not out, so invert normal
  bool front_face = dot(r.dir, n) > 0.;

  n = front_face ? -n : n;
  n /= s.radius;
  if(t < t_min_max.x || t > t_min_max.y){
    return false;
  }

  if(t < rec.t){
    rec = hit(n,p,t, front_face, s.m);
  }
  return true;
}


// raytracing
const vec2 t_min_max = vec2(0.001, MAX_FLOAT);


bool raycast(const in ray r, inout hit h){

  mat s_mat = mat(vec3(.1,.2,.6), 1., 0);
  sphere s = sphere(vec3(0.,0.,-2.), 1., s_mat);


  mat pl_mat = mat(vec3(.8,.8,.0), 1., 0);
  sphere pl = sphere(vec3(0.,-201, 0.), 200., pl_mat);

  mat m_mat1 = mat(vec3(.8, .6, .2), .3, 1);
  sphere met = sphere(vec3(2.,0.,-2.), 1., m_mat1);

  mat g_mat = mat(vec3(1.), 1.5, 2);
  sphere glass = sphere(vec3(-2.,0.,-2.), 1., g_mat);

  bool is_hit = false;
  is_hit = hit_sphere(pl, r, t_min_max, h) || is_hit;
  is_hit = hit_sphere(met, r, t_min_max, h) || is_hit;
  is_hit = hit_sphere(glass, r, t_min_max, h) || is_hit;
  is_hit = hit_sphere(s, r, t_min_max, h) || is_hit;
  return is_hit;
}
vec3 jitter(){
  vec3 jitter = random_unit(g_seed);
  if(isnan(jitter.r) || isnan(jitter.g) || isnan(jitter.b)){
    jitter = vec3(0.);
  }
  return jitter;
}

vec3 diffuse_mat(inout ray r, hit h, vec3 col){
  vec3 jitter = jitter();
  col *= h.m.col;

  vec3 target = (h.p + h.n + jitter);
  r.o = h.p;
  r.dir = normalize(target - h.p);
  return col;
}

vec3 metal_mat(inout ray r, hit h, vec3 col){
  vec3 refl = reflect(r.dir, h.n) + jitter()*h.m.scatter;
  r.o = h.p;
  r.dir = refl;
  col *= h.m.col;
  return col;
}

float schlick(float cosine, float ref_idx){
  float r0 = (1. - ref_idx) / (1. + ref_idx);
  r0 *= r0;

  return r0 + (1. - r0)*pow((1. - cosine), 5.);
}

vec3 custom_refr(vec3 v, vec3 n, float eta){
  float cos_th = dot(-v, n);
  vec3 r_out_par = eta * (v + cos_th*n);
  vec3 r_out_per = -sqrt(1.0 - dot(r_out_par, r_out_par)) * n;
  return r_out_par + r_out_per;
}

vec3 glass_mat(inout ray r, hit h, vec3 col){
  r.o = h.p;
  // h.m.scatter is the refractive index
  // eta is n1/n2;
  float ref_idx = h.m.scatter;
  float eta = ref_idx;
  if(!h.front_face){
    eta = 1. / ref_idx;
  }

  float cos_th = min(dot(-r.dir, h.n), 1.);
  float sin_th = 1. - cos_th*cos_th;

  float reflect_prob = schlick(cos_th, ref_idx);
  bool schlick_refl = random2(g_seed).x < reflect_prob;
  if(sin_th * eta > 1. || schlick_refl){
    vec3 refl = reflect(r.dir, h.n);
    r.dir = refl;
    return col;
  }

  vec3 refr = refract(r.dir, h.n, eta);
  r.dir = refr;

  return col;
}

vec3 ray_color(ray r){
  hit h;
  vec3 col = vec3(1.);

  for(int i=0; i < MAX_RECURSION; i++){
    h.t = MAX_FLOAT + 5.;
    bool is_hit = raycast(r, h);
    if(is_hit){
      if(h.m.type == 0){
        col = diffuse_mat(r, h, col);
      }
      if(h.m.type == 1){
        col = metal_mat(r,h,col);
      }
      if(h.m.type == 2){
        col = glass_mat(r,h,col);
      }
    }else{
      // skybox
      vec3 unit_dir = normalize(r.dir);
      float t = 0.5 * (unit_dir.y + 1.0);
      col *= mix(vec3(1.0), vec3(0.5,0.7,1.0), t);
      return col;
    }
  }
  return col;
}

void main(){
  vec2 p = (gl_FragCoord.xy * 2. - resolution) / min(resolution.x, resolution.y);
  vec2 uv = gl_FragCoord.xy / resolution;

  camera c = make_camera();
  // new seed every frame
  g_seed = random(gl_FragCoord.xy * (mod(time, 100.)));
  if(isnan(g_seed)){
    g_seed = 0.25;
  }


  // multisampling in veda
  // we use multipass, which does one pass (0) where we accumulate to a buffer (accum)
  // the second pass (1) takes the average of the accumulated values
  if(PASSINDEX == 0){
    ray r = camera_get_ray(c, uv);

    vec3 col = ray_color(r);

    // approximate gamma correction
    // col = sqrt(col);

    vec4 result = vec4(col,1.) + texture2D(accum, uv);
    if(result.a > MAX_FLOAT){
      result = vec4(result.xyz/result.a, 1.);
    }
    gl_FragColor = result;
  }

  if(PASSINDEX == 1){
    vec4 result = texture2D(accum, uv);

    gl_FragColor = vec4(result.xyz / result.a, 1.);
  }
}
