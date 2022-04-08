// Ported to P5.js from Living Coding:  Making the American flag with math!
// https://www.youtube.com/watch?v=t4XnK50ocMk

// a shader variable
let theShader;

function preload(){
  // load the shader
  theShader = loadShader('starter.vert', 'starter.frag');
}

function setup() {
  pixelDensity(1);
  // shaders require WEBGL mode to work
  createCanvas(800, 450, WEBGL);
  noStroke();
}

function draw() {  
  background(0);

  // send resolution of sketch into shader
  theShader.setUniform('u_resolution', [width, height]);
  theShader.setUniform("iTime", millis()/1000.);
  
  // shader() sets the active shader with our shader
  shader(theShader);
  
  // rect gives us some geometry on the screen
  rect(0,0,width, height); 
}

