// Ported to P5.js from the Inigo Quilez Happy Rainforest livestream
// Starting point for code https://www.shadertoy.com/view/4ttSWf

#ifdef GL_ES
precision mediump float;
#endif



// Pass in uniforms from the sketch.js file
uniform vec2 u_resolution; 
uniform float iTime;
uniform vec2 iMouse;
uniform float iFrame;


// Global variables
const vec3  kSunDir = vec3(-.48,0.48,-.25);
const float kMaxHeight = 120.0;

#define NUM_LAYERS 4.
#define LOWQUALITY
#define LOWQUALITY_SHADOWS
#define BG backgroundGradient
#define S smoothstep
#define PI 3.14159

// Define colors scheme
#define LTBROWN vec3(170, 124, 100)/255.
#define BROWN vec3(117,79,68)/255.
#define PINK vec3(255,146,194)/255.
#define YELLOW vec3(251,217,125)/255.
#define BLUE vec3(161,198,211)/255.
#define GREEN vec3(9,56,38)/255.
#define DARK vec3(8,9,10)/255.

// Function to add background color
vec3 backgroundGradient(vec2 uv, vec3 col1, vec3 col2, float m) {
  float k = uv.y*m + m;
  vec3 col = mix(col1, col2, k);
  return col;
}

mat2 Rot( float a) 
{
   float s = sin(a);
   float c = cos(a);
   return mat2(c, -s, s, c);
}

float N21( vec2 p) {
    return fract( sin(p.x*100. + p.y*6574.)*5674. );
}

// return smoothstep and its derivative
vec2 smoothstepd( float a, float b, float x)
{
	if( x<a ) return vec2( 0.0, 0.0 );
	if( x>b ) return vec2( 1.0, 0.0 );
    float ir = 1.0/(b-a);
    x = (x-a)*ir;
    return vec2( x*x*(3.0-2.0*x), 6.0*x*(1.0-x)*ir );
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
    float b = mix(bl, br, lv.x);
    
    
    float tl = N21(id + vec2(0,1));
    float tr = N21(id+vec2(1,1));
    float t = mix (tl, tr, lv.x);
    
    return mix(b, t, lv.y);
}
float hash1( vec2 p )
{
    p  = 50.0*fract( p*0.3183099 );
    return fract( p.x*p.y*(p.x+p.y) );
}

float hash1( float n )
{
    return fract( n*17.0*fract( n*0.3183099 ) );
}

vec2 hash2( vec2 p ) 
{
    const vec2 k = vec2( 0.3183099, 0.3678794 );
    float n = 111.0*p.x + 113.0*p.y;
    return fract(n*fract(k*n));
}


// value noise, and its analytical derivatives
vec4 noised( in vec3 x )
{
    vec3 p = floor(x);
    vec3 w = fract(x);
    #if 1
    vec3 u = w*w*w*(w*(w*6.0-15.0)+10.0);
    vec3 du = 30.0*w*w*(w*(w-2.0)+1.0);
    #else
    vec3 u = w*w*(3.0-2.0*w);
    vec3 du = 6.0*w*(1.0-w);
    #endif

    float n = p.x + 317.0*p.y + 157.0*p.z;
    
    float a = hash1(n+0.0);
    float b = hash1(n+1.0);
    float c = hash1(n+317.0);
    float d = hash1(n+318.0);
    float e = hash1(n+157.0);
	float f = hash1(n+158.0);
    float g = hash1(n+474.0);
    float h = hash1(n+475.0);

    float k0 =   a;
    float k1 =   b - a;
    float k2 =   c - a;
    float k3 =   e - a;
    float k4 =   a - b - c + d;
    float k5 =   a - c - e + g;
    float k6 =   a - b - e + f;
    float k7 = - a + b + c - d + e - f - g + h;

    return vec4( -1.0+2.0*(k0 + k1*u.x + k2*u.y + k3*u.z + k4*u.x*u.y + k5*u.y*u.z + k6*u.z*u.x + k7*u.x*u.y*u.z), 
                      2.0* du * vec3( k1 + k4*u.y + k6*u.z + k7*u.y*u.z,
                                      k2 + k5*u.z + k4*u.x + k7*u.z*u.x,
                                      k3 + k6*u.x + k5*u.y + k7*u.x*u.y ) );
}

