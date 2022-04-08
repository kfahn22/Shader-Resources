## Simple diamond shape

` uv.y = abs(uv.y);
    vec3 col = vec3(0);
    float a = 3.14159/ 4.;
    float d1 = dot(uv, vec2(sin(a), cos(a)));
    float d2= dot(uv, vec2(-sin(a), cos(a)));
    float offset = 0.35;
    col += S(-.001,.001, max(d1,d2) - offset);`

## Rhombus adapted slightly from Inigo Quilez  
`//Rhombus - exact   (https://www.shadertoy.com/view/XdXcRB)

float ndot(vec2 a, vec2 b ) { return a.x*b.x - a.y*b.y; }
float sdRhombus( in vec2 p, in vec2 b ) 
{
    p = abs(p);
    float h = clamp( ndot(b-2.0*p,b)/dot(b,b), -1.0, 1.0 );
    float d = length( p-0.5*b*vec2(1.0-h,1.0+h) );
    return d * sign( p.x*b.y + p.y*b.x - b.x*b.y );
}`

## Trapezoid adapted slightly from Inigo Quilez
`float sdTrapezoid( in vec2 p, in float r1, float r2, float he )
{
    vec2 k1 = vec2(r2,he);
    vec2 k2 = vec2(r2-r1,2.0*he);
    p.x = abs(p.x);
    vec2 ca = vec2(p.x-min(p.x,(p.y<0.0)?r1:r2), abs(p.y)-he);
    vec2 cb = p - k1 + k2*clamp( dot(k1-p,k2)/dot(k2,k2), 0.0, 1.0 );
    float s = (cb.x<0.0 && ca.y<0.0) ? -1.0 : 1.0;
    return s*sqrt( min(dot(ca,ca),dot(cb,cb)) );
}`

## Cross

`float sdBox( in vec2 p, in vec2 b )
{
    vec2 d = abs(p)-b;
    return length(max(d,0.0)) + min(max(d.x,d.y),0.0);
}
float d1 = sdBox(uv, vec2(.065, .4));
float d2 = sdBox(vec2(uv.x , uv.y - .15), vec2(.25, .065));
col += S(-.001,.001, min(d1,d2));`

## All from Iqilezles.org

## Circle - exact   (https://www.shadertoy.com/view/3ltSW2)
`float sdCircle( vec2 p, float r )
{
    return length(p) - r;
}`

## Isosceles Triangle - exact   (https://www.shadertoy.com/view/MldcD7)

`float sdTriangleIsosceles( in vec2 p, in vec2 q )
{
    p.x = abs(p.x);
    vec2 a = p - q*clamp( dot(p,q)/dot(q,q), 0.0, 1.0 );
    vec2 b = p - q*vec2( clamp( p.x/q.x, 0.0, 1.0 ), 1.0 );
    float s = -sign( q.y );
    vec2 d = min( vec2( dot(a,a), s*(p.x*q.y-p.y*q.x) ),
                  vec2( dot(b,b), s*(p.y-q.y)  ));
    return -sqrt(d.x)*sign(d.y);
}`

## Regular Star - exact   (https://www.shadertoy.com/view/3tSGDy)

`float sdStar(in vec2 p, in float r, in int n, in float m)
{
    // next 4 lines can be precomputed for a given shape
    float an = 3.141593/float(n);
    float en = 3.141593/m;  // m is between 2 and n
    vec2  acs = vec2(cos(an),sin(an));
    vec2  ecs = vec2(cos(en),sin(en)); // ecs=vec2(0,1) for regular polygon

    float bn = mod(atan(p.x,p.y),2.0*an) - an;
    p = length(p)*vec2(cos(bn),abs(sin(bn)));
    p -= r*acs;
    p += ecs*clamp( -dot(p,ecs), 0.0, r*acs.y/ecs.y);
    return length(p)*sign(p.x);
}`


## Simple Egg - exact   (https://www.shadertoy.com/view/XtVfRW)

`float sdEgg( in vec2 p, in float ra, in float rb )
{
    const float k = sqrt(3.0);
    p.x = abs(p.x);
    float r = ra - rb;
    return ((p.y<0.0)       ? length(vec2(p.x,  p.y    )) - r :
            (k*(p.x+r)<p.y) ? length(vec2(p.x,  p.y-k*r)) :
                              length(vec2(p.x+r,p.y    )) - 2.0*r) - rb;
}`

## Vesica - exact   (https://www.shadertoy.com/view/XtVfRW)

`float sdVesica(vec2 p, float r, float d)
{
    p = abs(p);
    float b = sqrt(r*r-d*d);
    return ((p.y-b)*d>p.x*b) ? length(p-vec2(0.0,b))
                             : length(p-vec2(-d,0.0))-r;
}`

## Pie - exact   (https://www.shadertoy.com/view/3l23RK)

`float sdPie( in vec2 p, in vec2 c, in float r )
{
    p.x = abs(p.x);
    float l = length(p) - r;
    float m = length(p-c*clamp(dot(p,c),0.0,r)); // c=sin/cos of aperture
    return max(l,m*sign(c.y*p.x-c.x*p.y));
}`

