// Ported to P5.js from Living Coding:  Making the American flag with math!
// From the Art of Code

#ifdef GL_ES
precision mediump float;
#endif

// Pass in uniforms from the sketch.js file
uniform vec2 u_resolution; 
uniform float iTime;

#define S smoothstep
#define WHITE vec3(1)
#define BLUE vec3(60,59,110)/255.
#define RED vec3(178,34,52)/255.


float Star(vec2 uv, float size) {
  // "Folding screen"
   uv.x = abs(uv.x);
  
   float a = 6.2832/5.;
   float d1 = dot (uv, vec2( sin(a), cos(a) ) );
  
   a = 3.*6.2832/5.;
   float d2 = dot (uv, vec2( sin(a), cos(a) ) );
   //col += S( 0.001, -0.001, max(d1,d2) -size);
  
   a = 2.*6.2832/5.;
   float d3 = dot (uv, vec2( sin(a), cos(a) ) );
   float d = min(max(d1,d2), max(uv.y, d3));
  
    
    return S( 0.001, -0.001, d-size);
}

// Remap from global uv space to local uv space (where stars are)
vec2 Remap(vec2 p, float b, float l, float t, float r) {
 return vec2( (p.x-l) / (r-l), (p.y-b) / (t-b) );
}

vec3 Flag(vec2 uv) {
    // MS uses fwidth to fix pixelation issue; getting error when trying to use it
    // Constrain to be square wave that goes from [0,1];
    // Everywhere sin wave above. 0 band is red, below will be white
    float y = sin(uv.y*3.14159*13.);
    //float w = fwidth(y);
    float stripes = S(-.01, .01, y);
 
    vec3 col = mix(WHITE, RED, stripes);
  
    // Find remapped uvs to draw stars
    vec2 st = Remap(uv, .46, 0., 1., .4);
    
    // Draw outside grid of stars
    float size = .07;
    if (st.x>0. && st.x < 1. && st.y>0. && st.y<1.) {
     
       vec2 gridUV = fract(st*vec2(6,5) ) - .5;
       col = mix(BLUE,
                 WHITE,
                 Star(gridUV, size));
       
       vec2 st = Remap(st, .0+.1, .0833, .8+.1, .833+.0833); // adjust of offset starts
      // Draw inside grid of stars
       if (st.x>0. && st.x < 1. && st.y>0. && st.y<1.) {
         vec2 gridUV = fract(st*vec2(5,4) ) - .5;
         col = mix(col, WHITE, Star(gridUV, size)); 
       }
   }
  // Use smoothstep to make adjustment so that stripes don't repeat vertically
  return col *= S(.0001, .0, abs(uv.y - .5) - .5); 
}

void main()
{
    vec2 uv = gl_FragCoord.xy/u_resolution.xy;
	
    // Add animation of flag waving using sin function
    float t = uv.x*7. - 2.*iTime+uv.y*3.;
    uv.y += sin(t)*.05;
    vec3 col = Flag(uv);
    
    // Add shading by taking derivation of sin
    col *= .7 + cos(t)*.3; 
 
  gl_FragColor = vec4(col,1.0);
}
