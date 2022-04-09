// Ported to P5.js from The Drive Home tutorial
// by Martijn Steinrucken aka The Art of Code/BigWings 
// https://www.youtube.com/watch?v=eKtsY7hYTPg
// https://www.shadertoy.com/view/MdfBRX


// Note:  the original code uses multiple loops that iterate from 0., 1. and increment by a fraction.
// This would not compile in p5.js, so I changed the interation paramenters.
// The original version is MUCH better--take a look at the version in shadertoy to compare.

#ifdef GL_ES
precision mediump float;
#endif

// Pass in uniforms from the sketch.js file
uniform vec2 u_resolution; 
uniform float iTime;
uniform vec2 iMouse;
uniform float iFrame;

#define S(a, b, t) smoothstep(a, b, t)

struct ray {
vec3 o, d;
};

// Create pseudo random number
float N(float t) {
   return fract(sin(t*3863.)*5081.);
}

// Create vec4 random numbers
vec4 N14(float t) {
   return fract( sin( t*vec4(409., 3593., 977., 9341.) ) * vec4(3863., 409., 727., 383.) );
}

// Set up camera
ray GetRay(vec2 uv, vec3 cameraPosition, vec3 lookat, float zoom) 
{  
// basis vectors
   ray a;
   a.o = cameraPosition;
   // world up vector vec3(0., 1., 0.)
   vec3 forward = normalize(lookat - cameraPosition);
   vec3 right = cross(vec3(0.,1.,0.), forward); // world up vector
   vec3 up = cross(forward, right);
   vec3 center = a.o + forward * zoom;
   vec3 intersection = center + uv.x*right + uv.y * up;
   a.d = normalize(intersection - a.o);
   return a;
}

vec3 ClosestPoint( ray r, vec3 p) 
{
   return r.o + max( 0., dot(p-r.o, r.d) )*r.d;  
}

float DistRay(ray r, vec3 p) 
{
   return length(p - ClosestPoint(r, p) );
}


// Out of focus highlights
float Bokeh(ray r, vec3 p, float size, float blur)
{
     // Dont want size of circles to change size as animate
     size *= length(p);  // length of p gives distance fo origin
     float d = DistRay(r, p);
     float c = S( size, size*(1.-blur), d );
     c *= mix(.7, 1., S(size*.8, size, d) ); // make outline a little brighter
     return c;
}

vec3 Streetlights( ray r, float t) 
{
    // Offset circles by using a step function
     float side = step(r.d.x, 0.);  // same as smoothstep, except not smooth
     // Take abs value to mirror image
     r.d.x = abs(r.d.x);
     float s = 0.1;//1./10.;
     float mask = 0.;
     
     //for (  float i = 0.; i < 1.; i ++ ) {//= s ) {
     for (  float i = 0.; i < 10.; i += 1. ) {//= s ) {
         float ti = fract(t+i+side*s*.5);
         // Use fract to cycle t between [0, 1]
         vec3 p = vec3(2., 2., 100. - ti*100.);

         // Add multiple headlines
         // Multiply by ti*ti*ti to fade out as animates
         mask += Bokeh(r, p, .05, .1)*ti*ti*ti;
     }
     return vec3(1., .7, .3)*mask;
     
}

vec3 Envlights( ray r, float t) 
{
    // Offset circles by using a step function
     float side = step(r.d.x, 0.);  // same as smoothstep, except not smooth
     // Take abs value to mirror image
     r.d.x = abs(r.d.x);
     float s = 0.1;//1./10.;
     
     vec3 c = vec3(0.);
     
    // for (  float i = 0.; i < 1.; i ++) { //= s ) {
     for (  float i = 0.; i < 10.; i += 1.) { //= s ) {
         float ti = fract(t+i+side*s*.5);
         // Use fract to cycle t between [0, 1]
         // Generate a random vector; use side to eliminate symmetry
         vec4 n = N14(i+side*100.);
         
         float fade = ti*ti*ti;
         
         float occlusion = sin(ti*6.28*10.*n.x)*0.5 +.5;
         fade = occlusion;
         
         float x = mix(2.5, 10., n.x);
         float y = mix(.1, 1.5, n.y);
         
         vec3 p = vec3(x, y, 50. - ti*50.);

         // Add multiple headlines
         // Multiply by ti*ti*ti to fade out as animates
         
         vec3 col = n.wzy;
         c += Bokeh(r, p, .05, .1)*fade*col*.5;
     }
     return c;
     
}

