import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useEffect } from "react";
import { Color } from "three";
// import './App.css';

import vertexShader from './vertexShader.glsl';
import fragmentShader from './fragmentShader.glsl';
// console.log('Vertex Shader:', vertexShader);
// console.log('Fragment Shader:', fragmentShader);

const FlatMesh = () => {
  // This reference will give us direct access to the mesh
  const mesh = useRef();
  const meshes = [];

  const uniforms = useMemo(
    () => ({
      u_time: {
        value: 0.0,
      },
    }), []
  );

 for (let x = -2; x <= 2; x+=2){
    for (let y=-2; y<= 2; y+=2){
      meshes.push(
        <mesh key={`${x}+${y}`} ref={mesh} position={[x, y, -x]} rotation={[-Math.PI/2.5, Math.PI / 6, 0]} scale={1.5}>
          <planeGeometry args={[1, 1, 45, 45]} />
          <shaderMaterial
          fragmentShader={fragmentShader}
          vertexShader={vertexShader}
          uniforms={uniforms}
          />
        </mesh>
        );
      }
    }

  useFrame((state) => {
    const { clock } = state;
    const elapsedTime = clock.getElapsedTime();
    mesh.current.material.uniforms.u_time.value = elapsedTime;
    
     mesh.current.rotation.set(-Math.PI/((Math.sin(elapsedTime/2)*2+4)), Math.PI / 6, 0);
  });

  
   
  


  return (
    <>{meshes}</>
  );
};

const Scene = () => {
  return (
    <section className="canvas-container">
      <Canvas className="canvas" dpr={[1, 2]} camera={{ position: [7, 0, 7], rotation:[0,0,0], fov: 45 }} shadows>
        <color attach="background" args={["#FFC0CB"]} />
        <ambientLight intensity={0.7} /> 
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow/>

        <FlatMesh />

        <OrbitControls />
      </Canvas>
    </section>
  );
};
  
  export default Scene;
  


