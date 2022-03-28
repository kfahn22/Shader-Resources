// Based on Shader Coding: Truchet Tiling Explained by The Art of Code
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

#define T iTime

// Function to take r,g,b values to range 0,1
// Remember to input a float!
vec3 rgb( float r, float g, float b) 
{
   return vec3(r/ 255.0, g / 255.0, b / 255.0);
}

float Hash21(vec2 p)
  {
  p = fract(p*vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x*p.y);
}

void main()
{
    vec2 uv = (gl_FragCoord.xy - .5*u_resolution.xy)/u_resolution.y;
	vec2 m = iMouse.xy/u_resolution.xy;

    vec3 col = vec3(0.);
    
    // create a bunch of grids (multiplication value determines # of grids)
    // Subtract .5 so that 0,0 stays in center of grid
    uv *= 10.;
    vec2 gv = fract(uv) - .5;
    vec2 id = floor(uv);
    
   // Get a random number between 0,1
    float n = Hash21(id);
  
    // Create a diagonal line by taking absolute value of  gradient 
    float width = .15;  // width of line
  
   //Randomly change direction of line
    if (n<.5) gv.x *= -1.;
  
  
   // Make an adjustment so that don't get notching
   // Subtract .5 to move the diagonal
    float d = abs( abs(gv.x + gv.y)- .5);
    float mask =  smoothstep( .01, -.01,d - width );
  
    col += mask;
    //col += n;
    
   //col.rg += id*.3;  // visualize id 
  
   // Draw an outline around the grid
   // if (gv.x > .48 || gv.y > .48) col = vec3(0,0,1);
   
    
    //col = pow(col, vec3(.4545));	// gamma correction
    
    gl_FragColor = vec4(col,1.0);
}