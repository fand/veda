attribute float vertexId;
uniform float vertexCount;

void main(){
  vec2 uv = vec2(vertexId / vertexCount, 0);
  gl_Position = vec4(uv, 0, 1.0);
}
