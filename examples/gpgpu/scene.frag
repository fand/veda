/*{
  "pixelRatio": 1,
  "frameskip": 3,
  "vertexCount": 30000,
  "vertexMode": "POINTS",
  "PASSES": [
    {
      fs: "./velocity.frag",
      TARGET: "velocityTexture",
      TARGET_TYPE: 'f',
    },
    {
      fs: "./position.frag",
      TARGET: "positionTexture",
      TARGET_TYPE: 'f',
    },
    {
      "vs": "./scene.vert",
      TARGET: "sceneTexture",
    }
  ]
}*/

precision mediump float;
varying vec4 v_color;

void main(){
  gl_FragColor = v_color;
}
