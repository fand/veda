/*{
    vertexCount: 1000,
    vertexMode: 'POINTS',
}*/
precision mediump float;
uniform sampler2D positionTexture;
uniform sampler2D velocityTexture;
uniform vec2 resolution;
attribute float vertexId;
uniform float vertexCount;
uniform float time;
const float pointSize = 3.0;
varying vec4 v_color;

const vec4 globalColor = vec4(0.3, 0.8, 1., .2);

void main(){
    vec2 uv = vec2(
        mod(vertexId, resolution.x) / resolution.x,
        floor(vertexId / resolution.x) / resolution.y
    );

    vec4 position = texture2D(positionTexture, uv);
    vec4 velocity = texture2D(velocityTexture, uv);

    gl_Position = vec4(position.xyz, 1);
    gl_PointSize = pointSize / max(length(velocity), 1.);

    v_color = globalColor;
    v_color *= length(velocity) *.4 + 1.;
}
