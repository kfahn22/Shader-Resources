// You can find more information about this shader at https://luka712.github.io/2018/07/01/Pixelate-it-Shadertoy-Unity/

#ifdef GL_ES
precision mediump float;
#endif

// Pass in uniforms from the sketch.js file
uniform vec2 u_resolution; 
uniform float iTime;
uniform vec2 iMouse;
uniform float iFrame;
uniform sampler2D tex0;

#define SIZE 10.

// Function to add background color
vec3 backgroundGradient(vec2 uv, vec3 col1, vec3 col2, float m) {
  float k = uv.y*m + m;
  vec3 col = mix(col1, col2, k);
  return col;
}

vec3 gradient(vec3 uv, vec3 col1, vec3 col2, float m) {
  float k = uv.y*m + m;
  vec3 col = mix(col1, col2, k);
  return col;
}

void main( )
{
	//vec2 uv = (2.*gl_FragCoord.xy-u_resolution.xy) / u_resolution.y;
  vec2 uv = gl_FragCoord.xy/u_resolution.y;
  
  vec3 col = vec3(0);
  
  float onePixelSizeX = 1.0 / u_resolution.x;
  float onePixelSizeY = 1.0 / u_resolution.y;
  
  float cellSizeX = SIZE *onePixelSizeX;
  float cellSizeY = SIZE *onePixelSizeY;
  
  float x = cellSizeX * floor(uv.x / cellSizeX);
  float y = cellSizeY * floor(uv.y / cellSizeY);
  
  vec3 texture0 = texture2D(tex0, vec2(x, y)).rgb;
  
  gl_FragColor = vec4(texture0, 1.);
}