float noise( in vec3 x )
{
    vec3 p = floor(x);
    vec3 w = fract(x);
    
    #if 1
    vec3 u = w*w*w*(w*(w*6.0-15.0)+10.0);
    #else
    vec3 u = w*w*(3.0-2.0*w);
    #endif
    


    float n = 111.0*p.x + 317.0*p.y + 157.0*p.z;
    
    float a = hash1(n+(  0.0+  0.0+  0.0));
    float b = hash1(n+(111.0+  0.0+  0.0));
    float c = hash1(n+(  0.0+317.0+  0.0));
    float d = hash1(n+(111.0+317.0+  0.0));
    float e = hash1(n+(  0.0+  0.0+157.0));
	float f = hash1(n+(111.0+  0.0+157.0));
    float g = hash1(n+(  0.0+317.0+157.0));
    float h = hash1(n+(111.0+317.0+157.0));

    float k0 =   a;
    float k1 =   b - a;
    float k2 =   c - a;
    float k3 =   e - a;
    float k4 =   a - b - c + d;
    float k5 =   a - c - e + g;
    float k6 =   a - b - e + f;
    float k7 = - a + b + c - d + e - f - g + h;

    return -1.0+2.0*(k0 + k1*u.x + k2*u.y + k3*u.z + k4*u.x*u.y + k5*u.y*u.z + k6*u.z*u.x + k7*u.x*u.y*u.z);
}

vec3 noised( in vec2 x )
{
    vec2 p = floor(x);
    vec2 w = fract(x);
    #if 1
    vec2 u = w*w*w*(w*(w*6.0-15.0)+10.0);
    vec2 du = 30.0*w*w*(w*(w-2.0)+1.0);
    #else
    vec2 u = w*w*(3.0-2.0*w);
    vec2 du = 6.0*w*(1.0-w);
    #endif
    
    float a = hash1(p+vec2(0,0));
    float b = hash1(p+vec2(1,0));
    float c = hash1(p+vec2(0,1));
    float d = hash1(p+vec2(1,1));

    float k0 = a;
    float k1 = b - a;
    float k2 = c - a;
    float k4 = a - b - c + d;

    return vec3( -1.0+2.0*(k0 + k1*u.x + k2*u.y + k4*u.x*u.y), 
                 2.0*du * vec2( k1 + k4*u.y,
                            k2 + k4*u.x ) );
}

float noise( in vec2 x )
{
    vec2 p = floor(x);
    vec2 w = fract(x);
    #if 1
    vec2 u = w*w*w*(w*(w*6.0-15.0)+10.0);
    #else
    vec2 u = w*w*(3.0-2.0*w);
    #endif

    float a = hash1(p+vec2(0,0));
    float b = hash1(p+vec2(1,0));
    float c = hash1(p+vec2(0,1));
    float d = hash1(p+vec2(1,1));
    
    return -1.0+2.0*(a + (b-a)*u.x + (c-a)*u.y + (a - b - c + d)*u.x*u.y);
}

// Rotation matrices (pythagorian triples)
const mat3 m3  = mat3( 0.00,  0.80,  0.60,
                      -0.80,  0.36, -0.48,
                      -0.60, -0.48,  0.64 );
const mat3 m3i = mat3( 0.00, -0.80, -0.60,
                       0.80,  0.36, -0.48,
                       0.60, -0.48,  0.64 );
const mat2 m2 = mat2(  0.80,  0.60,
                      -0.60,  0.80 );
const mat2 m2i = mat2( 0.80, -0.60,
                       0.60,  0.80 );

//------------------------------------------------------------------------------------------

float fbm_4( in vec2 x )
{
    float f = 1.9;
    float s = 0.55;
    float a = 0.0;
    float b = 0.5;
    for( int i=0; i<4; i++ )
    {
        float n = noise(x);
        a += b*n;
        b *= s;
        x = f*m2*x;
    }
	return a;
}

