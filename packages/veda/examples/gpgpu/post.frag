/*{
  "pixelRatio": 1,
  "frameskip": 1,
  "vertexCount": 30000,
  "vertexMode": "POINTS",
  "glslify": true,
  "PASSES": [
    {
      fs: "./velocity.frag",
      TARGET: "velocityTexture",
      FLOAT: true,
    },
    {
      fs: "./position.frag",
      TARGET: "positionTexture",
      FLOAT: true,
    },
    {
      vs: "./scene.vert",
      fs: "./scene.frag",
      TARGET: "sceneTexture",
      BLEND: "ADD",
    },
    {}
  ]
}*/
precision mediump float;
uniform vec2 resolution;
uniform sampler2D sceneTexture;
uniform sampler2D backbuffer;

void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  gl_FragColor = texture2D(sceneTexture, uv);
  gl_FragColor += texture2D(backbuffer, (uv - .5) * .999 + .5) * .5;
}
