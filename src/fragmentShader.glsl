uniform float u_time;

varying vec2 vUv;
varying float vOffset;

const float PI = 3.14159265358979323846;

vec3 colorA = vec3(0.0,0.0,1.0);
vec3 colorB = vec3(0.2,0.9,1.0);

void main() {   

    float angle = 7.0*PI/4.0; 
    float cosTheta = cos(angle);
    float sinTheta = sin(angle);

    mat2 rotationMatrix = mat2(cosTheta, -sinTheta, sinTheta, cosTheta);

    vec2 uv = rotationMatrix * (vUv - 0.5) + 0.5; // Center the rotation around (0.5, 0.5)
    //sin between 0.3 and 0.8
    //vec3 color = mix(colorA*2.0+sin((u_time))*0.5/2.5+0.55, colorB, sin(64.0*uv.x/1.5));
    vec3 color = mix(colorA*2.0+sin((u_time))*0.15/2.0+0.725, colorB, sin(32.0*uv.x/1.5));

  gl_FragColor = vec4(color,1.0);
}
