import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { CharacterState } from '../types';

interface Character3DCanvasProps {
  state?: CharacterState;
  width?: number;
  height?: number;
  isHovered?: boolean;
  isBounceActive?: boolean;
  mode?: 'companion' | 'runway';
  phase?: string;
  className?: string;
}

export const Character3DCanvas: React.FC<Character3DCanvasProps> = ({
  state = 'idle',
  width = 250,
  height = 320,
  isHovered = false,
  isBounceActive = false,
  mode = 'companion',
  phase = 'hopping',
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [loadError, setLoadError] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Keep state, hover, and interaction values in refs for 60fps render loop
  const stateRef = useRef<CharacterState>(state);
  const isHoveredRef = useRef<boolean>(isHovered);
  const isBounceRef = useRef<boolean>(isBounceActive);
  const modeRef = useRef<'companion' | 'runway'>(mode);
  const phaseRef = useRef<string>(phase);
  const mousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    isHoveredRef.current = isHovered;
  }, [isHovered]);

  useEffect(() => {
    isBounceRef.current = isBounceActive;
  }, [isBounceActive]);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  // Window-wide cursor tracking for life-like mouse gaze
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -(e.clientY / window.innerHeight) * 2 + 1;
      mousePosRef.current = { x: nx, y: ny };
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let animationFrameId: number;
    let renderer: THREE.WebGLRenderer | null = null;
    const clock = new THREE.Clock();

    // Spring physics state for snappy squashing, stretching, and click reactions
    const spring = {
      scaleY: 1,
      scaleX: 1,
      scaleZ: 1,
      velY: 0,
      velX: 0,
      velZ: 0,
      targetY: 1,
      targetX: 1,
      targetZ: 1,
    };

    try {
      // 1. Scene
      const scene = new THREE.Scene();

      // 2. Camera: tailored vertical framing for full body
      const camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
      camera.position.set(0, 0.08, 3.4);
      camera.lookAt(0, 0.02, 0);

      // 3. WebGL Renderer with alpha transparency & SRGB color space
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.35;

      container.appendChild(renderer.domElement);

      // 4. Studio Lighting System: Key, Fill, Rim & Ground Uplight
      const ambientLight = new THREE.AmbientLight(0xffffff, 2.6);
      scene.add(ambientLight);

      const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
      keyLight.position.set(2.5, 4.5, 3.5);
      scene.add(keyLight);

      const fillLight = new THREE.DirectionalLight(0xffeedd, 1.4);
      fillLight.position.set(-2.5, 2.5, 2.5);
      scene.add(fillLight);

      const rimLight = new THREE.DirectionalLight(0xc084fc, 1.8);
      rimLight.position.set(0, 3.5, -3.5);
      scene.add(rimLight);

      const groundLight = new THREE.DirectionalLight(0x818cf8, 0.8);
      groundLight.position.set(0, -3, 2);
      scene.add(groundLight);

      // 5. Multi-Tier Hierarchical Animation Rig
      // rootPivot (body position, weight shift, jump elevation)
      const rootPivot = new THREE.Group();
      scene.add(rootPivot);

      // spinePivot (breathing expansion, posture tilt, upper body lean)
      const spinePivot = new THREE.Group();
      rootPivot.add(spinePivot);

      // 6. Resilient model URL
      const modelUrl =
        typeof window !== 'undefined' && window.location.protocol === 'file:'
          ? './characters/character.glb'
          : '/characters/character.glb';

      const loader = new GLTFLoader();

      // Custom time uniform for GPU vertex breathing shader
      const customUniforms = {
        uTime: { value: 0 },
        uBreatheIntensity: { value: 1.0 },
      };

      loader.load(
        modelUrl,
        (gltf) => {
          const model = gltf.scene;

          // Compute normals & attach organic GPU vertex shader breathing displacement
          model.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              if (mesh.geometry && !mesh.geometry.attributes.normal) {
                mesh.geometry.computeVertexNormals();
              }
              if (mesh.material) {
                const mat = mesh.material as THREE.MeshStandardMaterial;
                mat.side = THREE.DoubleSide;
                mat.roughness = 0.72;
                mat.metalness = 0.05;

                // GPU Vertex Shader Hook: Organic breathing expansion in the upper torso
                mat.onBeforeCompile = (shader) => {
                  shader.uniforms.uTime = customUniforms.uTime;
                  shader.uniforms.uBreatheIntensity = customUniforms.uBreatheIntensity;

                  shader.vertexShader = `
                    uniform float uTime;
                    uniform float uBreatheIntensity;
                    ${shader.vertexShader}
                  `;

                  shader.vertexShader = shader.vertexShader.replace(
                    '#include <begin_vertex>',
                    `
                    #include <begin_vertex>
                    // Upper chest/ribcage breathing expansion between Y: -0.2 and Y: 0.65
                    float chestWeight = smoothstep(-0.25, 0.25, position.y) * (1.0 - smoothstep(0.55, 0.85, position.y));
                    float breatheCycle = sin(uTime * 2.3);
                    float expansion = chestWeight * breatheCycle * 0.018 * uBreatheIntensity;
                    transformed += normal * expansion;
                    `
                  );
                };

                mat.needsUpdate = true;
              }
            }
          });

          // Measure accurate bounding box
          model.updateMatrixWorld(true);
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());

          // Normalize character height to 2.15 units
          const maxDim = Math.max(size.x, size.y, size.z);
          const targetSize = 2.15;
          const scale = targetSize / (maxDim || 1);

          model.scale.setScalar(scale);

          // Center inside spinePivot so (0,0,0) is character's geometric center
          model.position.x = -center.x * scale;
          model.position.y = -center.y * scale;
          model.position.z = -center.z * scale;

          spinePivot.add(model);
          setIsLoaded(true);
        },
        undefined,
        (err) => {
          console.error('Failed to load character.glb:', err);
          setLoadError(true);
        }
      );

      // 7. Dynamic Animation & Physics Engine
      let currentGazeY = 0;
      let currentGazeX = 0;
      let lastBounceState = false;

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);

        const delta = Math.min(clock.getDelta(), 0.1);
        const time = clock.getElapsedTime();
        customUniforms.uTime.value = time;

        const curState = stateRef.current;
        const hovered = isHoveredRef.current;
        const bouncing = isBounceRef.current;
        const mouse = mousePosRef.current;
        const curMode = modeRef.current;
        const curPhase = phaseRef.current;

        // Trigger spring impulse when click bounce begins
        if (bouncing && !lastBounceState) {
          spring.scaleY = 0.78; // Instant squash
          spring.scaleX = 1.15; // Stretch out
          spring.scaleZ = 1.15;
          spring.velY = 4.2;    // Upward spring momentum
        }
        lastBounceState = bouncing;

        // Spring-Damper Physics calculation
        const k = 160; // Stiffness
        const d = 11;  // Damping
        const forceY = -k * (spring.scaleY - spring.targetY) - d * spring.velY;
        const forceX = -k * (spring.scaleX - spring.targetX) - d * spring.velX;
        const forceZ = -k * (spring.scaleZ - spring.targetZ) - d * spring.velZ;

        spring.velY += forceY * delta;
        spring.velX += forceX * delta;
        spring.velZ += forceZ * delta;

        spring.scaleY += spring.velY * delta;
        spring.scaleX += spring.velX * delta;
        spring.scaleZ += spring.velZ * delta;

        // Smooth Mouse Gaze Tracking with realistic human limits
        const targetGazeY = mouse.x * 0.28 + (hovered ? 0.08 : 0);
        const targetGazeX = -mouse.y * 0.14 + (hovered ? 0.06 : 0);
        currentGazeY += (targetGazeY - currentGazeY) * 0.07;
        currentGazeX += (targetGazeX - currentGazeX) * 0.07;

        // =====================================================================
        // MODE A: RUNWAY TASKBAR HOPPING / TROTTING MODE
        // =====================================================================
        if (curMode === 'runway') {
          if (curPhase === 'black-hole-expand') {
            rootPivot.scale.setScalar(0.01);
          } else if (curPhase === 'character-emerge') {
            rootPivot.scale.setScalar(1.0);
            rootPivot.rotation.y = time * 5;
            rootPivot.rotation.x = Math.sin(time * 3) * 0.2;
            rootPivot.position.y = Math.sin(time * 6) * 0.1;
          } else if (curPhase === 'hopping') {
            // Dynamic running stride: forward pitch, rhythmic vertical hop, 3/4 isometric profile
            rootPivot.scale.setScalar(1.0);
            rootPivot.rotation.y = Math.PI / 2 - 0.28; // Face direction of taskbar
            rootPivot.rotation.x = 0.12 + Math.sin(time * 10) * 0.08; // Forward run lean
            rootPivot.rotation.z = Math.cos(time * 10) * 0.05;
            rootPivot.position.y = Math.abs(Math.sin(time * 10)) * 0.18; // Hop stride
          } else if (curPhase === 'leap-down') {
            rootPivot.scale.setScalar(1.15);
            rootPivot.rotation.y = Math.PI / 2 - 0.1;
            rootPivot.rotation.x = 0.32;
            rootPivot.position.y = 0.25;
          }
          if (renderer) renderer.render(scene, camera);
          return;
        }

        // =====================================================================
        // MODE B: DESKTOP COMPANION INTERACTIVE ANIMATION ENGINE
        // =====================================================================

        // 1. Organic Weight-Shift Sway (Body shifts balance between feet)
        const weightShiftX = Math.sin(time * 1.3) * 0.035;
        const pelvicTiltZ = -Math.sin(time * 1.3) * 0.018;

        // 2. Natural Vertical Breathing Oscillation
        const breatheY = Math.cos(time * 2.3) * 0.022;

        // 3. Apply Base Spring Scale to spinePivot
        spinePivot.scale.set(spring.scaleX, spring.scaleY, spring.scaleZ);

        // 4. State-Specific Motion Choreography
        if (curState === 'talking') {
          // Expressive Talking: energetic conversational nods, slight gestures, rhythmic emphasis
          const talkCycle = Math.sin(time * 7);
          const talkGesture = Math.cos(time * 3.5) * 0.05;

          rootPivot.position.x = weightShiftX;
          rootPivot.position.y = breatheY + Math.abs(talkCycle) * 0.035;
          rootPivot.rotation.y = currentGazeY + talkGesture;
          rootPivot.rotation.x = currentGazeX + (talkCycle * 0.04) + 0.04; // Engaged forward lean
          rootPivot.rotation.z = pelvicTiltZ + Math.sin(time * 3.5) * 0.03;

          spinePivot.rotation.x = Math.sin(time * 7) * 0.03;
          spinePivot.rotation.z = -pelvicTiltZ;

        } else if (curState === 'happy') {
          // Cheerful Dance / Joyous Sway: rhythmic rocking, cheerful head bobs
          const happySway = Math.sin(time * 3.2);
          const happyBob = Math.abs(Math.sin(time * 6.4)) * 0.05;

          rootPivot.position.x = Math.sin(time * 3.2) * 0.05;
          rootPivot.position.y = breatheY + happyBob;
          rootPivot.rotation.y = currentGazeY + happySway * 0.08;
          rootPivot.rotation.x = currentGazeX - 0.02;
          rootPivot.rotation.z = happySway * 0.06;

          spinePivot.rotation.z = -happySway * 0.03;

        } else if (curState === 'excited') {
          // Celebratory Bounces & Victory Jumps
          const jumpPhase = Math.sin(time * 7.5);
          const jumpHeight = Math.max(0, jumpPhase) * 0.12;

          rootPivot.position.x = Math.sin(time * 4) * 0.04;
          rootPivot.position.y = jumpHeight;
          rootPivot.rotation.y = currentGazeY + Math.sin(time * 5) * 0.12;
          rootPivot.rotation.x = currentGazeX + Math.sin(time * 7.5) * 0.06;
          rootPivot.rotation.z = Math.sin(time * 7.5) * 0.05;

          spinePivot.rotation.z = 0;

        } else if (curState === 'thinking') {
          // Contemplative Pondering: chin-up pensive pose, tilted gaze looking upward
          rootPivot.position.x = weightShiftX * 0.5;
          rootPivot.position.y = breatheY;
          rootPivot.rotation.y = currentGazeY + 0.12;
          rootPivot.rotation.x = currentGazeX - 0.08; // Looks up thoughtfully
          rootPivot.rotation.z = 0.07;               // Pensive head tilt

          spinePivot.rotation.x = -0.03;
          spinePivot.rotation.z = -0.03;

        } else if (curState === 'surprised') {
          // Sudden Alert Recoil: startled backward jump, alert upright stance
          rootPivot.position.x = 0;
          rootPivot.position.y = 0.08 + Math.sin(time * 12) * 0.01;
          rootPivot.rotation.y = currentGazeY;
          rootPivot.rotation.x = currentGazeX - 0.07; // Recoiled back
          rootPivot.rotation.z = 0;

          spinePivot.rotation.x = 0.04;
          spinePivot.rotation.z = 0;

        } else if (curState === 'sleepy') {
          // Drowsy Nodding Off: slow sinking forward tilt, occasional gentle recovery
          const nodOff = (time * 0.5) % (Math.PI * 2);
          const drowsyPitch = 0.14 + Math.sin(nodOff) * 0.08;

          rootPivot.position.x = weightShiftX * 0.4;
          rootPivot.position.y = breatheY * 0.5 - 0.04;
          rootPivot.rotation.y = currentGazeY * 0.4;
          rootPivot.rotation.x = currentGazeX + drowsyPitch;
          rootPivot.rotation.z = pelvicTiltZ * 0.5;

          spinePivot.rotation.x = 0.06;
          spinePivot.rotation.z = 0;

        } else {
          // Natural Idle Life Simulation: breathing, weight shifting, gentle gaze follow
          rootPivot.position.x = weightShiftX;
          rootPivot.position.y = breatheY;
          rootPivot.rotation.y = currentGazeY;
          rootPivot.rotation.x = currentGazeX;
          rootPivot.rotation.z = pelvicTiltZ;

          // Torso posture compensation (spine counter-tilts to keep head level and natural)
          spinePivot.rotation.z = -pelvicTiltZ * 0.8 + (hovered ? 0.04 : 0);
          spinePivot.rotation.x = (hovered ? 0.04 : 0);
        }

        if (renderer) {
          renderer.render(scene, camera);
        }
      };

      animate();
    } catch (err) {
      console.error('WebGL initialization error:', err);
      setLoadError(true);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (renderer) {
        renderer.dispose();
        if (container.contains(renderer.domElement)) {
          container.removeChild(renderer.domElement);
        }
      }
    };
  }, [width, height]);

  if (loadError) {
    return (
      <div className={`miko-3d-fallback ${className}`}>
        <span style={{ fontSize: '42px' }}>👤</span>
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className={`miko-character-3d-wrap ${className}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isLoaded ? 1 : 0.6,
        transition: 'opacity 0.3s ease',
      }}
    />
  );
};