float fbm_4( in vec3 x )
{
    float f = 2.0;
    float s = 0.5;
    float a = 0.0;
    float b = 0.5;
    for( int i=0; i<4; i++ )
    {
        float n = noise(x);
        a += b*n;
        b *= s;
        x = f*m3*x;
    }
	return a;
}

float fbm_7( in vec2 x )
{
    float f = 1.92;
    float s = 0.5;
    float a = 0.0;
    float b = 0.5;
    vec3  d = vec3(0.0);
    mat3  m = mat3(1.0,0.0,0.0,
                   0.0,1.0,0.0,
                   0.0,0.0,1.0);
    for( int i=0; i<7; i++ )
    {
        float n =noise(x);
       // float n =  sin( PI/2. *x.y) + sin(PI/ 4. * x.y);
      
        a += b*n;          // accumulate values		
       // d += b*n;      // accumulate derivatives
        b *= s;
        x = f*m2*x;
      //  m = f*m3i*m;
    }
	return a;
}

vec4 fbmd_7( in vec3 x )
{
    float f = 1.92;
    float s = 0.5;
    float a = 0.0;
    float b = 0.5;
    vec3  d = vec3(0.0);
    mat3  m = mat3(1.0,0.0,0.0,
                   0.0,1.0,0.0,
                   0.0,0.0,1.0);
    for( int i=0; i<7; i++ )
    {
        vec4 n = noised(x);
        a += b*n.x;          // accumulate values		
        d += b*m*n.yzw;      // accumulate derivatives
        b *= s;
        x = f*m3*x;
        m = f*m3i*m;
    }
	return vec4( a, d );
}

vec4 fbmd_8( in vec3 x )
{
    float f = 2.0;
    float s = 0.65;
    float a = 0.0;
    float b = 0.5;
    vec3  d = vec3(0.0);
    mat3  m = mat3(1.0,0.0,0.0,
                   0.0,1.0,0.0,
                   0.0,0.0,1.0);
    for( int i=0; i<8; i++ )
    {
        vec4 n = noised(x);
        a += b*n.x;          // accumulate values		
        if( i<4 )
        d += b*m*n.yzw;      // accumulate derivatives
        b *= s;
        x = f*m3*x;
        m = f*m3i*m;
    }
	return vec4( a, d );
}

float fbm_9( in vec2 x )
{
    float f = 1.9;
    float s = 0.55;
    float a = 0.0;
    float b = 0.5;
    for( int i=0; i<9; i++ )
    {
        float n = noise(x);
        a += b*n;
        b *= s;
        x = f*m2*x;
    }
    
	return a;
}

// vec3 fbmd_9( in vec2 x )
// {
//     float f = 1.9;
//     float s = 0.55;
//     float a = 0.0;
//     float b = 0.5;
//     vec2  d = vec2(0.0);
//     mat2  m = mat2(1.0,0.0,0.0,1.0);
//     for( int i=0; i<9; i++ )
//     {
//         vec3 n = noised(x);
//         n.x = n.x;
        
//         a += b*n.x;          // accumulate values		
//         d += b*m*n.yz;       // accumulate derivatives
//         b *= s;
//         x = f*m2*x;
//         m = f*m2i*m;
//     }

// 	return vec3( a, d );
// }

float sdEllipsoid( vec3 p, vec3 r )
{
  float k0 = length(p/r);
  float k1 = length(p/(r*r));
  return k0*(k0-1.0)/k1;
}

// float opTwist( vec3 ell, in vec3 p )
// {
//     const float k = 10.0; // or some other amount
//     float c = cos(k*p.y);
//     float s = sin(k*p.y);
//     mat2  m = mat2(c,-s,s,c);
//     return  vec3(m*p.xz,p.y);
//     //return primitive(q);
// }

//combine so that they smoothly blend
float smin( in float a, in float b, float k)
{
 float h = max( k - abs(a-b), 0.0); // "spike" function look at grpahtoy
 return min(a,b) - h*h/(k*4.0);
}


