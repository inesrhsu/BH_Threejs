uniform sampler2D colors;

varying vec2 vUv;

void main(){
    vec3 color = texture2D(colors, vUv).rgb;
    gl_FragColor = vec4(color, 1.0);
}