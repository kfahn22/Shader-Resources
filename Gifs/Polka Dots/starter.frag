// Ported to P5.js from https://www.shadertoy.com/view/XldXRN

#ifdef GL_ES
precision mediump float;
#endif

// Pass in uniforms from the sketch.js file
uniform vec2 u_resolution; 
uniform float iTime;
uniform vec2 iMouse;
uniform float iFrame;
uniform sampler2D tex0;

void main( )
{
    vec2 U = gl_FragCoord.xy;
    vec2 R = u_resolution.xy;
	U = ( U+U - R ) /R.y * 8.;  

    float Pi = 3.14159265359,
           t = 16.*iTime,  // iDate.w cause streching bug on some machines (AMD+windows?)
           e = 35./R.y, v;
  //       a = Pi/3.*floor(t/2./Pi);
  //U *= mat2(cos(a),-sin(a), sin(a), cos(a));              
    U *= mat2(sin(Pi/3.*ceil(t/2./Pi) + Pi*vec4(.5,1,0,.5)));      // animation ( switch dir )
    
  	U.y /= .866; 
    U -= .5;   
    v = ceil(U.y);
    U.x += .5*v;                                                   // hexagonal tiling
  //U.x += sin(t) > 0. ? (.5-.5*cos(t)) * (2.*mod(v,2.)-1.) : 0.;  
    U.x += sin(t) > 0. ? (1.-cos(t)) * (mod(v,2.)-.5) : 0.;        // animation ( scissor )
  //U.x += (1.-cos(t/2.)) * (mod(v,2.)-.5);                        // variant
    
    U = 2.*fract(U)-1.;                                            // dots
    U.y *= .866;
    vec3 col = vec3(0.);
	col  += smoothstep(e,-e, length(U)-.6) - col;
  
    gl_FragColor = vec4(col, 1.);
}

