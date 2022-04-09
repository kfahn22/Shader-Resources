// This code renders a rhombic dodecahedron with reflection.
// It is ported to p5.js from a youtube tutorial by The Art of Code

let textureImg0;

// a shader variable
let theShader;

function preload(){
  // load the shader
  textureImg0 = loadImage("Assets/ice.PNG");
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
  //texture(img);
  // send resolution of sketch into shader
  theShader.setUniform('u_resolution', [width, height]);
  theShader.setUniform("iMouse", [mouseX, map(mouseY, 0, height, height, 0)]);
  theShader.setUniform("iFrame", frameCount);
  theShader.setUniform("tex0",  textureImg0);

  
  // shader() sets the active shader with our shader
  shader(theShader);

  // rect gives us some geometry on the screen
  rect(0,0,width, height);
}