// Original code iterated from 0., 1. by 1./30. but this would not compile
vec3 Headlights( ray r, float t) 
{  
     t*=2.;
     // Create headline size
     float w1 =.25;
     float w2 =w1*1.2;
     //float s = 0.0333; //1./30.;
     float mask = 0.;
     
     for ( float i = 0.; i < 30.; i += 1.) { //= s ) {
         // Eliminate a random number of cars
         float n = N(i);
         if (n>.1) continue;
         // Use fract to cycle t between [0, 1]
         float ti = fract(t+i);         
    
         // Distance along the road
         float z = 100. - ti*100.;
         vec3 p = vec3( 2., 2., z );

         //fade out as move toward edge of screen
         float fade = ti*ti*ti*ti;
         
         // change focus as headlights move
         float focus = S(.9, 1., ti);
         
         // Adjust size of headlines
         float size = mix(.05, .03, focus);
         // Add two headlines
         // Multiply by ti*ti*ti to fade out as animates
         mask += Bokeh(r, vec3(-1.-w1, .15, z), size, .1)*fade;
         mask += Bokeh(r, vec3(-1.+w1, .15, z), size, .1)*fade;
         
         mask += Bokeh(r, vec3(-1.-w2, .15, z), size, .1)*fade;
         mask += Bokeh(r, vec3(-1.+w2, .15, z), size, .1)*fade;
         
         // Add reflection to road
         float ref = 0.;
         ref += Bokeh(r, vec3(-1.-w2, -.15, z), size*3., 1.)*fade;
         ref += Bokeh(r, vec3(-1.+w2, -.15, z), size*3., 1.)*fade;
         
         mask += ref*focus;
         
     }
     return vec3(.9, .9, 1.)*mask;  // change headlight color to white
     
}
 
vec3 Taillights( ray r, float t) 
{  
     t *= .25;
     // Create headline size
     float w1 =.25;
     float w2 =w1*1.2;
     float s = 0.0666; // 1./15.;
     float mask = 0.;
     
     for ( float i = 0.; i < 15.; i += 1.) { //= s ) {
         // Eliminate a random number of cars
         float n = N(i);  // [0,1]
         
         // n [0,.5] need to turn to either 0 or 1
         if (n>.5) continue;
         
         float lane = step(.25, n);
         
         // Use fract to cycle t between [0, 1]
         float ti = fract(t+i);         
    
         // Distance along the road
         float z = 100. - ti*100.;
        // vec3 p = vec3( 2., 2., z );

         //fade out as move toward edge of screen
         float fade = ti*ti*ti*ti*ti;
         
         // change focus as headlights move
         float focus = S(.9, 1., ti);
         
         // Adjust size of headlines
         float size = mix(.05, .03, focus);
         
         // Position of car on road; 0 middle of road
         // subtract lane get some cars in fast/slow lane
         // lane shift
         float laneshift = S(.99, .95, ti);
         float x = 1.5 - lane * laneshift;
         
         // Add blinkers for cars in left laneS(
         float blink = step( 0., sin(t*1000.) )*7.*lane*step(.96, ti);
         
         // Add two headlines
         // Multiply by ti*ti*ti to fade out as animates
         mask += Bokeh(r, vec3(x - w1, .15, z), size, .1)*fade;
         mask += Bokeh(r, vec3(x + w1, .15, z), size, .1)*fade;
         
         mask += Bokeh(r, vec3(x - w2, .15, z), size, .1)*fade;
         mask += Bokeh(r, vec3(x + w2, .15, z), size, .1)*fade*(1.+blink);
         
         // Add reflection to road
         float ref = 0.;
         ref += Bokeh(r, vec3( x - w2, -.15, z), size*3., 1.)*fade;
         ref += Bokeh(r, vec3( x + w2, -.15, z), size*3., 1.)*fade*(1.+blink*.1);
         
         mask += ref*focus;
         
     }
     return vec3(1., .1, .03)*mask;  // change headlight color to white
     
}

