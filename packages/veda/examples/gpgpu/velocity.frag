#include "./common.glsl"

void main(){
    if (FRAMEINDEX == 0) {
        gl_FragColor = vec4(0);
        return;
    }

    vec2 uv = gl_FragCoord.xy / resolution;
    vec4 position = texture2D(positionTexture, uv);
    vec4 velocity = texture2D(velocityTexture, uv);

    vec3 newVelocity = velocity.xyz;

    bool move = mouseButtons.x > 0.;
    if (move) {
        float c = cos(time * 0.25) * 0.25;
        vec3 p = normalize(vec3(mouse * 2. - 1., c) - position.xyz);
        newVelocity += p * 0.3;
        newVelocity *= 1. / length(newVelocity);
        newVelocity.xy += (uv - .5) * .1;
    }

    gl_FragColor = vec4(newVelocity, 0.0);
}
