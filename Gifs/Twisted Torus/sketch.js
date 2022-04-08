// Port of Twisted Torus Shader by The Art of Code
// https://www.youtube.com/watch?v=rA9NmBRqfjI

// a shader variable
let theShader;

function preload(){
  // load the shader
  theShader = loadShader('starter.vert', 'starter.frag');
}

function setup() {
  pixelDensity(1);
  // shaders require WEBGL mode to work
  createCanvas(800, 800, WEBGL);
  noStroke();
}

function draw() {  
  background(0);

  // send resolution of sketch into shader
  theShader.setUniform('u_resolution', [width, height]);
  theShader.setUniform("iMouse", [mouseX, map(mouseY, 0, height, height, 0)]);
  theShader.setUniform("iFrame", frameCount);
  theShader.setUniform("iTime", millis()/1000.); 
  
  // shader() sets the active shader with our shader
  shader(theShader);
  // rect gives us some geometry on the screen
  rect(0,0,width, height);
}
