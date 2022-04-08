##  It is often necessary to remap the uvs from global coordinates to local coordinates.  This is a nice helper function to allow you do to this.

### The global uv values have a domain of [0,1]
- the global uv space goes from 0 in lower-left corner to 1 in upper-right corner
- you can visualize how the uv values change from left to right by typing uv.x
- you can visualize how the uv values change from bottom to top by typing uv.y
- you can visualize how the uv values change from the lower-left to top-right by typing uv.xy

### Remapping the origin
-  This is often the first line of code in the main() function.  The remapped uv values now go from [-0.5, 0.5].  We divide by u_resolution.y to maintain the aspect ratio of the canvas.  

`uv = (gl_FragCoord.xy-.5*u_resolution.xy)/u_resolution.y;`


### Remap from global uv space to local uv space 
`vec2 Remap(vec2 p, float b, float l, float t, float r) {
 return vec2( (p.x - l)/(r-l) , (p.y-b)/(t-b) ); }`


## You can test whether you have correctly remapped your coordinat (0,0)
## in the local uv space

`col = mix( col, vec3(0,1,0), S( .1, .05, length( st-vec2(0,0) ) ) );`

## Adding Grids for repetition
- Multiply the uv space by a vec2 with dimensions of desired grid
- Subtract .5 to center the origin in the middle of the grid
`vec2 gridUV = fract( uv*vec2(6,5) ) - .5`
