import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface ToonCat3DProps {
  width?: number;
  height?: number;
  phase?: string;
  className?: string;
}

export const ToonCat3D: React.FC<ToonCat3DProps> = ({
  width = 110,
  height = 90,
  phase = 'hopping',
  className = '',
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const phaseRef = useRef<string>(phase);
  const [loadError, setLoadError] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  // Keep phase in ref so changing phases doesn't destroy & recreate the 3D scene / reload GLB
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let animationFrameId: number;
    let renderer: THREE.WebGLRenderer | null = null;
    let mixer: THREE.AnimationMixer | null = null;
    const clock = new THREE.Clock();

    try {
      // 1. Scene
      const scene = new THREE.Scene();

      // 2. Camera - wide clipping range [0.1, 1000] so model is never clipped
      const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
      camera.position.set(0, 0.35, 3.4);
      camera.lookAt(0, 0.05, 0);

      // 3. WebGL Renderer with transparency & SRGB color space
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.4;

      container.appendChild(renderer.domElement);

      // 4. Vibrant studio lighting for the cute toon cat
      const ambientLight = new THREE.AmbientLight(0xffffff, 2.6);
      scene.add(ambientLight);

      const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
      keyLight.position.set(2.5, 4, 3.5);
      scene.add(keyLight);

      const fillLight = new THREE.DirectionalLight(0xffeedd, 1.4);
      fillLight.position.set(-2.5, 2, 2);
      scene.add(fillLight);

      const rimLight = new THREE.DirectionalLight(0xc084fc, 1.8);
      rimLight.position.set(0, 3, -3);
      scene.add(rimLight);

      // 5. Pivot group for clean centering and rotation around geometric center
      const pivot = new THREE.Group();
      scene.add(pivot);

      // 6. Resilient model path resolution
      const modelUrl =
        typeof window !== 'undefined' && window.location.protocol === 'file:'
          ? './characters/toon_cat_free.glb'
          : '/characters/toon_cat_free.glb';

      const loader = new GLTFLoader();

      loader.load(
        modelUrl,
        (gltf) => {
          const model = gltf.scene;

          // Force matrix hierarchy updates
          model.updateMatrixWorld(true);

          // Compute accurate bounding box of the cat
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());

          // Normalize size to exactly 2.1 units so it fills the view beautifully
          const maxDim = Math.max(size.x, size.y, size.z);
          const targetSize = 2.1;
          const scale = targetSize / (maxDim || 1);

          model.scale.setScalar(scale);

          // Center the cat model inside the pivot so pivot (0,0,0) is its exact center
          model.position.x = -center.x * scale;
          model.position.y = -center.y * scale + 0.05;
          model.position.z = -center.z * scale;

          pivot.add(model);

          // Configure double-sided materials & smooth shading
          model.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              if (mesh.material) {
                const mat = mesh.material as THREE.MeshStandardMaterial;
                mat.side = THREE.DoubleSide;
                mat.roughness = 0.55;
                mat.metalness = 0.05;
                mat.needsUpdate = true;
              }
            }
          });

          // Setup the walking animation cycle ('Scene')
          if (gltf.animations && gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(model);
            const walkAction = mixer.clipAction(gltf.animations[0]);
            // Energetic trotting cycle across the taskbar icons
            walkAction.setEffectiveTimeScale(1.35);
            walkAction.play();
          }

          setIsLoaded(true);
        },
        undefined,
        (err) => {
          console.error('Failed to load toon_cat_free.glb:', err);
          setLoadError(true);
        }
      );

      // 7. 3D Animation Loop
      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);

        const delta = clock.getDelta();
        const time = clock.getElapsedTime();

        if (mixer) {
          mixer.update(delta);
        }

        const currentPhase = phaseRef.current;

        // Animate the pivot according to runway phase
        if (currentPhase === 'black-hole-expand') {
          // Inside the cosmic singularity
          pivot.scale.setScalar(0.01);
        } else if (currentPhase === 'character-emerge') {
          // Playfully spinning out of the cosmic black hole
          pivot.scale.setScalar(1.0);
          pivot.rotation.y = time * 5;
          pivot.rotation.x = Math.sin(time * 3) * 0.25;
          pivot.position.y = Math.sin(time * 6) * 0.1;
        } else if (currentPhase === 'hopping') {
          pivot.scale.setScalar(1.0);
          // Face rightwards along the taskbar track, tilted 20° toward camera for cute 3D profile
          pivot.rotation.y = Math.PI / 2 - 0.32;
          pivot.rotation.z = -0.04;
          // Natural running trot pitch & vertical stride bounce
          pivot.rotation.x = Math.sin(time * 9) * 0.08;
          pivot.position.y = Math.abs(Math.sin(time * 9)) * 0.12;
        } else if (currentPhase === 'leap-down') {
          // Energetic pounce leap
          pivot.scale.setScalar(1.15);
          pivot.rotation.y = Math.PI / 2 - 0.1;
          pivot.rotation.x = 0.28;
          pivot.position.y = 0.2;
        } else {
          // Idle trotting
          pivot.scale.setScalar(1.0);
          pivot.rotation.y = Math.PI / 2 - 0.32 + Math.sin(time * 2) * 0.08;
          pivot.rotation.z = 0;
          pivot.rotation.x = Math.sin(time * 4) * 0.05;
          pivot.position.y = Math.abs(Math.sin(time * 4)) * 0.06;
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
  }, [width, height]); // Loaded ONCE per width/height, NOT re-triggered by phase changes!

  if (loadError) {
    return (
      <div className={`toon-cat-fallback ${className}`}>
        <span style={{ fontSize: '38px' }}>🐱</span>
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      className={`toon-cat-3d-wrap ${className}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isLoaded ? 1 : 0.7,
        transition: 'opacity 0.25s ease',
      }}
    />
  );
};
