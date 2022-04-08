//Based on Space gif livestream tutorial by The Art of Code
  
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution; // This is passed in as a uniform from the sketch.js file
uniform float iFrame;
uniform float iTime;

#define S smoothstep
#define T iFrame*.01
#define BLUE vec3(9,12,155)/255.
#define GREEN vec3(190,238,98)/255.;

// Both 0 or 1, returns 0, both different returns 1
float Xor(float a, float b) {
  return a*(1.-b) + b*(1.-a);
}

float ran( vec2 pos )
{
 // take floor to get id
   float id = floor(pos.y + 20.);
   return fract(sin(id*564.32)*763.) ;  // randomize color
}

void main()
{

    // Normalized pixel values [0,1]
    // Adjust pixel coordinates so that (0,0) in center of screen 
    // Divide by iResolution.y to maintain aspect ratio
    vec2 uv = (gl_FragCoord.xy-.5*u_resolution.xy)/u_resolution.y;

    // Define base color
     vec3 col = BLUE;

    // This is dividing the screen horizontally
    //vec3 col = vec3(.01*ran(uv), mix(.1, ran(uv), .8), mix(.7, .1*ran(uv), .2));
    
    // Rotate the effect 
    // If use sin(T), cos(T) it spins
    // If you use  sin(T) / cos(T) will zoom in and out as it turns
    float a = .7853;
    
    float s = sin(a);
    float c = cos(a);
    uv *= mat2(c, -s, s, c) ;
    
    // Scaling *= by fraction [0,1] makes bigger, 
    // Scaling *= by whole number makes smaller
    uv *= 15.;
    
    // Create boxes
    // Enclose in fract so that uv stay in range of [0,1] when multiply by 5
    // Fract(uv*5. ) -- within each box coordinates [0,1]
    // Subtract .5 to that (0,0) stays in middle of box
    vec2 gv = fract( uv )- .5;
    // Make an id for each box
    vec2 id = floor( uv);
    
    // draw circle in each box
    // float d = length(gv);
    float m = 0.;
    float t = T*1.;
    
    // Allow radius of circles to vary so that they can overlap
    // Each circle has to account for its neightbors so use double loop
    for (float y = -1.; y <= 1.; y++)
    {
      for (float x = -1.; x <= 1.; x++)
      {
         vec2 offset = vec2(x, y);
         // Without offset creates repeating diamond pattern
         float d = length(gv + offset); 
         
         // Take the distance from the box to the center
         // Use id to scale the boxes float dist = length(id)*.3;
         float dist = length(id - offset)*.3;
         
         // Animate using iTime and sin function
         // Since sin has range [-1,1] multiply by .5  and +.5
         // Make animation a function of distance to center of screen
         // Can change the direction of the animation by changing to sin(t+dist)
         float r = mix(.3, 1.5, sin(dist-t)*.5 +.5 );  // 
         
         // m value count of number of circles over lapping it
         // If use Xor  values will ossilate between on/off
         // Got basket-like effect when used += instead of =
         // parameter multiplied by top smoothstep value determines blurriness
         m = Xor(m, S(r, r*.9, d) );
      }
    }
    
    float k = mod(m, 2.); // Use modulo with 2 so that only the odd number of circles show
    vec3 col1 = GREEN;  // Define the second color
    col = mix(col, col1, k);

    gl_FragColor = vec4(col,1.0);
}