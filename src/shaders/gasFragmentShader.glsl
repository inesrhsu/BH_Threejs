

varying vec4 col;


void main() {
  
  //fade with distance
  float sqDist = dot(gl_PointCoord - vec2(0.5), gl_PointCoord - vec2(0.5));
  float mult = 1.0 - sqDist;
  float strength = mult*mult*mult/12.0; //for non-gas look dont divide by anything
  
  vec4 color = mix(vec4(0.0), col, strength); 
  gl_FragColor = color;

}



//old version of fade
  //float strength = pow((1.0 - distance(gl_PointCoord, vec2(0.5))),3.0)/10.0; //for non-gas look dont divide by anything
 

//old version using vec3 color (not using given alpha value)
  //gl_FragColor = vec4(color, strength);

  //original basic fragment shader
  //vec3 col = vec3(0.2,0.5,0.7);
  //vec4 color = vec4(col,1.0);
  //gl_FragColor = color;


