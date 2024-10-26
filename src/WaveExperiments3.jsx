import { OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useMemo, useRef, useEffect, useState } from "react";
import { Color } from 'three';
import { EffectComposer, ChromaticAberration, DotScreen, Glitch, Noise, Bloom, BrightnessContrast, N8AO, TiltShift2 } from '@react-three/postprocessing'
import { BlendFunction, GlitchMode } from 'postprocessing'
import { BlurPass, Resizer, KernelSize, Resolution } from 'postprocessing'
import { HexColorPicker, RgbColorPicker } from 'react-colorful';

import vertexShader from './vertexShader.glsl';
import fragmentShader from './fragmentShader.glsl';
import fragmentShader2 from './fragmentShader2.glsl';

const WaveMesh = ({color1,color2,color3,color4}) => {
  // This reference will give us direct access to the mesh
  const mesh1 = useRef();
  const mesh2 = useRef();
  const mesh3 = useRef();
  const mesh4 = useRef();
  const mesh5 = useRef();
  const mesh6 = useRef();
  const meshes = [];


  const uniforms = useMemo(
    () => ({
      u_time: {
        value: 0.0,
      },
      u_color1: {
        value: new Color(color1),
      },
      u_color2: {
        value: new Color(color2),
      },
    }), []
  );


  const uniforms2 = useMemo(
    () => ({
      u_time: {
        value: 0.0,
      },
      u_color1: {
        value: new Color(color3),
      },
      u_color2: {
        value: new Color(color4),
      },
    }), []
  );

  useFrame((state) => {
    const { clock } = state;
    const elapsedTime = clock.getElapsedTime();
    if(mesh1.current){
      // console.log("Color1:", color1);
      // console.log("Color2:", color2);
       mesh1.current.material.uniforms.u_time.value = elapsedTime;
       mesh1.current.rotation.set(-Math.PI/((Math.sin(1/2)*2+4)), Math.PI / 6, 0);
    }
    
    const mesh2x = 6*Math.sin(elapsedTime);
    // console.log("mesh2x",mesh2x);
    var sign = 6*Math.cos(elapsedTime);
    sign = sign/Math.abs(sign);
    const mesh2y = Math.sqrt(36-mesh2x*mesh2x)*sign;
    // console.log("mesh2y",mesh2y);
    if (mesh2.current){
      mesh2.current.material.uniforms.u_time.value = elapsedTime;
      mesh2.current.position.set(mesh2x, 0, mesh2y);
      mesh2.current.rotation.set(-Math.PI/((Math.sin(1/2)*2+4)), Math.PI / 6, 0);
    }
    if (mesh5.current){ //mesh2 stick
      mesh5.current.position.set(mesh2x, -4.5, mesh2y);
    }
    
    if(mesh3.current){
      mesh3.current.material.uniforms.u_time.value = elapsedTime;
      mesh3.current.position.set(-mesh2x, 0, -mesh2y);
      mesh3.current.rotation.set(-Math.PI/((Math.sin(1/2)*2+4)), Math.PI / 6, 0);
    }
    if(mesh6.current){
      mesh6.current.position.set(-mesh2x, -4.5, -mesh2y);
    }

    if(mesh1.current){
      mesh1.current.material.uniforms.u_color1.value = new Color(color1.r / 255, color1.g / 255, color1.b / 255);
      mesh1.current.material.uniforms.u_color2.value = new Color(color2.r / 255, color2.g / 255, color2.b / 255);
    }
    if(mesh2.current){
      mesh2.current.material.uniforms.u_color1.value = new Color(color3.r / 255, color3.g / 255, color3.b / 255);
      mesh2.current.material.uniforms.u_color2.value = new Color(color4.r / 255, color4.g / 255, color4.b / 255);
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
    <mesh ref={mesh5} position={[4, -4.5, -4]} rotation={[0, 0, 0]} scale={1.5}>
    <cylinderGeometry args={[0.2, 0.2, 7, 32]} /> 
    <meshLambertMaterial color="white"/>
    </mesh> 
    <mesh ref={mesh6} position={[-4, -4.5, 4]} rotation={[0, 0, 0]} scale={1.5}>
    <cylinderGeometry args={[0.2, 0.2, 7, 32]} /> 
    <meshLambertMaterial color="white"/>
    </mesh> 

    </>
  );
};

const Scene = () => {

  //color pickers
  const [color1, setColor1] = useState({r:255, g:0, b:0}); //{r:0, g:0, b:255}
  const [color2, setColor2] = useState({r:51, g:255, b:224}); //{r:51, g:230, b:255}
  const [color3, setColor3] = useState({r:165, g:111, b:237}); //{r:175, g:113, b:238} //{r:102, g:26, b:26}
  const [color4, setColor4] = useState({r:19, g:91, b:151}); //{r:118, g:76, b:230} //{r:153, g:77, b:230}

  return (
    <section className="canvas-container">
      <div className="color-box">
        <div className="text-title">Color Picker</div>
        <div className="text">Center colors</div>
        <div className="color-pickers">
            <RgbColorPicker color={color1} onChange={setColor1} /> 
            <RgbColorPicker color={color2} onChange={setColor2} />         
        </div>
        <div className="text">Side colors</div>
        <div className="color-pickers">
         <RgbColorPicker color={color3} onChange={setColor3} /> 
         <RgbColorPicker color={color4} onChange={setColor4} /> 
        </div>
        {/* <p>Current Color: rgb({color1.r}, {color1.g}, {color1.b})</p>
        <p>Current Color: rgb({color2.r}, {color2.g}, {color2.b})</p>
        <p>Current Color: rgb({color3.r}, {color3.g}, {color3.b})</p>
        <p>Current Color: rgb({color4.r}, {color4.g}, {color4.b})</p> */}
      </div>
      <Canvas className="canvas" dpr={[1, 2]} camera={{ position: [7, 0, 7], rotation:[0,0,0], fov: 45 }} shadows>
        <color attach="background" args={["#FFC0CB"]} />
        <ambientLight intensity={2.5} /> 
        <directionalLight position={[5, 5, 5]} intensity={1} castShadow/>

        <WaveMesh color1={color1} color2={color2} color3={color3} color4={color4}/>
        <OrbitControls />
        <EffectComposer>

          {/* <ChromaticAberration
            blendFunction={BlendFunction.NORMAL} // blend mode
            offset={[0.005, 0.002]} // color offset
          /> */}
          {/* <Noise
            premultiply // enables or disables noise premultiplication
            blendFunction={BlendFunction.SCREEN} // blend mode
          /> */}
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


