import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.158.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.158.0/examples/jsm/loaders/GLTFLoader.js';

let renderer, scene, camera, controls, mixer, clock, currentModel;
const rootId = 'three-root';

function init() {
  const root = document.getElementById(rootId);
  if (!root) return;
  // cleanup
  root.innerHTML = '';

  const width = root.clientWidth || 640;
  const height = 420;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x071428);

  camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.set(0, 1.6, 3);

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(width, height);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  root.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 1, 0);
  controls.update();

  const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
  scene.add(hemi);
  const dir = new THREE.DirectionalLight(0xffffff, 0.8);
  dir.position.set(5, 10, 7.5);
  scene.add(dir);

  const grid = new THREE.GridHelper(10, 20, 0x2a2f3a, 0x0b1220);
  grid.position.y = 0;
  scene.add(grid);

  clock = new THREE.Clock();

  animate();
}

function animate() {
  requestAnimationFrame(animate);
  const dt = clock ? clock.getDelta() : 0.016;
  if (mixer) mixer.update(dt);
  if (renderer && camera) renderer.render(scene, camera);
}

async function loadModel(url) {
  if (!scene) init();
  // remove existing
  if (currentModel) {
    scene.remove(currentModel);
    currentModel.traverse((c) => {
      if (c.isMesh) c.geometry.dispose();
    });
    mixer = null;
    currentModel = null;
  }

  const loader = new GLTFLoader();
  return new Promise((resolve, reject) => {
    loader.load(url, (gltf) => {
      currentModel = gltf.scene || gltf.scenes[0];
      currentModel.traverse((c) => {
        if (c.isMesh) {
          c.castShadow = true;
          c.receiveShadow = true;
          if (c.material) c.material.metalness = 0;
        }
      });
      // center
      const box = new THREE.Box3().setFromObject(currentModel);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      currentModel.position.x += (currentModel.position.x - center.x);
      currentModel.position.y += -box.min.y;

      scene.add(currentModel);

      // animations
      if (gltf.animations && gltf.animations.length) {
        mixer = new THREE.AnimationMixer(currentModel);
        mixer._clips = gltf.animations;
      }

      resolve(gltf);
    }, undefined, reject);
  });
}

function listAnimationNames() {
  if (!mixer || !mixer._clips) return [];
  return mixer._clips.map(c => c.name || `clip_${mixer._clips.indexOf(c)}`);
}

let currentAction = null;
function play(name) {
  if (!mixer || !mixer._clips) return;
  const clip = mixer._clips.find(c => c.name === name) || mixer._clips[0];
  if (!clip) return;
  if (currentAction) currentAction.stop();
  currentAction = mixer.clipAction(clip);
  currentAction.reset().play();
}

function pause() {
  if (currentAction) currentAction.paused = !currentAction.paused;
}

function setSpeed(s) {
  if (mixer) mixer.timeScale = s;
}

// Exported API
export async function loadModelFromUrl(url) { return loadModel(url); }
export function listAnimationNamesExport() { return listAnimationNames(); }
export function playAnimation(name) { return play(name); }
export function pauseAnimation() { return pause(); }
export function setAnimationSpeed(s) { return setSpeed(s); }

// Provide default names compatible with the way app.js imports
export default {
  loadModel: loadModel,
  listAnimationNames: listAnimationNames,
  play: play,
  pause: pause,
  setSpeed: setSpeed
};
