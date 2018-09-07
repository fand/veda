/*{
    "pixelRatio": 0.5,
    "vertexCount": 500,
    "vertexMode": "TRIANGLES",
    "PASSES": [{
        "TARGET": "renderBuffer",
        "vs": "./particle.vert",
    }, {
    }],
}*/
precision mediump float;
uniform float time;
uniform vec2 resolution;
uniform int	PASSINDEX;
uniform sampler2D renderBuffer;
uniform sampler2D backbuffer;
varying vec4 v_color;

// Util functions copied from http://glslsandbox.com/e#43153.1
mat2 mm2(in float a){float c = cos(a), s = sin(a);return mat2(c,s,-s,c);}
mat2 m2 = mat2(0.95534, 0.29552, -0.29552, 0.95534);
float tri(in float x){return clamp(abs(fract(x)-.5),0.01,0.49);}
vec2 tri2(in vec2 p){return vec2(tri(p.x)+tri(p.y),tri(p.y+tri(p.x)));}

float triNoise2d(in vec2 p, float spd)
{
  float z=1.8;
  float z2=2.5;
  float rz = 0.;
  p *= mm2(p.x*0.06);
  vec2 bp = p;
  for (float i=0.; i<5.; i++ )
  {
    vec2 dg = tri2(bp*1.85)*.75;
    dg *= mm2(time*spd);
    p -= dg/z2;

    bp *= 1.3;
    z2 *= .45;
    z *= .42;
    p *= 1.21 + (rz-1.0)*.02;

    rz += tri(p.x+tri(p.y))*z;
    p*= -m2;
  }
  return clamp(1./pow(rz*29., 1.3),0.,.55);
}

void main() {
    vec2 uv = gl_FragCoord.xy / resolution;
    float t = mod(time * .0003, 10.);

    gl_FragColor = texture2D(renderBuffer, uv);
    if (gl_FragColor.a > 0.01) {
        gl_FragColor.r *= triNoise2d(uv * 1.3, t) * 10.1;
        gl_FragColor.g *= triNoise2d(uv * 1.9, t) * 10.2;
        gl_FragColor.b *= triNoise2d(uv * 1.9, t) * 10.3;
        gl_FragColor *= vec4(1,.1,.3,1);
    }
    else {
      gl_FragColor = vec4(0,1,1,1);
    }
}
