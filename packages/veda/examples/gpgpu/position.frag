#pragma glslify: import('./common.glsl')
const float SPEED = 0.03;

vec3 reset() {
    vec2 p = gl_FragCoord.st / resolution * 100.;
    float s =  sin(p.y * PI);
    float x =  cos(p.x * PI2 + p.y) * s;
    float y = -cos(p.y * PI + p.x);
    float z =  sin(p.x * PI2 + p.y) * s;
    return normalize(vec3(x, y, z)) * .3;
}

void main(){
    if (FRAMEINDEX == 0) {
        vec3 newPosition = reset();
        float power = 0.;
        gl_FragColor = vec4(newPosition, power);
    }
    else {
        vec2 uv = gl_FragCoord.xy / resolution;
        vec4 position = texture2D(positionTexture, uv);
        vec4 velocity = texture2D(velocityTexture, uv);

        float power = position.w * 0.95;

        bool move = mouseButtons.x > 0.;
        if (move) {
            power = 1.0;
        }

        vec3 newPosition = position.xyz + velocity.xyz * power * SPEED;
        gl_FragColor = vec4(newPosition, power);
    }
}
