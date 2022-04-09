// Ported to P5.js from The Drive Home tutorials
// by Martijn Steinrucken aka The Art of Code/BigWings 
// https://www.youtube.com/watch?v=eKtsY7hYTPg
// https://www.shadertoy.com/view/MdfBRX

// I highly recommend watching the full tutorial series!
// Note:  the original code uses multiple loops that iterate from 0., 1. and increment by a fraction.
// This would not compile in p5.js, so I changed the interation paramenters.
// The original version is MUCH better--take a look at the version in shadertoy to compare.

// a shader variable
let theShader;

function preload(){
  // load the shader
  theShader = loadShader('starter.vert', 'starter.frag');
}

function setup() {
  pixelDensity(1);
  // shaders require WEBGL mode to work
  createCanvas(840, 472, WEBGL);
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
  //model(cubeObj);
  // rect gives us some geometry on the screen
  rect(0,0,width, height);
}