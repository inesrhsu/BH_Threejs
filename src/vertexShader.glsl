uniform float u_time;

varying vec2 vUv;

void main() {
  vUv = uv;
  vec4 modelPosition = modelMatrix * vec4(position, 1.0);
  #ifdef USE_INSTANCING
    	modelPosition = instanceMatrix * modelPosition;
    #endif
  modelPosition.y += sin(modelPosition.x * 8.0+modelPosition.z * 8.0 + u_time * 4.0) * 0.2;
  modelPosition.z += sin(modelPosition.x * 8.0 + u_time * 2.0) * 0.2;

  vec4 viewPosition = viewMatrix * modelPosition;
  vec4 projectedPosition = projectionMatrix * viewPosition;

  gl_Position = projectedPosition;
}