## Regular Star - exact   (https://www.shadertoy.com/view/3tSGDy)

`float sdStar(in vec2 p, in float r, in int n, in float m)
{
    // next 4 lines can be precomputed for a given shape
    float an = 3.141593/float(n);
    float en = 3.141593/m;  // m is between 2 and n
    vec2  acs = vec2(cos(an),sin(an));
    vec2  ecs = vec2(cos(en),sin(en)); // ecs=vec2(0,1) for regular polygon

    float bn = mod(atan(p.x,p.y),2.0*an) - an;
    p = length(p)*vec2(cos(bn),abs(sin(bn)));
    p -= r*acs;
    p += ecs*clamp( -dot(p,ecs), 0.0, r*acs.y/ecs.y);
    return length(p)*sign(p.x);
}`

## Equilateral Triangle - exact   (https://www.shadertoy.com/view/Xl2yDW)

`float sdEquilateralTriangle( in vec2 p )
{
    const float k = sqrt(3.0);
    p.x = abs(p.x) - 1.0;
    p.y = p.y + 1.0/k;
    if( p.x+k*p.y>0.0 ) p = vec2(p.x-k*p.y,-k*p.x-p.y)/2.0;
    p.x -= clamp( p.x, -2.0, 0.0 );
    return -length(p)*sign(p.y);
}`

## Isosceles Triangle - exact   (https://www.shadertoy.com/view/MldcD7)

`float sdTriangleIsosceles( in vec2 p, in vec2 q )
{
    p.x = abs(p.x);
    vec2 a = p - q*clamp( dot(p,q)/dot(q,q), 0.0, 1.0 );
    vec2 b = p - q*vec2( clamp( p.x/q.x, 0.0, 1.0 ), 1.0 );
    float s = -sign( q.y );
    vec2 d = min( vec2( dot(a,a), s*(p.x*q.y-p.y*q.x) ),
                  vec2( dot(b,b), s*(p.y-q.y)  ));
    return -sqrt(d.x)*sign(d.y);
}`

## Triangle - exact   (https://www.shadertoy.com/view/XsXSz4)

`float sdTriangle( in vec2 p, in vec2 p0, in vec2 p1, in vec2 p2 )
{
    vec2 e0 = p1-p0, e1 = p2-p1, e2 = p0-p2;
    vec2 v0 = p -p0, v1 = p -p1, v2 = p -p2;
    vec2 pq0 = v0 - e0*clamp( dot(v0,e0)/dot(e0,e0), 0.0, 1.0 );
    vec2 pq1 = v1 - e1*clamp( dot(v1,e1)/dot(e1,e1), 0.0, 1.0 );
    vec2 pq2 = v2 - e2*clamp( dot(v2,e2)/dot(e2,e2), 0.0, 1.0 );
    float s = sign( e0.x*e2.y - e0.y*e2.x );
    vec2 d = min(min(vec2(dot(pq0,pq0), s*(v0.x*e0.y-v0.y*e0.x)),
                     vec2(dot(pq1,pq1), s*(v1.x*e1.y-v1.y*e1.x))),
                     vec2(dot(pq2,pq2), s*(v2.x*e2.y-v2.y*e2.x)));
    return -sqrt(d.x)*sign(d.y);
}`

float sdFish( in vec2 p) {
   float offset = .10;
        float angle = 3.14159/2.;
        float d1 = sdTrapezoid( vec2(p.x+offset, p.y)*Rot(angle), .05, .1, .05) ;
        float d2 = sdTriangleIsosceles( vec2(p.x+2.*offset, p.y)*Rot(angle), vec2(.05));
        float d3 = sdBox( vec2(p.x, p.y), vec2(.05, .1) );
        float d4 =sdTrapezoid( vec2(p.x-offset, p.y)*Rot(-angle), .05, .1, .05) ;
        float d5 = sdRhombus(vec2(p.x-2.*offset, p.y+.045)*Rot(6.28318/13.5), vec2(.1, .05));
        float d6 = sdRhombus(vec2(p.x-2.*offset, p.y-.045)*Rot(-6.28318/13.5), vec2(.1, .05));
        float m = min(d1, d2);
        float m1 = min(d3,d4);
        float m2 = min(d5,d6);
        m  = min(m,m1);
        m  = min(m,m2);
        return  S(-.001, .001, m) -.01;
}

## Flower

### a = 8. and petals = 18. gives inverse butterfly 
### when a = petals and even you get two petals horizonally
### when a = petals and even you get two petals vertically
### a = 7, petals = 3. heart - like shape

// Adjust a or num  to change number of petals
float Flower( vec2 p, float a, float num, float shape, float size){
    vec2 st = vec2(atan(p.x, p.y), length(p));
    p = vec2(st.x/(a*PI) +.5, st.y);   
    float x = p.x * num;
    float m = min(fract(x), fract(1.-x));
   // float d = S(-.001, .001, m*shape + size-p.y);
    float d = S(-.001, .001, m*shape + p.y - size);
    return d;
}

