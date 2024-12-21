
uniform sampler2D uPositions;  //x,y,z,sLen (size)
uniform sampler2D uColors;     //rgba


varying vec4 col;

void main() {
  vec3 pos = texture2D(uPositions, position.xy).xyz;
  vec4 color = texture2D(uColors, position.xy).rgba;
  col = color;

  vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;

  gl_PointSize = texture2D(uPositions, position.xy).a; //using sLen for size
  gl_PointSize *= 10.0;   //non-gas look use size 10
  // Size attenuation;
  gl_PointSize *= step(1.0 - (1.0/64.0), position.x) + 0.5;
}


