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

## See Iqilezles.org for the SDFs of other shapes


# My (not so good) attemps to create a fish sdf

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