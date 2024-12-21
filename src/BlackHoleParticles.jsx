import {OrbitControls, useFBO} from "@react-three/drei";
import {Canvas, useFrame, extend, createPortal} from "@react-three/fiber";
        //extend used to register custom Three.js objects (like custom materials)
        //createPortal allows rendering React components outside the current component tree (used to render meshes to a different scene)
import {useMemo, useRef} from "react";
import * as THREE from "three";
import './App.css';

// import shaders
import starsPosVertexShader from './shaders/starsPosVertexShader.glsl';
import starsPosFragmentShader from './shaders/starsPosFragmentShader.glsl';
import starsColorsVertexShader from './shaders/starsColorsVertexShader.glsl';
import starsColorsFragmentShader from './shaders/starsColorsFragmentShader.glsl';
import starsVertexShader from './shaders/starsVertexShader.glsl';
import starsFragmentShader from './shaders/starsFragmentShader.glsl';

import gasPosVertexShader from './shaders/gasPosVertexShader.glsl';
import gasPosFragmentShader from './shaders/gasPosFragmentShader.glsl';
import gasColorsVertexShader from './shaders/gasColorsVertexShader.glsl';
import gasColorsFragmentShader from './shaders/gasColorsFragmentShader.glsl';
import gasVertexShader from './shaders/gasVertexShader.glsl';
import gasFragmentShader from './shaders/gasFragmentShader.glsl';

// import data
import {starsPositions} from './data/starsPositions';
import {starsColors} from './data/starsColors';

import {gasPositions} from './data/gasPositions';
import {gasColors} from './data/gasColors';


// extend ({StarsMaterial});

