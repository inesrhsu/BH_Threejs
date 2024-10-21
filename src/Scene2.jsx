import { MathUtils } from 'three'
import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Instances, Instance, Environment } from '@react-three/drei'
import { EffectComposer, N8AO, TiltShift2 } from '@react-three/postprocessing'
import './App.css';

import vertexShader from './vertexShader.glsl';
import fragmentShader from './fragmentShader.glsl';
// const particles =  Array.from({ length: 9 }, () => ({
//   factor: MathUtils.randInt(20, 100),
//   speed: MathUtils.randFloat(0.01, 0.75),
// }))
const particles = [];
for (let x = -2; x <= 2; x += 2) { 
    for (let y = -2; y <= 2; y += 2) { 
        particles.push({position:[x, y, -x]}); 
    } 
}

export default function Scene2() {
    // useFrame(()=>{
    //   console.log("Rendering Scene2");   
    // });
    

  return (
    <section className="canvas-container">
      <Canvas className="canvas" dpr={[1, 2]} camera={{ position: [7, 0, 7], rotation:[0,Math.PI/4,0], fov: 45 }} shadows>
      {/* <Canvas className="canvas" shadows dpr={[1, 2]} gl={{ antialias: false }} camera={{ fov: 50, position: [0, 0, 20] }}> */}
        <color attach="background" args={["#FFC0CB"]} />
        <fog attach="fog" args={['red', 20, -5]} />
        <ambientLight intensity={1.5} />
        <pointLight position={[10, 10, 10]} intensity={1} castShadow />
        <Waves />
        <Environment preset="city" />
       </Canvas>
    </section>
  )
}

function Waves() {
    console.log("In Waves");
    const uniforms = useMemo(
        () => ({
          u_time: {
            value: 0.0,
          },
        }), []
      );

  const ref = useRef()
//   useFrame((state, delta) => void (ref.current.rotation.y = MathUtils.damp(ref.current.rotation.y, (-state.mouse.x * Math.PI) / 6, 2.75, delta)))
  useFrame((state) => {
    const { clock } = state;
    const elapsedTime = clock.getElapsedTime();
    ref.current.material.uniforms.u_time.value = elapsedTime;2
  });
  
  return (
    <Instances limit={particles.length} ref={ref} castShadow receiveShadow position={[0, 0, 0]} rotation={[-Math.PI/2.5, Math.PI / 6, 0]}>
      <planeGeometry args={[1, 1, 45, 45]} />
      {/* <meshStandardMaterial color='#f0f0f0'/> */}
          <shaderMaterial
          fragmentShader={fragmentShader}
          vertexShader={vertexShader}
          uniforms={uniforms}
          />
      {particles.map((data, i) => (    
        <WaveInstance key={i} {...data} />
      ))}
    </Instances>
  )
}

function WaveInstance({position}) {
  const ref = useRef()
  useFrame((state) => {
    // const t = factor + state.clock.elapsedTime * (speed / 2)
    ref.current.scale.setScalar(1.5)
    ref.current.position.set(position[0],position[1],position[2] )
    
    const { clock } = state;
    const elapsedTime = clock.getElapsedTime();

    ref.current.rotation.set(
        -Math.PI/((Math.sin((position[0]+position[1]+elapsedTime)/1.3)*2+4)) + Math.PI/2.5, 
        Math.PI / 6 - Math.PI / 6, 
        0);

  })
  return <Instance ref={ref} />
}

