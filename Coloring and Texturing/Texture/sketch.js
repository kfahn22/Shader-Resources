// This sketch explores the various ways to add color and texture to an object in a shader
// Use rounded_box.frag to add plain color or blended colors
// Use textured_box.frag to add images 
// Use reflective_box.frag to add reflective surfaces.  (This is not a perfect implementation
// as as far as I can tell there is nothing comparable to a cubeBox in P5.js)

// All the images are from my own personal collection
let textureImg0;
let textureImg1;
let textureImg2;

// a shader variable
let theShader;

function preload() {
    // load the shader
    // Images with no obvious orientation work best when the object is spinning
    textureImg0 = loadImage("Assets/colorful_stones.PNG");
    textureImg1 = loadImage("Assets/baby_Bella.JPG");
    textureImg2 = loadImage("Assets/moss.PNG");
    theShader = loadShader('basic.vert', 'textured_box.frag');
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
    theShader.setUniform("tex0", textureImg0);
    theShader.setUniform("tex1", textureImg1);
    theShader.setUniform("tex2", textureImg2);

    // shader() sets the active shader with our shader
    shader(theShader);

    // rect gives us some geometry on the screen
    rect(0, 0, width, height);
}