## Not perfect but a start at a animal face
float Face(vec2 p){
    float f1 = Flower(p, 7., 3., .5, .3);
    float f2 = Flower(p, 2., 3., .4, .3);
    float f = min(f1, f2);
    return f;
}

## Some attempts at a fish tail
float Tail(vec2 p){
  p *= 6.;
  vec2 pos = vec2((p.x + 1.), p.y-.1);
  float d = sdHeart(pos*Rot(PI/2.));
  //float d = sdPie(pos*Rot(PI/2.), vec2(.09), .15);
//   float d1 = sdRhombus(vec2(p.x+1.*offset,p.y+.045)*Rot(6.28318/13.5), vec2(.1, .05)) - .015; 
//   float d2 = sdRhombus(vec2(p.x+1.*offset, p.y-.045)*Rot(-6.28318/13.5), vec2(.1, .05)) - .015;
 float m = S(-.001, .001, d);
 //float m = S(-.001, .001, min(d1,d2));
  return m;
}

## Good start at fish body
float GetDist(vec3 p) {
    float angle = 3.14159*5./2.;
    vec2 rotXY = vec2(p.x, p.y)*Rot(angle);
    vec3 pos = vec3(p.x-.7, p.y, p.z);
    float d1 = sdRoundCone(vec3(rotXY.x, rotXY.y, p.z), .1, .20, .4);
    float d2 = sdEllipsoid( pos, vec3(.6, .25, .4) );
    float d = smin(d1, d2, .06);
    float d3 = sdBox(vec3(p.x-1.3, p.y, p.z), vec3(.2, .05, .2));
    d = smin(d, d3, .1);
    return d;
}

## From Inigo Quilez Happy Jumping livestream
vec2 sdGuy( in vec3 pos )
{

// bouncing in y direction
// get repeating pattern from 0 - 1
 //  float t = 0.5;
  float t = fract(iTime); //bouncing

   float y = 4.0*t*(1.0-t);
   float dy = 4.0*(1.0-2.0*t);
   
   
   // u and v are perpendicular; dot product get 0
   vec2 u = normalize(vec2( 1.0, -dy ) );  //tangent
   vec2 v = vec2( dy, 1.0 );
   
   vec3 cen = vec3(0.0, y, 0.0);
   
   // want object to stretch vertically
   float sy = 0.5 + 0.5 * y;
   // want to preserve volume; as stretches vertically, expands horizontally
   float sz = 1.0/sy;
   vec3 rad = vec3(0.25, 0.25*sy, 0.25*sz);
   
   // q is coordinate system referring to origin
   vec3 q = pos-cen;
   
  // q.yz = vec2 ( dot(u,q.yz), dot(v,q.yz) ); // not working properly at this point
  
  // create a head
   float d = sdElipsoid(q, rad);
   vec3 h =  q ;
   vec3 sh = vec3( abs(h.x), h.yz );  //model an eye; by passing an abs value for x coordinate to add a second eye
   
   float d2 = sdElipsoid(h - vec3(0.0,0.28,0.0), vec3(0.15,0.2,0.23));  // second vec3 adds nose
   float d3 = sdElipsoid(h - vec3(0.0,0.28,-0.1), vec3(0.23, 0.2, 0.2)); // add back of head to back
   
   d2 = smin(d2,d3, 0.05); 
   d = smin(d,d2, 0.15); // combines head and eyelashes
   
   // add eyebrow
   // sh - symmetric head
   vec3 eb = sh - vec3(0.12,0.34,0.15);
   // use pythagorium triplets which won't scale; divide by 5b to normalize
   eb.xy = (mat2(3,4,-4,3)/5.0)*eb.xy;  // create rotation matrix to give expression; pythagorim tripliets
   d2 = sdElipsoid(eb, vec3(0.06, 0.035, 0.05));
   d = smin(d,d2, 0.04);
   
   
   // ears
   
   d2 = sdStick( sh, vec3(0.1,0.4,-0.01), vec3(0.2, 0.55, 0.02), 0.01, 0.03);
   d = smin(d,d2,0.03);
   
   //mouth
   // as x displaces make parabala
   d2 = sdElipsoid(h - vec3(0.0,0.15 + 3.0*h.x*h.x,0.15), vec3(0.1, 0.04, 0.2)); //adjusted sides of mouth by adjusting y
   d = smax(d,-d2,0.03); 
    
   vec2 res = vec2(d,2.0);  // return distance and object ID
   
   // eyes
   
   float d4 = sdSphere( sh - vec3(0.08,0.28,0.16), 0.05 );
   if ( d4<d ) res = vec2( d4, 3.0 );  //if eye is closest thing return a different identifier
   //d = min(d,d4);
   // make iris
   d4 = sdSphere( sh - vec3(0.09,0.28,0.18), 0.02 );
   if ( d4<d ) res = vec2( d4, 4.0);
   return res;
}
