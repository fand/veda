precision highp float;
uniform int FRAMEINDEX;
uniform sampler2D velocityTexture;
uniform sampler2D positionTexture;
uniform vec2 resolution;
uniform vec2 mouse;
uniform float time;

void main(){
    if (FRAMEINDEX == 0) {
        gl_FragColor = vec4(0);
        return;
    }

    vec2 uv = gl_FragCoord.xy / resolution;
    vec4 position = texture2D(positionTexture, uv);
    vec4 velocity = texture2D(velocityTexture, uv);

    vec3 newVelocity = velocity.xyz;

    float c = cos(time * 0.25) * 0.25;
    vec3 p = normalize(vec3(mouse * 2. - 1., c) - position.xyz);
    newVelocity += p * 0.3;

    newVelocity += uv.x * 0.1 - 0.05;

    newVelocity = clamp(newVelocity, -2., 2.);
    gl_FragColor = vec4(newVelocity, 0.0);
}
