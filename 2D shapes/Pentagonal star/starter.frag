// Ported to P5.js from https://www.shadertoy.com/view/7lXXDn
// Pentagonal star using winding rules

#ifdef GL_ES
precision mediump float;
#endif

// Pass in uniforms from the sketch.js file
uniform vec2 u_resolution; 
uniform float iTime;

#define S smoothstep

const float PI = 3.1415926;

vec2 poly(float i, float N) {
    float a = (i * 2. + 0.5) * PI / N;
    return vec2(cos(a), sin(a));
}

float map(float value, float min1, float max1, float min2, float max2) {
  return mix(min2, max2, (value - min1) / (max1 - min1));
}

void main()
{
    vec2 uv = 3.*(gl_FragCoord.xy-0.5*u_resolution.xy)/u_resolution.y;
    vec3 col = vec3(0);
    
    float C = 0.;
    const float N = 5.;
    for (float i = 0.; i < N; i ++) {
        vec2 p0 = poly(i+0., N);
        vec2 p1 = poly(i+2., N);
        float px = map(uv.y, p0.y, p1.y, p0.x, p1.x);
        C += S(0., .05, px - uv.x) * sign(p0.y - p1.y);
    }
    
    col.rgb = vec3(S(-1./N, -1.5/N, C/N));
    
    gl_FragColor = vec4(col,1.0);
}
