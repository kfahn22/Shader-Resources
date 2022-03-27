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

#define SURF_DIST .001

// Global variables
const int MAX_MARCHING_STEPS = 255;
const float MIN_DIST = 0.0;
const float MAX_DIST = 20.0;
const float epsilon = 0.0001;
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

float sdBox(vec3 p, vec3 s) {
    p = abs(p)-s;
	return length(max(p, 0.))+min(max(p.x, max(p.y, p.z)), 0.);
}


float GetDist(vec3 p) {
    float d = sdBox(p, vec3(1)); 
    return d;
}

float RayMarch(vec3 ro, vec3 rd) {
	float dO=0.;
    
    for(int i=0; i<MAX_STEPS; i++) {
    	vec3 p = ro + rd*dO;
        float dS = GetDist(p);
        dO += dS;
        if(dO>MAX_DIST || abs(dS)<SURF_DIST) break;
    }
    
    return dO;
}

vec3 GetNormal(vec3 p) {
	float d = GetDist(p);
    vec2 e = vec2(.001, 0);
    
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

// Ray marching algorithm adjusted from Inigo Quilez
float castRay( in vec3 ro, vec3 rd, float start, float end) 
{
 float t = start;
  
 for ( int i = 0; i < 255; i ++ )
 {
   vec3 pos = ro + t*rd;
   
   float h = sdBox( pos, vec3(.75) );
  
   if ( h<0.001 ) 
      return t;
   t += h;
   if ( t > end ) break;
 }
  return end;
}

// Lighting function from Jamie Wong
vec3 phongContribForLight(vec3 k_d, vec3 k_s, float alpha, vec3 p, vec3 eye,
                          vec3 lightPos, vec3 lightIntensity) {
    
    vec3 N = GetNormal(p); //Normal
    vec3 L = normalize(lightPos - p);  // Light direction
    vec3 V = normalize(eye - p);  // View direction
    vec3 R = normalize(reflect(-L, N));  // Reflect direction
    
    float dotLN = dot(L, N);
    float dotRV = dot(R, V);
    
    if (dotLN < 0.0) {
        // Light not visible from this point on the surface
        return vec3(0.0, 0.0, 0.0);
    } 
    
    if (dotRV < 0.0) {
        // Light reflection in opposite direction as viewer, apply only diffuse
        // component
        return lightIntensity * (k_d * dotLN);
    }
    return lightIntensity * (k_d * dotLN + k_s * pow(dotRV, alpha));
}

// Lighting function from Jamie Wong
vec3 phongIllumination(vec3 k_a, vec3 k_d, vec3 k_s, float alpha, vec3 p, vec3 eye) {
    const vec3 ambientLight = 0.65 * vec3(1.0, 1.0, 1.0);
    vec3 color = ambientLight * k_a;
    float an = 0.005 * iFrame;
    vec3 light1Pos = vec3(4.0 * sin(an),
                          2.0,
                          4.0 * cos(an) );

    vec3 light1Intensity = vec3(0.4, 0.4, 0.4);
    
    color += phongContribForLight(k_d, k_s, alpha, p, eye,
                                  light1Pos,
                                  light1Intensity);
    
     vec3 light2Pos = vec3(2.0 * sin(0.37),
                          2.0 * cos(0.37),
                          2.0);
  
    vec3 light2Intensity = vec3(0.2, 0.2, 0.2);
    
    color += phongContribForLight(k_d, k_s, alpha, p, eye,
                                  light2Pos,
                                  light2Intensity);    
    return color;
}

// Render the mandelbulb
void main() {
  
  // Normalized pixel coordinates (from 0 to 1)
    vec2 uv=  (2.0*gl_FragCoord.xy-u_resolution.xy)/u_resolution.y;
    vec2 m = iMouse.xy/u_resolution.xy;

    vec3 ro = vec3(0, 3, -3);
    ro.yz *= Rot(-m.y*3.14+1.);
    ro.xz *= Rot(-m.x*6.2831);
  
    vec3 rd = GetRayDir(uv, ro, vec3(0,0.,0), 1.);
    vec3 color = vec3(0);
   
    float d = RayMarch(ro, rd);
    vec3 p;
  
   // Define colors
    vec3 col1 = rgb(55., 18., 60.);  //purple
    vec3 col2 = rgb(184., 23. ,90.);  // red
    vec3 col3 = rgb(200., 121. , 255.); //violet
    
    // Ray march
    if (d > MAX_DIST - epsilon) {
        // Didn't hit anything
        gl_FragColor = vec4(0.0,0.0,0.0, 0.0);
		return;
    }
      
  if( d<MAX_DIST ) {
        p = ro + rd * d;
        vec3 n = GetNormal(p);
        vec3 r = reflect(rd, n);

        float dif = dot(n, normalize(vec3(1,2,3)))*.5+.5;
        color = vec3(dif);
    }
  
    vec3 K_a = col1;  // Ambient color -- change RGB values here
    vec3 K_d = vec3(0.4, 0.4, 0.4);  // Diffuse Color
    vec3 K_s = vec3(0.3, 0.3, 0.3);  // Specular color
    float shininess = 5.0;
    
    color = phongIllumination(K_a, K_d, K_s, shininess, p, ro);
 
    color = pow(color, vec3(.4545));	// gamma correction
    gl_FragColor = vec4(color,1.0); // R,G,B,A
}

