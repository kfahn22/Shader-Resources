// Ported to P5.js from the Art of Code YouTube star field tutorial
// by Martijn Steinrucken aka The Art of Code/BigWings - 2020
// YouTube: youtube.com/TheArtOfCodeIsCool

#ifdef GL_ES
precision mediump float;
#endif

// Pass in uniforms from the sketch.js file
uniform vec2 u_resolution; 
uniform float iTime;
uniform vec2 iMouse;
uniform float iFrame;

#define NUM_LAYERS 4.

mat2 Rot( float a) 
{
   float s = sin(a);
   float c = cos(a);
   return mat2(c, -s, s, c);
}


float Star(vec2 uv, float flare) {
     float d = length(uv);
    
    // Divide by d to get assymptotoic falloff
    float m = .05/d;
   
    // Make star shape
    float rays = max(0., 1. - abs(uv.x*uv.y*1000.));
    m += rays*flare;
    uv *= Rot(3.14159/4.);
    rays = max(0., 1. - abs(uv.x*uv.y*1000.));
    m += rays*flare*.3;
    
    
    // Cut out glow is faded out to edge of box
    m *= smoothstep(1., .2, d);
    return m;
}

 float Hash21(vec2 p)
 {
  p = fract(p*vec2(123.34, 456.21));
  p += dot(p, p+45.32);
  return fract(p.x*p.y);
 }
 
 vec3 StarLayer(vec2 uv)
 {
    vec3 col = vec3(0.);

    // Make boxes with (0,0) in middle
    vec2 gv = fract(uv) - 0.5;
    
    // Add Stars
    // Add id for boxes
    vec2 id = floor(uv);
    
    // Iterate through neighborhood of box to add contribution from neighbors
    for (int  y =-1; y <= 1; y++)
    {
      for (int x=-1; x <= 1; x++) 
      {
         vec2 offset = vec2(x,y);
         float n = Hash21(id+offset);  // random number between 0,1
         
         //  Make stars different sizes
         float size = fract(n*345.678);
         // Add by .5 to keep values between -.5, .5
         float star = Star(gv - offset - vec2(n, fract(n*34.)) +.5, smoothstep(.9, 1., size)*.3);
        vec3 color = sin(vec3(.2, .3, .9)*fract(n*2345.2)*19.)*.5+.5;
        color += color*vec3(.5, .01, 1.+size); // can filter out color by change R/G/B value to 0.
        
        // Add a twinkle
        star *= sin(iTime*3.+n*6.2831)*.5 + 1.;
        col += star*size*color;
      }
    }
    return col;
}
 
void main()
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = (gl_FragCoord.xy - .5*u_resolution.xy)/u_resolution.y;

    float t = iTime*.02;
    uv *= Rot(t);
    
    vec3 col = vec3(0.);
    
    for (float i=0.; i<1.; i += 1./NUM_LAYERS)
    {
        // Depth increases with time; if hits 1 get reset
        float depth = fract(i+t);
        float scale = mix(20., .5, depth);
        // Adjust so that repeat is not noticable
        float fade = depth*smoothstep(1., .9, depth);  // multiply by depth 0 in back
        col += StarLayer(uv*scale+i*453.)*fade; // add value so layers are shifted
    }
    //if (gv.x>.48 || gv.y>.48) col.r = 1.;
    //col.rg = id*.4;  Every box has a different color
    
    
    gl_FragColor = vec4(col,1.0);
}