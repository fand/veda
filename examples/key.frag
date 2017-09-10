/*{
  "keyboard": true,
  "IMPORTED": {
    "font": { "PATH": "./images/font.png" },
  }
}*/
precision mediump float;
uniform float time;
uniform vec2 resolution;
uniform sampler2D key;
uniform sampler2D font;

void main() {
    vec2 uv = gl_FragCoord.xy / resolution;

    float code = 0.;

    if (texture2D(key, vec2(65. / 256.)).r > .0) { code = 65.; }
    if (texture2D(key, vec2(66. / 256.)).r > .0) { code = 66.; }
    if (texture2D(key, vec2(67. / 256.)).r > .0) { code = 67.; }
    if (texture2D(key, vec2(68. / 256.)).r > .0) { code = 68.; }
    if (texture2D(key, vec2(69. / 256.)).r > .0) { code = 69.; }
    if (texture2D(key, vec2(70. / 256.)).r > .0) { code = 70.; }
    if (texture2D(key, vec2(71. / 256.)).r > .0) { code = 71.; }
    if (texture2D(key, vec2(72. / 256.)).r > .0) { code = 72.; }
    if (texture2D(key, vec2(73. / 256.)).r > .0) { code = 73.; }
    if (texture2D(key, vec2(74. / 256.)).r > .0) { code = 74.; }
    if (texture2D(key, vec2(75. / 256.)).r > .0) { code = 75.; }
    if (texture2D(key, vec2(76. / 256.)).r > .0) { code = 76.; }
    if (texture2D(key, vec2(77. / 256.)).r > .0) { code = 77.; }
    if (texture2D(key, vec2(78. / 256.)).r > .0) { code = 78.; }
    if (texture2D(key, vec2(79. / 256.)).r > .0) { code = 79.; }
    if (texture2D(key, vec2(80. / 256.)).r > .0) { code = 80.; }
    if (texture2D(key, vec2(81. / 256.)).r > .0) { code = 81.; }
    if (texture2D(key, vec2(82. / 256.)).r > .0) { code = 82.; }
    if (texture2D(key, vec2(83. / 256.)).r > .0) { code = 83.; }
    if (texture2D(key, vec2(84. / 256.)).r > .0) { code = 84.; }
    if (texture2D(key, vec2(85. / 256.)).r > .0) { code = 85.; }
    if (texture2D(key, vec2(86. / 256.)).r > .0) { code = 86.; }
    if (texture2D(key, vec2(87. / 256.)).r > .0) { code = 87.; }
    if (texture2D(key, vec2(88. / 256.)).r > .0) { code = 88.; }
    if (texture2D(key, vec2(89. / 256.)).r > .0) { code = 89.; }

    float x = mod(code, 16.) / 16.;
    float y = 1. - ((floor(code / 16.) + 1.) / 16.);
    gl_FragColor = vec4(texture2D(font, vec2(x, y) + uv / 16.).r) * code;
}
