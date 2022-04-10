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

// The Art of Code Feathers in the Wind YouTube tutorial

#define S smoothstep
 // can adjust the speed of the animation by changing 
#define T (iTime*.5) 

// Rotation Matrix
mat2 Rot(float a)
{ 
float s = sin(a), c = cos(a);
return mat2(c, -s, s, c);
}

float Feather( vec2 pos)
{  float d = length(pos - vec2(0,clamp(pos.y, -.3,.3)));
float r = mix(.1, .01, S(-.3, .3, pos.y) );  // values go from -.5,.5
   // teardrop shaped mask
   float m = S(.01, .0, d - r);  // first parameter blurriness factor
   
   
    float side = sign(pos.x);
   
   // substract by .5 to get origin in middle
   // take abs value to mirror
   // subtract by thickness 
   // divide by r to normalize
   float x = .9*abs(pos.x)/r;
   
   
   float wave = (1.-x)*sqrt(x) + x *(1.- sqrt(1.-x) );
   
   // multiply (pos.y + p.x)* number of lines;
   float y = (pos.y - wave*.2)*80.+side*56.; // side makes feather assymetrical
   
   
   // take floor to get id
   float id = floor(y + 20.);
   float n = fract(sin(id*564.32)*763.) ;  // randomize color
   
   float shade = mix(.5, 1., n);
   float strandLength = mix(.7, 1., fract(n*34.) );
   // strands
   float strand = S(.4, .0, abs(fract(y) -.5) - .3);  
   strand *= S(.1,-.2, x-strandLength);  
   
   // multiply by mask to get shape
   
   d = length(pos - vec2(0,clamp(pos.y, -.45, .1) ) );
   float stem = S(.01, .0, d + pos.y*.025);
   return max(strand*m*shade,stem);
}

vec3 Transform(vec3 pos, float angle) 
{  
  pos.xz *= Rot(angle);
  pos.xy *= Rot(angle*.7);
  
  return pos;
 
}

vec4 FeatherBall( vec3 ro, vec3 rd, vec3 pos, float angle)
{
   vec4 col = vec4(0.);
   float t = dot(pos - ro, rd);
   vec3 eye = ro + rd*t;
   float y = length(pos - eye);
   
   // Ray marching
   if (y < 1.) 
   {  
      float x = sqrt(1. - y);  // adust for size of feather
      // Front intersection
      // subtract off position of sphere to remap to object coordinates
      vec3 pF = ro + rd *(t-x) - pos;  // front intersection
      pF = Transform(pF, angle);
      
      // add polar coordinates to. wrap feather around sphere
      //cyclindical projection
      // [-pi, pi] in x direction &  [-1,1 in y direction
      vec2 uvF = vec2(atan(pF.x, pF.z), pF.y);  
      uvF *= vec2(.25, .5);  // makes the feather bigger
      float f = Feather(uvF);
      // tweek the alpha separately
      vec4 front = vec4(vec3(f), S(0., .1, f)); // adjustment so don't see back from front
      
      
     // Back intersection
      vec3 pB = ro + rd * (t+x) - pos;  // back intersection
      pB = Transform(pB, angle);
      vec2 uvB = vec2(atan(pB.x, pB.z), pB.y);  //cyclindical projection
      uvB *= vec2(.25, 0.5);  // makes the feather bigger
      
      float b = Feather(uvB);
      vec4 back = vec4(vec3(b), S(0., .1, b));
      
      col = mix(back, front, front.a);   // additive blend, use alpha so doesn't look blown out  
      return col;
   }
}
void main()
{
   // Normalized pixel coordinates (from 0 to 1)
   vec2 uv = (gl_FragCoord.xy -.5*u_resolution.xy)/u_resolution.y;
   
   
   // add a mouse
   vec2 M = iMouse.xy/u_resolution.xy - .5; 
   
   // Add background color with gradient
   vec3 bg = vec3(.1, .2, .8)*(uv.y +.5);
   bg += vec3(.7, .4, .1)*(-uv.y+.5);
   vec4 col = vec4(bg, 0.);
    
   // Rotate the feathers
   // uv -= vec2(0.-.45);  //rotate around bottom of stem
   // float d = length(uv);
   // uv *= Rot(sin(iTime)*d); // rotate at different rates 
    //uv += vec2(0.-.45);  // shift back to same position
   // uv * = Rot(iTime);  

   // col += Feather(uv);
 
   vec3 ro = vec3(0,0,-3);
   vec3 rd = normalize(vec3(uv, 1));
   
   // Create multiple feathers; divisor in the += term determines # of feathers
   // use 1./50. so that i goes from [0,1]
   for (float i = 0.; i < 1.; i += 1./50.)
   {  
       // move the feathers across screen
       // need to scale appropriately
       // can add M.x to x and M.y to y to adjust with mouse
       float x = mix( -8., 8., fract(i+T*.1) );
       // randomize the y position
       float y = mix( -2., 2., fract(sin(i*564.3)*4570.3) );
       // render objects from back to front
       float z = mix(5., 0., i);
       float a = T+i*563.34;
       
       // Create the feather instance
       vec4 feather = FeatherBall(ro, rd, vec3(x, y, z), a);
       
       // Blend the feather color into background color
       // so that feathers in distance fade
       feather.rgb = mix(bg, feather.rgb, mix(.3, 1., i) );
       
       // Take square root to get less contrast
       // Squaring it will give more contrast
       feather.rgb  = sqrt(feather.rgb);
       col = mix(col, feather, feather.a);
   }
   
   col = pow(col, vec4(.4545)); // gamma correction before you adjust color
   
    // Output to screen
    gl_FragColor = col;
}