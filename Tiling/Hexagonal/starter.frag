// Ported to P5.js from "RayMarching starting point" 
// by Martijn Steinrucken aka The Art of Code/BigWings - 2020
// The MIT License
// YouTube: youtube.com/TheArtOfCodeIsCool

#ifdef GL_ES
precision mediump float;
#endif

// Pass in uniforms from the sketch.js file
uniform vec2 u_resolution; 
uniform float iTime;
uniform vec2 iMouse;
uniform float iFrame;
uniform sampler2D tex0;

#define MAX_STEPS 100
#define MAX_DIST 100.
#define SURF_DIST .001

#define S smoothstep
#define T iTime


// Function to take r,g,b values to range 0,1
// Remember to input a float!
vec3 rgb( float r, float g, float b) 
{
   return vec3(r/ 255.0, g / 255.0, b / 255.0);
}

float N21( vec2 p) {
    return fract( sin(p.x*100. + p.y*6574.)*5674. );
}


float SmoothNoise(vec2 uv) {
   // lv goes from 0,1 inside each grid
   // check out interpolation for dummies
    vec2 lv = fract(uv);
   
   //vec2 lv = smoothstep(0., 1., fract(uv*10.));  // create grid of boxes 
    vec2 id = floor(uv); // find id of each of the boxes
     lv = lv*lv*(3.-2.*lv); 
    
    // get noise values for each of the corners
    // Use mix function to join together
    float bl = N21(id);
    float br = N21(id+vec2(1,0));
    float b = mix (bl, br, lv.x);
    
    
    float tl = N21(id + vec2(0,1));
    float tr = N21(id+vec2(1,1));
    float t = mix (tl, tr, lv.x);
    
    return mix(b, t, lv.y);
}

float SmoothNoise2 (vec2 uv) {
   float c = SmoothNoise(uv*4.);
     // Layer(or octave) of noise
    // Double frequency of noise; half the amplitude
    c += SmoothNoise(uv*8.)*.5;
    c += SmoothNoise(uv*16.)*.25;
    c += SmoothNoise(uv*32.)*.125;
    c += SmoothNoise(uv*64.)*.0625;
    
    return c/ 2.;  // have to normalize or could go past 1
  
}
mat2 Rot(float a) {
    float s=sin(a), c=cos(a);
    return mat2(c, -s, s, c);
}

float HexDist( vec2 p)
  {
   // take absolute value to get uvs in NE quadrant
   p = abs(p);
   float c = dot( p, normalize( vec2(1., 1.73) ) );
   c = max(c, p.x);
  
  return c;
}

// This functions returns uv coordinates and id of hexagon
vec4 HexCoords(vec2 uv)
  {
   // Make 2 square grids and then offset them so they fall on each others corners
    // Change to rectangle that encloses a hexagon
    vec2 r = vec2(1, 1.73);  // repeat rate
    vec2 h = r * .5;
    vec2 a = mod(uv, r) - h;
    vec2 b = mod(uv - h, r) - h;
  
    // Find id of hexagon
    vec2 gv;
    if ( length(a)<length(b) )
      gv = a;
    else
      gv = b;
  
    // distance to edge
    float x = atan(gv.x, gv.y); 
    float y = 0.5 - HexDist(gv);
    vec2 id = uv - gv;
  
    return vec4(x, y, id.x, id.y);
}

void main()
{
    vec2 uv = gl_FragCoord.xy/u_resolution.y;
	vec2 m = iMouse.xy/u_resolution.xy;
  
    vec3 texture0 = texture2D(tex0, uv).rgb;
  
    // Remap uvs after get texture or image will not be mapped properly
    uv = (gl_FragCoord.xy - .5*u_resolution.xy)/u_resolution.y;
    vec3 col = vec3(0);
  
    vec3 col1 = rgb(75., 104., 88.);
    vec3 col2 = rgb(255., 16., 83.);
    
      // Visualize hexagon
    //col += step(HexDist(uv), .2);
    // Visualize animated hexagonal pattern
    //col += sin( HexDist(uv)*10. + iTime );
   
    uv *= 10.; // increase number of hexagons by changing this 
  
    vec4 hc = HexCoords(uv);
  
    float c = smoothstep( .1, .03, hc.y);
  
    // Can add animation (doesn't work well with images)
    // float c = smoothstep( .05, .03, hc.y*sin(hc.z*hc.w+iTime) );
    //col += c*col1;

    // First variable will be background, second will be a grid overlay
    col = mix(col1, col2, c);
    //col = mix(col1, texture0, c);
    //col = mix(col1, texture0, c);
  
    //col.rg = HexCoords(uv).zw;  // Visualize id coordinates
  
    //col = pow(col, vec3(.4545));	// gamma correction
    
    gl_FragColor = vec4(col,1.0);
}