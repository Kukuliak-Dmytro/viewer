import React, { useContext, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/Addons.js';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import { useFileContext } from './App';

const ThreeDViewer: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [renderer] = useState(() => new THREE.WebGLRenderer({ antialias: true }));
  const [scene] = useState(() => new THREE.Scene());
  const [camera] = useState(() => new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 5000));
  const [controls, setControls] = useState<OrbitControls | null>(null);
  const { file } = useFileContext();
  const [currentMesh, setCurrentMesh] = useState<THREE.Mesh | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Set up the scene
    scene.background = new THREE.Color(0xDDDDDD);

    // Set up the camera
    camera.rotation.y = 45 / 180 * Math.PI;
    camera.position.set(800, 100, 1000);

    // Set up the lights
    const hlight = new THREE.AmbientLight(0x404040, 100);
    scene.add(hlight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 100);
    directionalLight.position.set(0, 1, 0);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const lights = [
      new THREE.PointLight(0xc4c4c4, 0, 300, 500),
      new THREE.PointLight(0xc4c4c4, 500, 100, 0),
      new THREE.PointLight(0xc4c4c4, 0, 100, -500),
      new THREE.PointLight(0xc4c4c4, -500, 300, 0),
    ];
    lights.forEach(light => scene.add(light));

    // Set up the renderer
    renderer.setSize(window.innerWidth*0.5, window.innerHeight*0.75);
    mount.appendChild(renderer.domElement);

    // Set up the controls
    const orbitControls = new OrbitControls(camera, renderer.domElement);
    setControls(orbitControls);

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth*0.5, window.innerHeight*0.75);
      renderer.render(scene, camera);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      orbitControls.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, [camera, renderer, scene]);

  useEffect(() => {
    if (controls) {
      const handleControlChange = () => {
        renderer.render(scene, camera);
      };
      controls.addEventListener('change', handleControlChange);
      return () => {
        controls.removeEventListener('change', handleControlChange);
      };
    }
  }, [controls, renderer, scene, camera]);

  useEffect(() => {
    if (file) {
      const loader = new STLLoader();
      const reader = new FileReader();
      reader.onload = (event) => {
        const contents = event.target?.result;
        if (contents) {
          if (currentMesh) {
            scene.remove(currentMesh);
          }
          const geometry = loader.parse(contents);
          const material = new THREE.MeshMatcapMaterial({
            color: 0xffffff,
          });
          const mesh = new THREE.Mesh(geometry, material);
          mesh.scale.set(5, 5, 5);
          scene.add(mesh);
          setCurrentMesh(mesh);
          renderer.render(scene, camera);
          animate();
        }
      };
      reader.readAsArrayBuffer(file);
    }
  }, [file]);

  const animate = () => {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  };

  return <div ref={mountRef} className='stl-viewer' />;
};

export default ThreeDViewer;