let canvas, shaderLayer, crtShader, ctx;

function setup() {
    // Get the canvas context so we can grap the image data from it later
    canvas = createCanvas(indowWidth, windowHeght).canvas;
    ctx = canvas.getContext('2d');

    // p5 graphcis element to draw our shader output to
    shaderLayer = createGraphics(windowWidth, windowHeight, WEBGL);
    shaderLayer.noStroke();
}
shaderLayer.rect(0,0, width, height);
shaderLayer.shader(crtShader);

// pass the image from canvas context in to shader as uniform
crtShader.setUniform("u_tex", ctx.getImageData(0,0,width, height));
crtShader.setUniform("u_resolution", [width, height]);

// Resetting the background to black to check we're not seeing the original drawing output
background(255);
image(shaderLayer, 0,0,width,height);