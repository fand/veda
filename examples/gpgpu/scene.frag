/*{
  "pixelRatio": 1,
  "frameskip": 1,
  "vertexCount": 30000,
  "vertexMode": "POINTS",
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
      "vs": "./scene.vert",
      TARGET: "sceneTexture",
    }
  ]
}*/

precision mediump float;
varying vec4 v_color;

void main(){
  gl_FragColor = v_color * .9;
}
