precision highp float;
uniform int FRAMEINDEX;
uniform sampler2D velocityTexture;
uniform sampler2D positionTexture;
uniform sampler2D key;
uniform vec2 resolution;
uniform vec2 mouse;
uniform float time;
const float SPEED = 0.06;

const float PI = 3.1415926;
const float PI2 = PI * 2.0;

vec3 reset() {
    vec2 p = gl_FragCoord.st / resolution;
    float s =  sin(p.y * 10.23 * PI + time);
    float x =  cos(p.x * 10.33 * PI2 + time) * s;
    float y = -cos(p.y * 10.51 * PI + time * p.x);
    float z =  sin(p.x * 10.72 * PI2 + time) * s;
    return normalize(vec3(x, y, z)) * .7;
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

        bool move = true;//fract(time) < .6;

        float power = position.w * 0.6;
        if (move) {
            power = 0.5;
        }

        vec3 newPosition = position.xyz + velocity.xyz * power * SPEED;
        newPosition = clamp(newPosition, -1., 1.);

        gl_FragColor = vec4(newPosition, power);
    }
}