const StarFBOParticles = () => {

  const starsCount = starsPositions.length/4;// 210020;      //512x512 = 262144  (data already padded)
  const starsTexSize = Math.ceil(Math.sqrt(starsCount)); //459  //512 -> using powers of 2
  

  const starsPosScene = new THREE.Scene(); //scene to render position data to        
  const starsColScene = new THREE.Scene(); //scene to render color data to     
  const camera = new THREE.OrthographicCamera(-1,1,1,-1, // left, right, top, bottom boundaries of view frustrum
                                              1 / Math.pow(2, 53), 1); // near and far clipping planes (1 / Math.pow(2, 53) is the smallest positive normal number,  used when extremely small distances are needed)
  
  //Create textures to hold initial positions and colors data
  //Star Positions Data Texture:
  const starsPositionsTexture = new THREE.DataTexture( //can also use WebGL gl.createTexture()
    starsPositions,  
    starsTexSize,
    starsTexSize,
    THREE.RGBAFormat,
    THREE.FloatType
  );
  starsPositionsTexture.needsUpdate = true; //update texture every frame

  //Star Colors Data Texture:
  const starsColorsTexture = new THREE.DataTexture( //can also use WebGL gl.createTexture()
    starsColors,  
    starsTexSize,
    starsTexSize,
    THREE.RGBAFormat,
    THREE.FloatType
  );
  starsColorsTexture.needsUpdate = true; //update texture every frame

  // pass positions Data Texture as uniforms for 1st render pass
  const starsPosUniforms = 
  { 
    positions: {value: starsPositionsTexture},
  };

  const starsColorsUniforms = 
  { 
    colors: {value: starsColorsTexture},
  };
  

  //Stars Position Material (1st render pass)
  const starsPosMaterial = new THREE.ShaderMaterial({
    uniforms: starsPosUniforms,
    vertexShader: starsPosVertexShader,
    fragmentShader: starsPosFragmentShader,
  });

   //Stars Color Material (1st render pass)
   const starsColorMaterial = new THREE.ShaderMaterial({
    uniforms: starsColorsUniforms,
    vertexShader: starsColorsVertexShader,
    fragmentShader: starsColorsFragmentShader,
  });

  //FRAMEBUFFER to hold new data

  //Set up frame buffer
  const points = useRef(); //final rendered points (2nd render pass)
  // const starsMaterialRef = useRef();

  //quad geometry and uvs to run the shader on (in the FBO render)
  const positions = new Float32Array([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, 1, 1, 0, -1, 1, 0]); //particles represented as quads, defines vertex positions of geometry- positions to map uvs to
  const uvs = new Float32Array([0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0]); //uvs mapping points on a texture to vertices of a geometry (positions array) to apply texture to the 3D object

  // Render targets to hold new data after 1st render pass
  //FBO intermediate texture to hold all the particles’ position data (Framebuffer Objects renders textures offscreen, to use as input to shader)
  const starPosRenderTarget = useFBO(
    starsTexSize, starsTexSize, { //width and height of texture
    minFilter: THREE.NearestFilter,  //texture filtering method when texture is minified (scaled down) - minFilter uses nearest texel when texture is reduced
    magFilter: THREE.NearestFilter,  //texture filtering method when texture is magnified (scaled up) - magFilter doesn't interpolate, texture can appear pixelated when stretched
    format: THREE.RGBAFormat,        //format of texture data - texture stores color data in RGBA format (8-bit per channel - range from 0 to 255 )
    stencilBuffer: false,            // used to apply masks or stencil operations for parts of the scene (eg post-processing or shadow mapping) - false means this is not  not used
    type: THREE.FloatType,           // texture will use floating-point values for each color channel - useful for high precision calculations (default is THREE.UnsignedByteType which is less precise but faster)
  });
  //FBO for stars colors
  const starColorRenderTarget = useFBO(
    starsTexSize, starsTexSize, { //width and height of texture
    minFilter: THREE.NearestFilter,  //texture filtering method when texture is minified (scaled down) - minFilter uses nearest texel when texture is reduced
    magFilter: THREE.NearestFilter,  //texture filtering method when texture is magnified (scaled up) - magFilter doesn't interpolate, texture can appear pixelated when stretched
    format: THREE.RGBAFormat,        //format of texture data - texture stores color data in RGBA format (8-bit per channel - range from 0 to 255 )
    stencilBuffer: false,            // used to apply masks or stencil operations for parts of the scene (eg post-processing or shadow mapping) - false means this is not  not used
    type: THREE.FloatType,           // texture will use floating-point values for each color channel - useful for high precision calculations (default is THREE.UnsignedByteType which is less precise but faster)
  });
  // starColorRenderTarget.texture.needsUpdate = true;

  // Generate our buffer (positions attributes array) with normalized coordinates
  const bufferPositions = useMemo(() => {
    const length = starsTexSize * starsTexSize;
    const particles = new Float32Array(length * 3);
    for (let i = 0; i < length; i++) {
      let i3 = i * 3;
      particles[i3 + 0] = (i % starsTexSize) / starsTexSize ;
      particles[i3 + 1] = i / starsTexSize / starsTexSize;
    }
    return particles;
  }, []);

  //uniforms for 2nd render pass
  const uniforms = useMemo(() => ({
    uPositions: {
      value: null,
    },
    uColors:{
      value: null,
    }
  }), [])

  //update the simulation in real-time (runs on every frame)
  useFrame((state) => {
    const {gl, clock} = state;

    //1st render pass for star positions
    gl.setRenderTarget(starPosRenderTarget); //set render target to texture we want to render to
    gl.clear();  //clear/resetframe buffer before rendering the scene
    gl.render(starsPosScene, camera);  //render the scene using current camera
    gl.setRenderTarget(null);  //reset render target to the default (the screen)

    //1st render pass for colors
    gl.setRenderTarget(starColorRenderTarget); 
    gl.clear();  
    gl.render(starsColScene, camera); 
    gl.setRenderTarget(null);  

    if (points.current && points.current.material) {
      
      //update uPositions of stars material with renderTarget texture (set texture of stars material (uStarPositions) to the FBO texture)
      // Read the position data from the texture field of the render target
      // and send that data to the final shaderMaterial via the `uPositions` uniform
      points.current.material.uniforms.uPositions.value = starPosRenderTarget.texture;   
      points.current.material.uniforms.uColors.value = starColorRenderTarget.texture;
      // starsMaterialRef.current.uniforms.uTime.value = clock.elapsedTime;
    }
  });

  return(
    <>
    {createPortal( //renders mesh with StarsMaterial to a different scene
        <mesh key="starPosMesh">
          {/* custom buffer geometry*/}
          <bufferGeometry>
            <bufferAttribute //pass geometry data (positions and uvs) to the mesh
              attach="attributes-position"
              count={positions.length/3}
              array={positions}
              itemSize={3}
            />
            <bufferAttribute 
              attach="attributes-uv"
              count={uvs.length/2}
              array={uvs}
              itemSize={2}
            />
          </bufferGeometry>
          {/* custom buffer material */}
          <primitive object={starsPosMaterial} />  {/*apply custom shader (starsMaterial) to the mesh */}
        </mesh>,
        starsPosScene   //render mesh to scene
      )}
      {createPortal(
        <mesh key="starColorMesh">
        {/* custom buffer geometry*/}
        <bufferGeometry>
          <bufferAttribute //pass geometry data (positions and uvs) to the mesh
            attach="attributes-position"
            count={positions.length/3}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute 
            attach="attributes-uv"
            count={uvs.length/2}
            array={uvs}
            itemSize={2}
          />
        </bufferGeometry>
        {/* custom buffer material */}
        <primitive object={starsColorMaterial} />  {/*apply custom shader (starsMaterial) to the mesh */}
      </mesh>,
      starsColScene
      )}  
      {/* render stars particles*/}
      <points ref={points} frustumCulled={true}>  {/*points defined by geometry -> star particles and material -> custom shader material */}
        <bufferGeometry>
          <bufferAttribute 
            attach="attributes-position"
            count={bufferPositions.length/3}
            array={bufferPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <shaderMaterial //material will use vertex shader to read in the FBO updated texture
            blending={THREE.AdditiveBlending}  //how pixels of an object interact with pixels already rendered to the framebuffer
                                               // additive blending: color vlaues of new pixels are added to existing pixels (eg for particle effects, light sources, glowing particles)
            depthWrite={false} //determines whether material should write to the depth buffer (used to determine visibility of pixels based on distance from camera) during rendering 
                               // false: material will not write to depth buffer
            fragmentShader={starsFragmentShader} //general fragment shader, vertex shader and uniforms
            vertexShader={starsVertexShader}
            uniforms={uniforms}
          />
      </points>
   
    </>
  );
};

const GasFBOParticles = () => {

  //pad the positions and colors arrays
  const gasPositionsA = useMemo(() => {
    const gasPositionsAr = new Float32Array(302500*4) //closest square to number of gas particles 302389
    for (let i = 0; i < 302389*4; i++) {
      gasPositionsAr[i] = gasPositions[i];
    }
    for (let i = 302389*4; i < 302500*4; i++) {
      gasPositionsAr[i] = 0.0;
    }
    return gasPositionsAr;
  }, []);

  const gasColorsA = useMemo(() => {
    const gasColorsAr = new Float32Array(302500*4) //closest square to number of gas particles 302389
    for (let i = 0; i < 302389*4; i++) {
      gasColorsAr[i] = gasColors[i];
    }
    for (let i = 302389*4; i < 302500*4; i++) {
      gasColorsAr[i] = 0.0;
    }
    return gasColorsAr;
  }, []);
  
  const gasCount = gasPositionsA.length/4;// 210020;        use 550x550 = 302500    //1024x1024=1048576
  const gasTexSize = Math.ceil(Math.sqrt(gasCount)); //459  //512 -> using powers of 2

  const gasPosScene = new THREE.Scene(); //scene to render position data to        
  const gasColScene = new THREE.Scene(); //scene to render color data to     
  const camera = new THREE.OrthographicCamera(-1,1,1,-1, // left, right, top, bottom boundaries of view frustrum
                                              1 / Math.pow(2, 53), 1); // near and far clipping planes (1 / Math.pow(2, 53) is the smallest positive normal number,  used when extremely small distances are needed)
  
  //Create textures to hold initial positions and colors data
  //Star Positions Data Texture:
  const gasPositionsTexture = new THREE.DataTexture( //can also use WebGL gl.createTexture()
    gasPositionsA,  
    gasTexSize,
    gasTexSize,
    THREE.RGBAFormat,
    THREE.FloatType
  );
  gasPositionsTexture.needsUpdate = true; //update texture every frame

  //Star Colors Data Texture:
  const gasColorsTexture = new THREE.DataTexture( //can also use WebGL gl.createTexture()
    gasColorsA,  
    gasTexSize,
    gasTexSize,
    THREE.RGBAFormat,
    THREE.FloatType
  );
  gasColorsTexture.needsUpdate = true; //update texture every frame

  // pass positions Data Texture as uniforms for 1st render pass
  const gasPosUniforms = 
  { 
    positions: {value: gasPositionsTexture},
  };

  const gasColorsUniforms = 
  { 
    colors: {value: gasColorsTexture},
  };
  

  //Stars Position Material (1st render pass)
  const gasPosMaterial = new THREE.ShaderMaterial({
    uniforms: gasPosUniforms,
    vertexShader: gasPosVertexShader,
    fragmentShader: gasPosFragmentShader,
  });

   //Stars Color Material (1st render pass)
   const gasColorMaterial = new THREE.ShaderMaterial({
    uniforms: gasColorsUniforms,
    vertexShader: gasColorsVertexShader,
    fragmentShader: gasColorsFragmentShader,
  });

  //FRAMEBUFFER to hold new data

  //Set up frame buffer
  const gasPoints = useRef(); //final rendered points (2nd render pass)
  // const starsMaterialRef = useRef();

  //quad geometry and uvs to run the shader on (in the FBO render)
  const positions = new Float32Array([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, 1, 1, 0, -1, 1, 0]); //particles represented as quads, defines vertex positions of geometry- positions to map uvs to
  const uvs = new Float32Array([0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0]); //uvs mapping points on a texture to vertices of a geometry (positions array) to apply texture to the 3D object

  // Render targets to hold new data after 1st render pass
  //FBO intermediate texture to hold all the particles’ position data (Framebuffer Objects renders textures offscreen, to use as input to shader)
  const gasPosRenderTarget = useFBO(
    gasTexSize, gasTexSize, { //width and height of texture
    minFilter: THREE.NearestFilter,  //texture filtering method when texture is minified (scaled down) - minFilter uses nearest texel when texture is reduced
    magFilter: THREE.NearestFilter,  //texture filtering method when texture is magnified (scaled up) - magFilter doesn't interpolate, texture can appear pixelated when stretched
    format: THREE.RGBAFormat,        //format of texture data - texture stores color data in RGBA format (8-bit per channel - range from 0 to 255 )
    stencilBuffer: false,            // used to apply masks or stencil operations for parts of the scene (eg post-processing or shadow mapping) - false means this is not  not used
    type: THREE.FloatType,           // texture will use floating-point values for each color channel - useful for high precision calculations (default is THREE.UnsignedByteType which is less precise but faster)
  });
  //FBO for stars colors
  const gasColorRenderTarget = useFBO(
    gasTexSize, gasTexSize, { //width and height of texture
    minFilter: THREE.NearestFilter,  //texture filtering method when texture is minified (scaled down) - minFilter uses nearest texel when texture is reduced
    magFilter: THREE.NearestFilter,  //texture filtering method when texture is magnified (scaled up) - magFilter doesn't interpolate, texture can appear pixelated when stretched
    format: THREE.RGBAFormat,        //format of texture data - texture stores color data in RGBA format (8-bit per channel - range from 0 to 255 )
    stencilBuffer: false,            // used to apply masks or stencil operations for parts of the scene (eg post-processing or shadow mapping) - false means this is not  not used
    type: THREE.FloatType,           // texture will use floating-point values for each color channel - useful for high precision calculations (default is THREE.UnsignedByteType which is less precise but faster)
  });
  // starColorRenderTarget.texture.needsUpdate = true;

  // Generate our buffer (positions attributes array) with normalized coordinates
  const bufferPositions = useMemo(() => {
    const length = gasTexSize * gasTexSize;
    const particles = new Float32Array(length * 3);
    for (let i = 0; i < length; i++) {
      let i3 = i * 3;
      particles[i3 + 0] = (i % gasTexSize) / gasTexSize ;
      particles[i3 + 1] = i / gasTexSize / gasTexSize;
    }
    return particles;
  }, []);

  //uniforms for 2nd render pass
  const uniforms = useMemo(() => ({
    uPositions: {
      value: null,
    },
    uColors:{
      value: null,
    }
  }), [])

  //update the simulation in real-time (runs on every frame)
  useFrame((state) => {
    const {gl, clock} = state;

    //1st render pass for star positions
    gl.setRenderTarget(gasPosRenderTarget); //set render target to texture we want to render to
    gl.clear();  //clear/resetframe buffer before rendering the scene
    gl.render(gasPosScene, camera);  //render the scene using current camera
    gl.setRenderTarget(null);  //reset render target to the default (the screen)

    //1st render pass for colors
    gl.setRenderTarget(gasColorRenderTarget); 
    gl.clear();  
    gl.render(gasColScene, camera); 
    gl.setRenderTarget(null);  

    if (gasPoints.current && gasPoints.current.material) {
      
      //update uPositions of stars material with renderTarget texture (set texture of stars material (uStarPositions) to the FBO texture)
      // Read the position data from the texture field of the render target
      // and send that data to the final shaderMaterial via the `uPositions` uniform
      
      // console.log("star pos render target",starPosRenderTarget.texture);
      // console.log("star color render target",starColorRenderTarget.texture);
      gasPoints.current.material.uniforms.uPositions.value = gasPosRenderTarget.texture;   
      gasPoints.current.material.uniforms.uColors.value = gasColorRenderTarget.texture;
      // starsMaterialRef.current.uniforms.uTime.value = clock.elapsedTime;
    }
  });


  return(
    <>
    {createPortal( //renders mesh with StarsMaterial to a different scene
        <mesh key="starPosMesh">
          {/* custom buffer geometry*/}
          <bufferGeometry>
            <bufferAttribute //pass geometry data (positions and uvs) to the mesh
              attach="attributes-position"
              count={positions.length/3}
              array={positions}
              itemSize={3}
            />
            <bufferAttribute 
              attach="attributes-uv"
              count={uvs.length/2}
              array={uvs}
              itemSize={2}
            />
          </bufferGeometry>
          {/* custom buffer material */}
          <primitive object={gasPosMaterial} />  {/*apply custom shader (starsMaterial) to the mesh */}
        </mesh>,
        gasPosScene   //render mesh to scene
      )}
      {createPortal(
        <mesh key="starColorMesh">
        {/* custom buffer geometry*/}
        <bufferGeometry>
          <bufferAttribute //pass geometry data (positions and uvs) to the mesh
            attach="attributes-position"
            count={positions.length/3}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute 
            attach="attributes-uv"
            count={uvs.length/2}
            array={uvs}
            itemSize={2}
          />
        </bufferGeometry>
        {/* custom buffer material */}
        <primitive object={gasColorMaterial} />  {/*apply custom shader (starsMaterial) to the mesh */}
      </mesh>,
      gasColScene
      )}  
      {/* render stars particles*/}
      <points ref={gasPoints} frustumCulled={true}>  {/*points defined by geometry -> star particles and material -> custom shader material */}
        <bufferGeometry>
          <bufferAttribute 
            attach="attributes-position"
            count={bufferPositions.length/3}
            array={bufferPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <shaderMaterial //material will use vertex shader to read in the FBO updated texture
            blending={THREE.AdditiveBlending}  //how pixels of an object interact with pixels already rendered to the framebuffer
                                               // additive blending: color vlaues of new pixels are added to existing pixels (eg for particle effects, light sources, glowing particles)
            depthWrite={false} //determines whether material should write to the depth buffer (used to determine visibility of pixels based on distance from camera) during rendering 
                               // false: material will not write to depth buffer
            fragmentShader={gasFragmentShader} //general fragment shader, vertex shader and uniforms
            vertexShader={gasVertexShader}
            uniforms={uniforms}
          />
      </points>
   
    </>
  );
};




const BlackHoleParticlesScene = () => {
  

  return (
    <section className="canvas-container">
      <Canvas className="canvas" camera={{position:[0,0,10], rotation:[0,0,0]}}>
        <color attach="background" args={["#000000"]} />
        <ambientLight intensity={0.5} />
        <StarFBOParticles />
        <GasFBOParticles />
        <OrbitControls />
        
      </Canvas>
    </section>
  );
};

export default BlackHoleParticlesScene;