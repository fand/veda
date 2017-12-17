/*{
  sound: "LOOP",
  soundLength: 300,
  // soundLength: 0.9,
  // soundLength: 0.45,
  // soundLength: 0.22,
}*/
precision mediump float;

// srtuss, 2014
// quick and dirty 303 emulation (sort of) aswell as as some percussion and some other noise

// most of the code and the values in it are just experimental. i'll tidy it up soon.

// number of synthesized harmonics (tune for quality/preformance)
#define NSPC 256

#define pi2 6.283185307179586476925286766559

// cheap and unrealistic distortion
float dist(float s, float d)
{
  return clamp(s * d, -1.0, 1.0);
}
vec2 dist(vec2 s, float d)
{
  return clamp(s * d, -1.0, 1.0);
}

// quantize
float quan(float s, float c)
{
  return floor(s / c) * c;
}

// a resonant lowpass filter's frequency response
float _filter(float h, float cut, float res)
{
  cut -= 20.0;
  float df = max(h - cut, 0.0), df2 = abs(h - cut);
  return exp(-0.005 * df * df) * 0.5 + exp(df2 * df2 * -0.1) * 2.2;
}

// randomize
float nse(float x)
{
  return fract(sin(x * 110.082) * 19871.8972);
  //return fract(sin(x * 110.082) * 13485.8372);
}
float nse_slide(float x)
{
  float fl = floor(x);
  return mix(nse(fl), nse(fl + 1.0), smoothstep(0.0, 1.0, fract(x)));
}

// note number to frequency
float ntof(float n)
{
  return 440.0 * pow(2.0, (n - 69.0) / 12.0);
}

// tb303 core
vec2 synth(float tseq, float t)
{
  vec2 v = vec2(0.0);

  float tnote = fract(tseq);
  float dr = 0.26;
  float amp = smoothstep(0.05, 0.0, abs(tnote - dr - 0.05) - dr) * exp(tnote * -1.0);
  float seqn = nse(floor(tseq));
  //float seqn = nse_slide(tseq);
  float n = 20.0 + floor(seqn * 38.0);//50.0 + floor(time * 2.0);
  float f = ntof(n);

  float sqr = smoothstep(0.0, 0.01, abs(mod(t * 9.0, 64.0) - 20.0) - 20.0);

  float base = f;//50.0 + sin(sin(t * 0.1) * t) * 20.0;
  float flt = exp(tnote * -1.5) * 50.0 + pow(cos(t * 1.0) * 0.5 + 0.5, 4.0) * 80.0 - 0.0;
  for(int i = 0; i < NSPC; i ++)
  {
    float h = float(i + 1);
    float inten = 1.0 / h;
    //inten *= sin((pow(h, sin(t) * 0.5 + 0.5) + t * 0.5) * pi2) * 0.9 + 0.1;

    inten = mix(inten, inten * mod(h, 2.0), sqr);

    inten *= exp(-1.0 * max(2.0 - h, 0.0));// + exp(abs(h - flt) * -2.0) * 8.0;

    inten *= _filter(h, flt, 4.0);


    v.x += inten * sin((pi2 + 0.01) * (t * base * h));
    v.y += inten * sin(pi2 * (t * base * h));
  }


  float o = v.x * amp;//exp(max(tnote - 0.3, 0.0) * -5.0);

  //o = dist(o, 2.5);

  return vec2(dist(v * amp, 2.0));
}

// heavy 909-ish bassdrum
float kick(float tb, float time)
{
  tb = fract(tb / 4.0) * 0.5;
  float aa = 5.0;
  tb = sqrt(tb * aa) / aa;

  float amp = exp(max(tb - 0.15, 0.0) * -10.0);
  float v = sin(tb * 100.0 * pi2) * amp;
  v = dist(v, 4.0) * amp;
  v += nse(quan(tb, 0.001)) * nse(quan(tb, 0.00001)) * exp(tb * -20.0) * 2.5;
  return v;
}

// bad 909-ish open hihat
float hat(float tb)
{
  tb = fract(tb / 4.0) * 0.5;
  float aa = 4.0;
  //tb = sqrt(tb * aa) / aa;
  return nse(sin(tb * 4000.0) * 0.0001) * smoothstep(0.0, 0.01, tb - 0.25) * exp(tb * -5.0);
}

