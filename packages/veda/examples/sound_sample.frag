/*{
  soundLength: 3.7,
  IMPORTED: {
    amen: { PATH: './sounds/break.wav' },
  }
}*/
precision mediump float;
uniform sampler2D amen;
uniform sampler2D image1;

vec2 mainSound(float t) {
  vec2 s;
  s = loadSound(amen, mod(t, 1.85));
  // s = loadSound(amen, mod(t, 1.85 / 2.));
  // s = loadSound(amen, mod(t, 1.85 / 16.));

  // Bit Crusher
  // s = floor(s * 8.) / 8.;

  return s;
}
