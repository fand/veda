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
#define MAX_RECURSION 5
#define PI 3.1415926535897932385
#define TAU 2. * PI
// Φ = Golden Ratio
#define PHI 1.61803398874989484820459


float g_seed = 0.25;

float deg2rad(float deg){
  return deg*PI / 180.;
}

// random number generator

//https://stackoverflow.com/a/34276128
bool isnan(float x){
  return !(x > 0. || x < 0. || x == 0.);
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

vec3 random_unit(float seed){
    vec2 rand = random2(seed);
    float a = rand.x * TAU;
    float z = (2. * rand.y) - 1.;
    float r = sqrt(1. - z*z);
    return vec3(r*cos(a), r*sin(a), z);
}


// ray primitive

struct ray{
  vec3 o, dir;
};

vec3 ray_at(ray r, float t){
  return r.o + r.dir*t;
}

struct hit{
  vec3 n,p;
  float t;
  bool front_face;
};


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


// intersections

struct sphere{
  vec3 center;
  float radius;
};

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

  rec = hit(n,p,t, front_face);
  return true;
}


// raytracing

bool raycast(const in ray r, vec2 t_min_max, inout hit h){
  sphere s = sphere(vec3(0,0,-2.), 1.);
  sphere pl = sphere(vec3(0.,-201, -2.), 200.);

  bool is_hit = false;
  is_hit = hit_sphere(pl, r, t_min_max, h) || is_hit;
  is_hit = hit_sphere(s, r, t_min_max, h) || is_hit;
  return is_hit;
}

vec3 ray_color(ray r){
  vec2 t_min_max = vec2(0.001, MAX_FLOAT);
  hit h;
  vec3 col = vec3(1.);

// #define debug_normal
#ifdef debug_normal
  if(raycast(r, t_min_max, h)){
    return .5 * (h.n + vec3(1.));
  }
#else

  for(int i=0; i < MAX_RECURSION; i++){
    bool is_hit = raycast(r, t_min_max, h);
    if(is_hit){
      vec3 jitter = random_unit(g_seed);
      if(isnan(jitter.r) || isnan(jitter.g) || isnan(jitter.b)){
        jitter = vec3(0.);
      }

      col *= 0.5;
      vec3 target = (h.p + h.n + jitter);
      r.o = h.p;
      r.dir = normalize(target - h.p);
    }else{

      vec3 unit_dir = normalize(r.dir);
      float t = 0.5 * (unit_dir.y + 1.0);
      col *= mix(vec3(1.0), vec3(0.5,0.7,1.0), t);
      return col;
    }
  }
  return col;
#endif
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

  // anti aliasing
  vec2 jitter = (2. * random2(g_seed)) - 1.;
  vec2 st = uv + jitter * 0.001;
  // check for NaN leakage
  if(isnan(st.x) || isnan(st.y)){
    st = uv;
  }

  // multisampling in veda
  // we use multipass, which does one pass (0) where we accumulate to a buffer (accum)
  // the second pass (1) takes the average of the accumulated values
  if(PASSINDEX == 0){
    ray r = camera_get_ray(c, st);

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
