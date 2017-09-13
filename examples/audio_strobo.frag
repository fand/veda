/*{ "audio": true, "pixelRatio": 6}*/
// Epylepsy Warning! Coded while listening: The Knife - Silent Shout
precision mediump float;
uniform vec2 resolution;
uniform sampler2D texture;
uniform sampler2D spectrum;
uniform sampler2D samples;
uniform float volume;
uniform float time;

 void main( void )
{
    vec2 p = gl_FragCoord.xy / resolution.xy;
    float freq = texture2D(spectrum, vec2(p.x, .5)).r;
    float wave = texture2D(samples, vec2(p.x, .5)).r;

    float b1 = sin(time/100.)+2. - step(sin(time+volume*.01)*.5, abs(volume / 255. - p.y));

    vec2 q = p - vec2((freq/12.) + sin(b1),0.7);
    float vol = abs(volume * 11.6);
    vec3 bg_color_up = vec3(vol*.01,freq,wave);
    vec3 col = mix( bg_color_up, bg_color_up-vec3(sin(time),.1,-.1), sqrt(p.y) );

    float r = 0.5+ 0.1*cos( atan(q.y,q.x)*10. + 20.0*q.x*(vol*0.001) + 1.0);
    col *= smoothstep( r, r+0.01, length( q ) );

    r = 0.015*(vol*0.01);
    r += 0.002*sin(120.0*q.y)*(vol*0.001);
    r += exp(-40.0*p.y)*(vol*0.001);
    col *= 1.0 - (1.0-smoothstep(r,r+0.002, abs(q.x-0.25*sin(2.0*q.y))))*(1.0-smoothstep(0.0,0.1,q.y));
    gl_FragColor = vec4(col,1.0);
}
