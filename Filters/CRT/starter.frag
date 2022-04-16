// Ported to P5.js from https://www.shadertoy.com/view/tssSzM
// Old CRT screen emulation

#ifdef GL_ES
precision mediump float;
#endif

// Pass in uniforms from the sketch.js file
uniform vec2 u_resolution; 
uniform float iTime;
uniform vec2 iMouse;
uniform float iFrame;
uniform sampler2D tex0;

// Post-processing shader aiming to emulate old CRT screens
// The goal wasn't to be as realistic as possible but to
// simply have a good-looking shader which is optimised for SPEED

// MIT License (c) 

#define PI 3.14159265359

// Emulated CRT resolution
#define FAKE_RES (u_resolution.xy/6.0) // initally set at 6.

// ------ PARAMETERS ------
vec2 fishEye = vec2(-0.03,-0.05); // Fish-eye warp factor
float crtOutIntensity = 1.1; // intensity of crt cell outline
float crtInIntensity = 0.9; // intensity of crt cell inside
float scanIntensity = 1.1; // intensity of scanlines
float aberrationIntensity = 1.5; // Intensity of chromatic aberration
int monochromeAberrations = 0;
float grainIntensity = 0.3; // Intensity of film grain // .3
float haloRadius = 1.8; // Radius of the ellipsis halo
float blurIntensity = 0.4; // Intensity of the radial blur
float scratchesIntensity = 3.; // Intensity of screen scratches
// ------------------------


vec3 surface(vec2 uv) {
	return texture2D(tex0, uv).rgb;
}

// Fish-eye effect
vec2 fisheye(vec2 uv){
  //uv = uv*2.0 - 1.0;   
  uv = 1.0 - uv*2.0 ; 
  uv *= vec2(1.0+(uv.y*uv.y)*fishEye.x,1.0+(uv.x*uv.x)*fishEye.y);
  return uv*0.5 + 0.5;
}

// Scanlines chromatic aberration
vec3 aberration(vec2 uv) {
    float o = sin(uv.y * u_resolution.x * PI);
    o *= aberrationIntensity / u_resolution.x;
    vec3 newVec = vec3(surface(vec2( uv.x+o, uv.y+o )).x, surface(vec2( uv.x, uv.y+o )).y, surface(vec2( uv.x+o, uv.y )).z);
    if (monochromeAberrations > 0) {
        newVec = newVec / 3.0
            + vec3(surface(vec2( uv.x, uv.y+o )).x, surface(vec2( uv.x+o, uv.y+o )).y, surface(vec2( uv.x+o, uv.y )).z) / 3.0
            + vec3(surface(vec2( uv.x+o, uv.y )).x, surface(vec2( uv.x+o, uv.y )).y, surface(vec2( uv.x+o, uv.y+o )).z) / 3.0;
    }
    return newVec;
}

// Draw smoothed scanlines
float scanLines(vec2 uv){
  float dy = uv.y * FAKE_RES.y;
  dy = fract(dy) - 0.5;
  return exp2(-dy*dy*scanIntensity);
}

// CRT cells
vec3 crt(vec2 xy){
  xy=floor(xy*vec2(1.0,0.5));
  xy.x += xy.y*5.0; // 3.0
  vec3 c = vec3(crtOutIntensity,crtOutIntensity,crtOutIntensity);
  xy.x = fract(xy.x/6.0); // 6.0
    
  if(xy.x < 0.333)
      c.r=crtInIntensity;
  else if(xy.x < 0.666)
      c.g=crtInIntensity;
  else 
      c.b=crtInIntensity;
  return c;
}    

// from rez in Glenz vector form Hell
float rand(in vec2 p,in float t) {
	return fract(sin(dot(p+mod(t,1.0),vec2(12.9898,78.2333)))*43758.5453);
}

// Film grain
float grain(vec2 uv) {
    return 1.0-grainIntensity+grainIntensity*rand(uv,iTime);
}

// Halo
float halo(vec2 uv) {    
    return haloRadius-distance(uv,vec2(0.2,0.5))-distance(uv,vec2(0.8,0.5));
}

// Screen scratches
vec3 screenstuff(vec2 uv) {
	float c = 0.5*texture2D(tex0,uv).r + 0.3*texture2D(tex0,uv*5.0).r + 0.2*texture2D(tex0,uv/2.0).r;
    c = (max(c, 0.78)-0.78)*scratchesIntensity;
    return vec3(smoothstep(0.,1.,c));
}

// Radial blur
vec3 blur(vec2 uv) {
    vec3 col = vec3(0.0,0.0,0.0);
    vec2 d = (vec2(0.5,0.5)-uv)/32.;
    float w = 1.0;
    vec2 s = uv;
    for( int i=0; i<32; i++ )
    {
        vec3 res = surface(vec2(s.x,s.y));
        col += w*smoothstep( 0.0, 1.0, res );
        w *= .985;
        s += d;
    }
    col = col * 4.5 / 32.;
	return blurIntensity*vec3( 0.2*col + 0.8*surface(uv));
}

void main( ){
    vec2 uv = fisheye(gl_FragCoord.xy/u_resolution.xy);
    vec3 col  = aberration(uv) + screenstuff(uv) + blur(uv);
    col  *= scanLines(uv) * crt(gl_FragCoord.xy) * grain(uv) * halo(uv) * 0.6;
    gl_FragColor = vec4(col, 1.);
}


