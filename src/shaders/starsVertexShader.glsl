
uniform sampler2D uPositions;
uniform sampler2D uColors;


varying vec3 col;

void main() {
  vec3 pos = texture2D(uPositions, position.xy).xyz;
  vec3 color = texture2D(uColors, position.xy).xyz;
  col = color;

  vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;

  gl_PointSize = 4.0;
  // Size attenuation;
  //gl_PointSize *= step(1.0 - (1.0/64.0), position.x) + 0.5;
}