float gate1(float t)
{
  #define stp 0.0625
  float v;
  v = abs(t - 0.00 - 0.015) - 0.015;
  v = min(v, abs(t - stp*1. - 0.015) - 0.015);
  v = min(v, abs(t - stp*2. - 0.015) - 0.015);
  v = min(v, abs(t - stp*4. - 0.015) - 0.015);
  v = min(v, abs(t - stp*6. - 0.015) - 0.015);
  v = min(v, abs(t - stp*8. - 0.05) - 0.05);
  v = min(v, abs(t - stp*11. - 0.05) - 0.05);
  v = min(v, abs(t - stp*14. - 0.05) - 0.05);

  return smoothstep(0.001, 0.0, v);
}

vec2 synth2(float time)
{
  float tb = mod(time * 9.0, 16.0) / 16.0;

  float f = time * pi2 * ntof(87.0 - 12.0 + mod(tb, 4.0));
  float v = dist(sin(f + sin(f * 0.5)), 5.0) * gate1(tb);

  return vec2(v);
}

vec2 synth2_echo(float time, float tb)
{
  vec2 mx;
  mx = synth2(time) * 0.5;// + synth2(time) * 0.5;
  float ec = 0.3, fb = 0.6, et = 3.0 / 9.0, tm = 2.0 / 9.0;
  mx += synth2(time - et) * ec * vec2(1.0, 0.2); ec *= fb; et += tm;
  mx += synth2(time - et) * ec * vec2(0.2, 1.0); ec *= fb; et += tm;
  mx += synth2(time - et) * ec * vec2(1.0, 0.2); ec *= fb; et += tm;
  mx += synth2(time - et) * ec * vec2(0.2, 1.0); ec *= fb; et += tm;
  return mx;
}

// oldschool explosion sound fx
float expl(float tb)
{
  //tb = fract(tb / 4.0) * 0.5;
  float aa = 20.0;
  tb = sqrt(tb * aa) / aa;

  float amp = exp(max(tb - 0.15, 0.0) * -10.0);
  float v = nse(quan(mod(tb, 0.1), 0.0001));
  v = dist(v, 4.0) * amp;
  return v;
}

vec2 synth1_echo(float tb, float time)
{
  vec2 v;
  v = synth(tb, time) * 0.5;// + synth2(time) * 0.5;
  float ec = 0.4, fb = 0.6, et = 2.0 / 9.0, tm = 2.0 / 9.0;
  v += synth(tb, time - et) * ec * vec2(1.0, 0.5); ec *= fb; et += tm;
  v += synth(tb, time - et).yx * ec * vec2(0.5, 1.0); ec *= fb; et += tm;
  v += synth(tb, time - et) * ec * vec2(1.0, 0.5); ec *= fb; et += tm;
  v += synth(tb, time - et).yx * ec * vec2(0.5, 1.0); ec *= fb; et += tm;

  return v;
}

vec2 mainSound(float time)
{
  vec2 mx = vec2(0.0);

  float tb = mod(time * 9.0, 16.0);


  mx = synth1_echo(tb, time) * 0.8 * smoothstep(0.0, 0.01, abs(mod(time * 9.0, 256.0) + 8.0 - 128.0) - 8.0);

  float hi = 1.0;
  float ki = smoothstep(0.01, 0.0, abs(mod(time * 9.0, 256.0) - 64.0 - 128.0) - 64.0);
  float s2i = 1.0 - smoothstep(0.01, 0.0, abs(mod(time * 9.0, 256.0) - 64.0 - 128.0) - 64.0);
  hi = ki;

  mx += expl(mod(time * 9.0, 64.0) / 4.5) * 0.4 * s2i;

  mx += vec2(hat(tb) * 1.5) * hi;

  //mx += dist(fract(tb / 16.0) * sin(ntof(77.0 - 36.0) * pi2 * time), 8.0) * 0.2;
  //mx += expl(tb) * 0.5;

  mx += vec2(synth2_echo(time, tb)) * 0.2 * s2i;

  mx = mix(mx, mx * (1.0 - fract(tb / 4.0) * 0.5), ki);
  float sc = sin(pi2 * tb) * 0.4 + 0.6;
  float k = kick(tb, time) * 0.8 * sc * ki;// - kick(tb, time - 0.004) * 0.5 - kick(tb, time - 0.008) * 0.25);

  mx += vec2(k);
  mx = dist(mx, 1.00);

  vec2 s = vec2(mx);

  // AM Effect
  // s *= sin(time *3000.);

  // Stutter Effect
  // s *= step(.5, 1. - fract(time * 1.11 * 8.));

  // Distortion Effect
  // s *= clamp(s * 2., -1., 1.);

  return s;
}
