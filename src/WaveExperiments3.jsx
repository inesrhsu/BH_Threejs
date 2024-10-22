import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useEffect } from "react";

import vertexShader from './vertexShader.glsl';
import fragmentShader from './fragmentShader.glsl';

const WaveMesh = () => {
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

  useFrame((state) => {
    const { clock } = state;
    const elapsedTime = clock.getElapsedTime();
    mesh.current.material.uniforms.u_time.value = elapsedTime;

     mesh.current.rotation.set(-Math.PI/((Math.sin(1/2)*2+4)), Math.PI / 6, 0);
  });

  return (
    <>
   
    <mesh ref={mesh} position={[0, 0, 0]} rotation={[-Math.PI/2.5, Math.PI / 6, 0]} scale={1.5}>
    <sphereGeometry args={[1, 128, 128]} />
    <shaderMaterial
    fragmentShader={fragmentShader}
    vertexShader={vertexShader}
    uniforms={uniforms}
    />
    </mesh> 

    <mesh ref={mesh} position={[3, 0, -3]} rotation={[-Math.PI/2.5, Math.PI / 6, 0]} scale={1.5}>
    <boxGeometry args={[1, 1, 1, 64]} />
    <shaderMaterial
    fragmentShader={fragmentShader}
    vertexShader={vertexShader}
    uniforms={uniforms}
    />
    </mesh>
    
    <mesh ref={mesh} position={[-3, 0, 3]} rotation={[-Math.PI/2.5, Math.PI / 6, 0]} scale={1.5}>
    <boxGeometry args={[1, 1, 1, 64]} />
    <shaderMaterial
    fragmentShader={fragmentShader}
    vertexShader={vertexShader}
    uniforms={uniforms}
    />
    </mesh>
    </>
  );
};

const Scene = () => {
  return (
    <section className="canvas-container">
      <Canvas className="canvas" dpr={[1, 2]} camera={{ position: [7, 0, 7], rotation:[0,0,0], fov: 45 }} shadows>
        <color attach="background" args={["#FFC0CB"]} />
        <ambientLight intensity={0.7} /> 
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow/>

        <WaveMesh />

        <OrbitControls />
      </Canvas>
    </section>
  );
};
  
export default Scene;