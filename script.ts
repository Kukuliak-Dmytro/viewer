import * as THREE from 'three';
import { OrbitControls,STLLoader, TransformControls } from 'three/examples/jsm/Addons.js';

let renderer, scene, camera, controls, transformControls, currentMesh;

function init() {
  const canvas = document.getElementById('canvas');
  
  renderer = new THREE.WebGLRenderer({ antialias: true });
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 1500);

  scene.background = new THREE.Color(0xDDDDDD);

  camera.position.set(-35, 70, 100);
  camera.lookAt(new THREE.Vector3(0, 0, 0));


  const hlight = new THREE.AmbientLight(0x404040, 100);
  scene.add(hlight);
  controls=new OrbitControls(camera,renderer.domElement)
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

  renderer.setSize(window.innerWidth * 0.5, window.innerHeight * 0.75);
  canvas!.appendChild(renderer.domElement);

  createFloor();
  window.addEventListener('resize', handleResize);

  animate();
}

function handleResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth * 0.5, window.innerHeight * 0.75);
  renderer.render(scene, camera);
}

 export function loadFile() {
  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  const file = fileInput!.files![0];
  const rotationInput = document.getElementById('rotation') as HTMLInputElement;
  const rotation = rotationInput ? parseInt(rotationInput.value) : 0;

  if (!file) {
    scene.remove(currentMesh);
    transformControls?.detach();
    return;
  }

  const loader = new STLLoader();
  const reader = new FileReader();
  reader.onload = (event) => {
    const contents = event.target?.result;
    if (contents) {
      if (currentMesh) {
        scene.remove(currentMesh);
        transformControls?.detach();
      }
      const geometry = loader.parse(contents);
      const material = new THREE.MeshMatcapMaterial({ color: 0xffffff });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.scale.set(0.1, 0.1, 0.1);
      mesh.position.set(0, 3, 0);
      scene.add(mesh);
      currentMesh = mesh;
      renderer.render(scene, camera);
    }
  };
  reader.readAsArrayBuffer(file);

  if (currentMesh) {
    currentMesh.rotation.x = rotation * (Math.PI / 180);
    renderer.render(scene, camera);
  }
}

export function closeFile(){
  scene.remove(currentMesh)
}
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

function createFloor() {
  let pos = { x: 0, y: -1, z: 0 };
  let scale = { x: 100, y: 1, z: 100 };
  let blockPlane = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshPhongMaterial({ color: 0x8B4513 }));
  blockPlane.position.set(pos.x, pos.y, pos.z);
  blockPlane.scale.set(scale.x, scale.y, scale.z);
  blockPlane.castShadow = true;
  blockPlane.receiveShadow = true;
  scene.add(blockPlane);
  blockPlane.userData.ground = true;
}

document.addEventListener('DOMContentLoaded', init);
