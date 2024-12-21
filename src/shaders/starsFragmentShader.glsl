

varying vec3 col;


void main() {
  //vec3 color = texture2D(uColors, vUv).xyz;
  //vec3 color = vec3(0.2,0.5,0.7);
  
  float strength = pow((1.0 - distance(gl_PointCoord, vec2(0.5))),3.0);
  vec3 color = mix(vec3(0.0), col, strength); 
  gl_FragColor = vec4(color, strength);
  gl_FragColor = vec4(color, 1.0);

  //vec4 color = texture2D(uColors,vUv);
  //vec4 color = vec4(col,1.0);
  //gl_FragColor = color;
}


