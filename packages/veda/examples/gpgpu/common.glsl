precision highp float;
uniform int FRAMEINDEX;
uniform sampler2D velocityTexture;
uniform sampler2D positionTexture;
uniform vec2 resolution;
uniform vec2 mouse;
uniform vec3 mouseButtons;
uniform float time;

#define PI 3.14159
#define PI2 (PI * 2.)