vec2 Rain( vec2 uv, float t ) 
{
   t *= 40.;
   
   // change aspect ratio
   vec2 a = vec2(3., 1.);
   
   // create boxes (keep range the same by subtracting .5)
   vec2 st = uv*a;
   
   // Need to offset so that drops always appear to be going down
   // adjust t so that st.y moves in line with the upward motion of drop
   // Offset so that rain drops fall randomly
   // Get id by taking the floor of st
   // 
   vec2 id = floor(st);
   st.y += t*.22;
   
   // Create psuedo random number
   float n = fract( sin(id.x*716.34)*768.34 );
   // Use random number to adjust drops so that they don't have grid pattern
   st.y += n;
   uv.y += n; 
   
   // Adjust so that drops not all in center of box ??
   float nx = fract( sin(id.y*716.34)*768.34 );
   //st.x += nx;
   //uv.x += n;
   st.y += fract( sin(id.x*716.34)*768.34 );
   id = floor(st); //recalculate id becasue we have shifted boxes
   st = fract(st) - .5;
   
   // Add in id.y to adjust rate at which drops are falling 
   // Multiply by 2 pi so don't fall in waves
   t += fract( sin(id.x*716.34 + id.y*1453.7)*768.34 )*6.283;
   // Animate so raindrops fall down screen
   // Want sawtooth wave (drops goes up slow and down faster)
   
   // Can experiment on Desmos or graphtoy to find right equation
   
   
   float y = -sin( t + sin(t + sin(t)*.5) )*.45;  // adjust because sin [-1,1] 
   vec2 p1 = vec2(0., y);
   
   // Create offset that is multi-directional
   // Where is uv in relationship to drop
   vec2 o1 =(st-p1)/a;
   float d = length((st-p1)/a); // divide st by aspect ratio so circles not stretched
   
   float m1 = S(.07, .0, d);
   
   // Add a bunch of stationary drops
   // multiply by vec(1., 2.) to create more dots
   // Unsquish by dividing fract( * ) by vec2(1.,2.) to undo distortion 
  
   vec2 o2 = (fract(uv*a.x*vec2(1.,2.))- .5) / vec2(1.,2.);
   d = length(o2);
    // Trail should only show above the main drop
   // Make a mask that is 1 above main dot and 0 below
   // scale drops so that drops get smaller 
   float m2 = S(.3*(.5 - st.y), .0, d)*S(-.1, .1, st.y-p1.y);;
   
   // debugging 
   // if (st.x>.46 || st.y > .49) m1 = 1.;  // add verticle & horizontal lines
  
   return vec2(m1*o1*30.+m2*o2*10.);
}

void main(  )
{
    // Normalized pixel coordinates (from 0 to 1)
    // Translate pixel coordinates so that (0,0) in center of screen 
    // Divide by iResolution.y to maintain aspect ratio
    vec2 uv = (gl_FragCoord.xy -.5*u_resolution.xy)/u_resolution.y;
   
    // Time varying pixel color
    //vec3 col = vec3(0);
    vec2 m = iMouse.xy/u_resolution.xy;
    
    float t = iTime*.05 + m.x;
    
    
    vec3 cameraPosition = vec3(.5, .2, 0.);
    vec3 lookat = vec3(.5, .2, 1.);
    
    // Add rain on windshield
    vec2 rainDistort = Rain(uv*5., t)*.5;
    
    rainDistort += Rain(uv*7., t)*.5;  // pick two number that don't 
    
    // Adjust uv.x, uv.y to add distortion from water on windshield
    uv.x += sin(uv.x*70.)*.005;
    uv.y += sin(uv.y*730.)*.003;
    
    ray r = GetRay(uv-rainDistort*.5, cameraPosition, lookat, 2.);
      
    vec3 col = Streetlights(r, t);
    col += Headlights(r,t);
    col += Taillights(r,t);
    col += Envlights(r,t);   
    
    // Add background color
    col += (r.d.y+.25)*vec3(.2,.1,.5);
    
    //col = vec3(rainDistort, 0.);
    
    // Output to screen
    gl_FragColor = vec4(col,1.0);
}