// Function to write a number one
vec3  One(vec2 uv) {
  vec3 col = vec3(0);
  float d1 = length(uv - vec2(-0.01, clamp(-0.05, 0.01, uv.y) ) );
  float m1 = S(.008, .0, d1);
  col += m1;
  return col;
}

//Function to write a zero
vec3  Zero(vec2 uv) {
   vec3 col = vec3(0);
   float d1 = length(uv - vec2(-0.01, clamp(-0.05, 0.01, uv.y) ) );
   float m1 = S(.008, .0, d1);
   float d2 = length(uv - vec2(0.01, clamp(-0.05, 0.01, uv.y) ) );
   float m2 = S(.008, .0, d2);
   float d3 = length(uv - vec2(clamp(-0.01, 0.01, uv.x), 0.01 ));
   float m3 = S(.008, .0, d3);
   float d4 = length(uv - vec2(clamp(-0.01, 0.01, uv.x), -0.05));
   float m4 = S(.008, .0, d4);
   col += m1;
   col += m2;
   col += m3;
   col += m4;
   return col;
}

// Function to write 100
vec3 complete( vec2 uv) {
    vec3 col = vec3(0);
    vec3 one = One( uv - vec2(-.125, .0) );
    col += one;
    vec3 zero1 = Zero( uv - vec2(-.1, .0) );
    col += zero1;
    vec3 zero2 = Zero( uv - vec2(-0.055, 0.) );
    col += zero2;
    return col;
}

vec3 percent( vec2 uv ) {
  vec2 st = fract(uv*.5);
  
  vec3 col = vec3(0);
  float d =  length(st - vec2(st.x) );
  float m = S(.008, .0, d);
  float d4 = length(uv - vec2(clamp(-0.01, 0.01, uv.x), -0.01 ));
   float m4 = S(.008, .0, d4);
  col += m;
  return col;
}

// vec3 diagonalLines( vec2 uv ) {
//   vec2 st = fract(uv*20.);
  
//   vec3 col = vec3(0);
//   float d =  length(st - vec2(st.x) );
//   float m = S(.008, .0, d);
//   col += m;
//   return col;
// }
