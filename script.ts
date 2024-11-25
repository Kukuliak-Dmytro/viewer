import * as THREE from 'three';
import { OrbitControls, STLLoader, TransformControls } from 'three/examples/jsm/Addons.js';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';

let renderer, scene, camera, controls, transformControls, currentMesh, inputfield, inputValue;
let size = new THREE.Vector3(100, 1, 100);

function init() {
  const canvas = document.getElementById('canvas');

  renderer = new THREE.WebGLRenderer({ antialias: true });
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 1, 1500);

  scene.background = new THREE.Color(0xDDDDDD);

  camera.position.set(-150, 100, 150);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  const hlight = new THREE.AmbientLight(0x404040, 100);
  scene.add(hlight);
  controls = new OrbitControls(camera, renderer.domElement);
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
  transformControls = new TransformControls(camera, renderer.domElement);

  // Disable OrbitControls when using TransformControls
  transformControls.addEventListener('mouseDown', () => {
    controls.enabled = false;
  });
  transformControls.addEventListener('mouseUp', () => {
    controls.enabled = true;
  });

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

function addInputEventListener(elementId: string, axis: 'x' | 'y' | 'z' | 'scale' | 'color') {
  document.getElementById(elementId)?.addEventListener('input', () => {
    inputfield = document.getElementById(elementId) as HTMLInputElement;
    inputValue = inputfield ? parseFloat(inputfield.value) : 0;
    if (currentMesh) {
      if (axis === 'scale') {
        currentMesh.scale.set(inputValue, inputValue, inputValue);
      } else if (axis === 'color') {
        const color = inputfield.value;
        (currentMesh.material as THREE.MeshMatcapMaterial).color.set(color);
      } else {
        currentMesh.rotation[axis] = inputValue / 180 * Math.PI;
      }
    }
  });
}
addInputEventListener('rotation-x', 'x');
addInputEventListener('rotation-y', 'y');
addInputEventListener('rotation-z', 'z');
addInputEventListener('scale', 'scale');
addInputEventListener('color', 'color');
export function loadFile() {
  const fileInput = document.getElementById('file-input') as HTMLInputElement;
  const file = fileInput!.files![0];

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
      currentMesh = new THREE.Mesh(geometry, material);
      currentMesh.position.set(0, 0, 0);

      geometry.computeBoundingBox();
      const boundingBox = geometry.boundingBox;
      size = new THREE.Vector3();
      boundingBox?.getSize(size);
      console.log(size);
      transformControls.size = Math.max(Math.max(size.x, size.y, size.z) * 0.025,1);
      transformControls.minY = -5;
      transformControls.attach(currentMesh);
      scene.add(transformControls.getHelper());
      scene.add(currentMesh);
      renderer.render(scene, camera);

      updateFloorSize(); // Update the floor size based on the new model size
    }
  };
  reader.readAsArrayBuffer(file);
}

export function closeFile() {
  scene.remove(currentMesh);
  transformControls.detach();
}

function saveMesh(mesh: THREE.Mesh, fileName: string) {
  const exporter = new STLExporter();
  const stlString = exporter.parse(mesh);

  const blob = new Blob([stlString], { type: 'application/octet-stream' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();

  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 0);
}

document.getElementById('save-button')?.addEventListener('click', () => {
  if (currentMesh) {
    saveMesh(currentMesh, 'modified_mesh.stl');
  } else {
    console.log('No mesh to save');
  }
});

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

function createFloor() {
  const pos = { x: 0, y: -1, z: 0 };
  const blockPlane = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshPhongMaterial({ color: 0x8B4513 })
  );
  blockPlane.position.set(pos.x, pos.y, pos.z);
  blockPlane.scale.set(size.x, size.y, size.z);
  blockPlane.castShadow = true;
  blockPlane.receiveShadow = true;
  blockPlane.name = 'floor'; // Set the name of the floor object
  scene.add(blockPlane);
  blockPlane.userData.ground = true;
}

function updateFloorSize() {
  const minSize = new THREE.Vector3(100, 1, 100);
  const floorSize = new THREE.Vector3(
    Math.max(size.x*5, size.y*5,minSize.x),
    1,
    Math.max(size.x*5, size.y*5,minSize.x)
  );
  const floor = scene.getObjectByName('floor') as THREE.Mesh;
  if (floor) {
    floor.scale.set(floorSize.x, floorSize.y, floorSize.z);
  }
}

document.addEventListener('DOMContentLoaded', init);