vec2 terrainMap( in vec2 pos )
{
  
    const float sca = 0.0010;
    pos /= 1000.0;
    float e = 300.0*fbm_7( pos + vec2(1.0,-2.0) ); //fbm_9
    float a = 1.0-smoothstep( 0.12, 0.13, abs(e/300.0+0.12) ); // flag high-slope areas (-0.25, 0.0)
    e += 45.0*smoothstep( -24.0, -3.0, e );
    return vec2(e,a);
}

// vec4 terrainMapD( in vec2 p )
// {
// 	const float sca = 0.0010;
//     p *= sca;
//     vec3 e = 300.0*fbmd_9( p + vec2(1.0,-2.0) );
//     vec2 c = smoothstepd( -24.0, -3.0, e.x );
//     e += 45.0*vec3(c.x,c.y*e.yz);
//     e.yz *= sca;
//     return vec4( e.x, normalize( vec3(-e.y,1.0,-e.z) ) );
// }

vec3 terrainNormal( in vec2 pos )
{
// #if 1
//    return terrainMapD(pos).yzw;
// #else    
    vec2 e = vec2(0.03,0.0);
	return normalize( vec3(terrainMap(pos-e.xy).x - terrainMap(pos+e.xy).x,
                           2.0*e.x,
                           terrainMap(pos-e.yx).x - terrainMap(pos+e.yx).x ) );
//#endif    
}

float terrainShadow( in vec3 ro, in vec3 rd, in float mint )
{
    float res = 1.0;
    float t = mint;
#ifdef LOWQUALITY
    for( int i=0; i<32; i++ )
    {
        vec3  pos = ro + t*rd;
        vec2  env = terrainMap( pos.xz );
        float hei = pos.y - env.x;
        res = min( res, 32.0*hei/t );
        if( res<0.0001 || pos.y>kMaxHeight ) break;
        t += clamp( hei, 1.0+t*0.1, 50.0 );
    }
#else
    for( int i=0; i<128; i++ )
    {
        vec3  pos = ro + t*rd;
        vec2  env = terrainMap( pos.xz );
        float hei = pos.y - env.x;
        res = min( res, 32.0*hei/t );
        if( res<0.0001 || pos.y>kMaxHeight  ) break;
        t += clamp( hei, 0.5+t*0.05, 25.0 );
    }
#endif
    return clamp( res, 0.0, 1.0 );
}

vec2 raymarchTerrain( in vec3 ro, in vec3 rd, float tmin, float tmax )
{
    // bounding plane
    float tp = (kMaxHeight-ro.y)/rd.y;
    if( tp>0.0 ) tmax = min( tmax, tp );
    
    // raymarch
    float dis, th;
    float t2 = -1.0;
    float t = tmin; 
    float ot = t;
    float odis = 0.0;
    float odis2 = 0.0;
    for( int i=0; i<400; i++ )
    {
        th = 0.001*t;

        vec3  pos = ro + t*rd;
        vec2  env = terrainMap( pos.xz );
        float hei = env.x;

        // terrain
        dis = pos.y - hei;
        if( dis<th ) break;
        
        ot = t;
        odis = dis;
        t += dis*0.8*(1.0-0.75*env.y); // slow down in step areas
        if( t>tmax ) break;
    }

    if( t>tmax ) t = -1.0;
    else t = ot + (th-odis)*(t-ot)/(dis-odis); // linear interpolation for better accuracy
    
    return vec2(t,t2);
}

