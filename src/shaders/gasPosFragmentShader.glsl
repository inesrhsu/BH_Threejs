uniform sampler2D positions;

varying vec2 vUv;

//void main(){
//    vec3 pos = texture2D(positions, vUv).rgb;
//    gl_FragColor = vec4(pos, 1.0);
//}

void main(){
    vec4 pos = texture2D(positions, vUv);
    gl_FragColor = pos;
}