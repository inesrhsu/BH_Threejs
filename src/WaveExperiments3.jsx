import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useEffect } from "react";
import { Color } from 'three';
import { EffectComposer, ChromaticAberration, DotScreen, Glitch, Noise, Bloom, BrightnessContrast, N8AO, TiltShift2 } from '@react-three/postprocessing'
import { BlendFunction, GlitchMode } from 'postprocessing'
import { BlurPass, Resizer, KernelSize, Resolution } from 'postprocessing'



import vertexShader from './vertexShader.glsl';
import fragmentShader from './fragmentShader.glsl';
import fragmentShader2 from './fragmentShader2.glsl';

const WaveMesh = () => {
  // This reference will give us direct access to the mesh
  const mesh1 = useRef();
  const mesh2 = useRef();
  const mesh3 = useRef();
  const mesh4 = useRef();
  const meshes = [];

  const uniforms = useMemo(
    () => ({
      u_time: {
        value: 0.0,
      },
      u_color1: {
        value: new Color(1,0,0),
      },
      u_color2: {
        value: new Color(0,0,1),
      },
    }), []
  );
  const uniforms2 = useMemo(
    () => ({
      u_time: {
        value: 0.0,
      },
      u_color1: {
        value: new Color(1,0,0),
      },
      u_color2: {
        value: new Color(0,0,1),
      },
    }), []
  );

  useFrame((state) => {
    const { clock } = state;
    const elapsedTime = clock.getElapsedTime();
    if(mesh1.current){
       mesh1.current.material.uniforms.u_time.value = elapsedTime;
       mesh1.current.rotation.set(-Math.PI/((Math.sin(1/2)*2+4)), Math.PI / 6, 0);
    }
   
    if (mesh2.current){
      mesh2.current.material.uniforms.u_time.value = elapsedTime;
      mesh2.current.rotation.set(-Math.PI/((Math.sin(1/2)*2+4)), Math.PI / 6, 0);
    }
    
    if(mesh3.current){
      mesh3.current.material.uniforms.u_time.value = elapsedTime;
      mesh3.current.rotation.set(-Math.PI/((Math.sin(1/2)*2+4)), Math.PI / 6, 0);
    }
    
    
  });

  return (
    <>
   
    <mesh ref={mesh1} position={[0, 0, 0]} rotation={[-Math.PI/2.5, Math.PI / 6, 0]} scale={1.5}>
    <sphereGeometry args={[2, 128, 128]} />
    <shaderMaterial
    fragmentShader={fragmentShader}
    vertexShader={vertexShader}
    uniforms={uniforms}
    />
    </mesh> 

    <mesh ref={mesh2} position={[4, 0, -4]} rotation={[-Math.PI/2.5, Math.PI / 6, 0]} scale={1.5}>
    <sphereGeometry args={[1, 128, 128]} />
    <shaderMaterial
    fragmentShader={fragmentShader2}
    vertexShader={vertexShader}
    uniforms={uniforms2}
    />
    </mesh>
    
    <mesh ref={mesh3} position={[-4, 0, 4]} rotation={[-Math.PI/2.5, Math.PI / 6, 0]} scale={1.5}>
    <sphereGeometry args={[1, 128, 128]} />
    <shaderMaterial
    fragmentShader={fragmentShader2}
    vertexShader={vertexShader}
    uniforms={uniforms2}
    />
    </mesh>
    <mesh ref={mesh4} position={[0, -4, 0]} rotation={[0, 0, 0]} scale={1.5}>
    <cylinderGeometry args={[0.2, 0.2, 8, 32]} /> 
    <meshLambertMaterial color="white"/>
    </mesh> 
    <mesh ref={mesh4} position={[4, -4.5, -4]} rotation={[0, 0, 0]} scale={1.5}>
    <cylinderGeometry args={[0.2, 0.2, 7, 32]} /> 
    <meshLambertMaterial color="white"/>
    </mesh> 
    <mesh ref={mesh4} position={[-4, -4.5, 4]} rotation={[0, 0, 0]} scale={1.5}>
    <cylinderGeometry args={[0.2, 0.2, 7, 32]} /> 
    <meshLambertMaterial color="white"/>
    </mesh> 

    </>
  );
};

const Scene = () => {
  return (
    <section className="canvas-container">
      <Canvas className="canvas" dpr={[1, 2]} camera={{ position: [7, 0, 7], rotation:[0,0,0], fov: 45 }} shadows>
        <color attach="background" args={["#FFC0CB"]} />
        <ambientLight intensity={2.5} /> 
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow/>

        <WaveMesh />
        <OrbitControls />
        <EffectComposer>

          <ChromaticAberration
            blendFunction={BlendFunction.SUBTRACT} // blend mode
            offset={[0.005, 0.002]} // color offset
          />
          <Noise
            premultiply // enables or disables noise premultiplication
            blendFunction={BlendFunction.SCREEN} // blend mode
          />
          {/* <Glitch
            delay={[0.5, 1.0]} // min and max glitch delay
            duration={[0.6, 1.0]} // min and max glitch duration
            strength={[0.001, 0.003]} // min and max glitch strength
            chromaticAberrationOffset={[0.1,0.1]}
            // dtSize = {0.001}
            columns = {0.001}
            blendFunction={BlendFunction.MULTIPLY}
            mode={GlitchMode.NORMAL} // glitch mode
            active // turn on/off the effect (switches between "mode" prop and GlitchMode.DISABLED)
            ratio={0.9} // Threshold for strong glitches, 0 - no weak glitches, 1 - no strong glitches.
          /> */}
          {/* <DotScreen
            blendFunction={BlendFunction.LIGHTEN} // blend mode
            angle={Math.PI * 0.5} // angle of the dot pattern
            scale={1.0} // scale of the dot pattern
          /> */}
          {/* <Bloom
            intensity={1.0} // The bloom intensity.
            blurPass={undefined} // A blur pass.
            kernelSize={KernelSize.LARGE} // blur kernel size
            luminanceThreshold={0.9} // luminance threshold. Raise this value to mask out darker elements in the scene.
            luminanceSmoothing={0.025} // smoothness of the luminance threshold. Range is [0, 1]
            mipmapBlur={false} // Enables or disables mipmap blur.
            resolutionX={Resolution.AUTO_SIZE} // The horizontal resolution.
            resolutionY={Resolution.AUTO_SIZE} // The vertical resolution.
          /> */}
          <BrightnessContrast
            brightness={0} // brightness. min: -1, max: 1
            contrast={0} // contrast: min -1, max: 1
          />
      </EffectComposer>
      </Canvas>
    </section>
  );
};
  
export default Scene;