void main(  )
{
    // Normalized pixel coordinates (from 0 to 1)
    vec2 uv = (2.0*gl_FragCoord.xy - u_resolution.xy)/u_resolution.y;
    

  // adjust these parameters to bring shape further or nearer
  //float f = smoothstep(0.2, 0.3, length(p)*0.5 );
    // Time varying pixel color
  // vec3 col = vec3(f, f, f);


// add camera
//float an = iTime*0.01;
//float an = 0.0;  //center at origin to figure out where you are
float an = 10.0*iMouse.x/u_resolution.x;

// add target for camera
vec3 ta = vec3(0.0,0.85,0.0);

    // vec3 ro = vec3(0.0, -99.25, 3.0);
    // vec3 ta = vec3(0.0, -98.25, -45.0 + ro.z );
// ray marching  

// ro ray origin (camera position); adjust position of camera by changing the coefficient on cos(an)
// rd ray direction; second parameter depth of view cone (lens); 
//  p (-1, 1); negative because looking at origin
// adding ta move camera up
vec3 ro = ta + vec3(1.5*sin(an), 0.0, 1.5*cos(an));
//vec3 ro = ta + vec3( 1.5*iTime*0.56, 0.0, 1.5*iTime*0.15); 
  //vec3 ro = ta + vec3( 1.5*sin(iTime*0.15),0.0, -1.5*cos(iTime*0.15)); 
    // ro.x -= 40.0*sin(0.2*iTime);
    // ta.x -= 43.0*sin(0.2*iTime);

vec3 ww = normalize( ta - ro );
vec3 uu = normalize( cross(ww,vec3(0,1,0)) );
vec3 vv = normalize( cross(uu,ww) );

// x coordinate moves us on the u vector, y coordinate moves us on the v vector, depth is constant
// parameter * ww approximates length of lens
vec3 rd = normalize( vec3(uv.x*uu +uv.y*vv + 1.5*ww) );


// add sky color
// add gradient by subtracting off a proportonal amount of the y vector
  vec3 col = BG(uv, PINK, BLUE, .2) - 0.7*rd.y;
   // col = mix(col, vec3(1.), .8*SmoothNoise(uv)); // Add some clouds
   
   col = mix( col, YELLOW, exp(-3.0*rd.y) );
   float resT = 1000.0;
   const float tmax = 1000.0;
    int   obj = 0;
    vec2 t = raymarchTerrain( ro, rd, 15.0, tmax );
    if( t.x>0.0 )
    {
        resT = t.x;
        obj = 1;
    }
   if( obj>0 )
    {
        vec3 pos  = ro + resT*rd;
        
        vec3 epos = pos + vec3(0.0,2.4,0.0);

       float sha1  = terrainShadow( pos+vec3(0,0.01,0), kSunDir, 0.01 );;
       
        vec3 tnor = terrainNormal( pos.xz );
        vec3 nor;
        
        vec3 speC = vec3(1.0);
  
        //terrain
        
        if( obj==1 )
        {
            // bump map
            nor = normalize( tnor + 0.8*(1.0-abs(tnor.y))*0.8*fbmd_7( pos*0.3*vec3(1.0,0.2,1.0) ).yzw );

            //col = vec3(0.18,0.12,0.10)*.85;
            col = BROWN*.10;
            col = 1.0*mix( col, GREEN*0.1, S(0.7,0.9,nor.y) );    
            float dif = clamp( dot( nor, kSunDir), 0.0, 1.0 ); 
            dif *= sha1;
            #ifndef LOWQUALITY
            dif *= sha2;
            #endif

            float bac = clamp( dot(normalize(vec3(-kSunDir.x,0.0,-kSunDir.z)),nor), 0.0, 1.0 );
            float foc = clamp( (pos.y+120.0)/130.0, 0.0,1.0);
            float dom = clamp( 0.5 + 0.5*nor.y, 0.0, 1.0 );
            vec3  lin  = 1.0*0.2*mix(0.1*vec3(0.1,0.2,0.1),vec3(0.7,0.9,1.5)*3.0,dom)*foc;
                  lin += 1.0*8.5*vec3(1.0,0.9,0.8)*dif;   // add diffuse lighting     
                  lin += 1.0*0.27*vec3(1.1,1.0,0.9)*bac*foc;
            speC = vec3(4.0)*dif*smoothstep(20.0,0.0,abs(pos.y-10.0)-20.0);

            col *= lin;
        }
   }
 
    // camera correction; brights will become brighter;  important to do right from the beginning!!!
     col = pow( col, vec3(0.4545) );
    // Output to screen
    
   gl_FragColor = vec4(col,1.0);
}

