// Ported from Live Coding Bending Light tutorial https://www.youtube.com/watch?v=0RWaR7zApEo
// by Martijn Steinrucken aka The Art of Code/BigWings - 2021


#ifdef GL_ES
precision mediump float;
#endif

#define MAX_STEPS 100
#define MAX_DIST 100.
#define SURF_DIST .001

#define S smoothstep
#define T iTime

uniform vec2 u_resolution; // This is passed in as a uniform from the sketch.js file
uniform float iTime;
uniform vec2 iMouse;
uniform sampler2D tex0;
uniform sampler2D tex1;
uniform sampler2D tex2;

mat2 Rot(float a) {
    float s=sin(a), c=cos(a);
    return mat2(c, -s, s, c);
}

float sdBox(vec3 p, vec3 s) {
    p = abs(p)-s;
	return length(max(p, 0.))+min(max(p.x, max(p.y, p.z)), 0.);
}


float GetDist(vec3 p) {
    
    p.xz *= Rot(iTime*.1);
    
    float d = sdBox(p, vec3(1));
    
    // Create rhombic dodecahedron
    // get angle
    float c = cos(3.1515/5.);
    float s = sqrt(0.75-c*c);
    
    vec3 n = vec3(-.5, -c, s);  //standard fold
    p = abs(p);
    p -= 2.*min(0., dot(p, n))*n;
    
    
    p.xy = abs(p.xy);
    p -= 2.*min(0., dot(p, n))*n;
     
    p.xy = abs(p.xy);
    p -= 2.*min(0., dot(p, n))*n;
    
    d = p.z-1.; // Make a plane (like a sheet of paper to fold)
    return d;
}


// Add side to RayMarch that can either be +1 or -1
float RayMarch(vec3 ro, vec3 rd, float side) {
	float dO=0.;
    
    for(int i=0; i<MAX_STEPS; i++) {
    	vec3 p = ro + rd*dO;
        float dS = GetDist(p)*side;
        dO += dS;
        if(dO>MAX_DIST || abs(dS)<SURF_DIST) break;
    }
    
    return dO;
}

vec3 GetNormal(vec3 p) {
	float d = GetDist(p);
    vec2 e = vec2(.01, 0); // adjust epsilon to get rid of hard edges
    
    vec3 n = d - vec3(
        GetDist(p-e.xyy),
        GetDist(p-e.yxy),
        GetDist(p-e.yyx));
    
    return normalize(n);
}

vec3 GetRayDir(vec2 uv, vec3 p, vec3 l, float z) {
    vec3 f = normalize(l-p),
        r = normalize(cross(vec3(0,1,0), f)),
        u = cross(f,r),
        c = f*z,
        i = c + uv.x*r + uv.y*u,
        d = normalize(i);
    return d;
}

void main()
{
     vec2 uv =  (2.0*gl_FragCoord.xy-u_resolution.xy)/u_resolution.y;
	vec2 m = iMouse.xy/u_resolution.xy;
   
    vec3 ro = vec3(0, 3, -3)*.7;
    ro.yz *= Rot(-m.y*3.14+1.);
    ro.xz *= Rot(-m.x*6.2831);
    
    vec3 rd = GetRayDir(uv, ro, vec3(0,0.,0), 1.);
    
  
    // Add a reflective surface
    uv = vec2(atan(rd.x, rd.z)/ 6.2832 , rd.y/3.) + .5;  // remap coordinates
    vec3 col = texture2D(tex0, uv).rgb;
   
   // vec3 col = texture2D(tex0, rd.xz).rgb;
   
    float d = RayMarch(ro, rd, 1.); // outside of object
    
    // Index of refraction
    float IOR = 1.45;  // 1.33 for water, diamonds 2.4
    
    
    if(d<MAX_DIST) {
        vec3 p = ro + rd * d;
        vec3 n = GetNormal(p);
        vec3 r = reflect(rd, n);
        vec3 refOutside = texture2D(tex0, r.xz).rgb;

        // refraction
        vec3 rdIn = refract(rd, n, 1./IOR); // ray dir when entering
        
        
        // Ray march on inside of object
        vec3 pEnter = p - n*SURF_DIST*3.;
        
        float dIn = RayMarch(pEnter, rdIn, -1.);
        
        
        vec3 pExit = pEnter + rdIn * dIn;  // 3D position of exit
  
        vec3 nExit = -GetNormal(pExit);
        
       
        vec3 refrTex = vec3(0);
        
        vec3 rdOut = vec3(0);
        
        // Add chromatic aberration
        float abb = .01;
        
        // red
        rdOut = refract(rdIn, nExit, IOR-abb);
        if (dot(rdOut, rdOut) == 0.) rdOut = reflect(rdIn, nExit);
        refrTex.r = texture2D(tex0, rdOut.xz).r;
     
        // green
        rdOut = refract(rdIn, nExit, IOR);
        if (dot(rdOut, rdOut) == 0.) rdOut = reflect(rdIn, nExit);
        refrTex.g = texture2D(tex0, rdOut.xz).g;
        
        // blue
        rdOut = refract(rdIn, nExit, IOR+abb);
        if (dot(rdOut, rdOut) == 0.) rdOut = reflect(rdIn, nExit);
        refrTex.b = texture2D(tex0, rdOut.xz).b; // reflacted teture
        
       float density = .1;
       // Add optimal distance
       float optDist =  exp(-dIn*density);
        
        //refrTex = refrTex*optDist*vec3(.8,.2,.7);  // can add color
        
        refrTex = refrTex*optDist;
        
        // Calculate a fresnel
        float fresnel = pow(1. + dot(rd, n), 5.);
        
        col = refrTex;
      
        col = mix(refrTex, refOutside, fresnel);
        //col = n*.5 + .5;  // added  for debugging
    }
    
    
    
    col = pow(col, vec3(.4545));	// gamma correction
    
    gl_FragColor = vec4(col,1.0);
}