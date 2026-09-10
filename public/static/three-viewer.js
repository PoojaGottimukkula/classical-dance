import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';
import { OrbitControls } from 'https://unpkg.com/three@0.158.0/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.158.0/examples/jsm/loaders/GLTFLoader.js';

let renderer, scene, camera, controls, mixer, clock, currentModel;
let skeletonHelper = null;
let wireframeEnabled = false;
const rootId = 'three-root';

function init() {
  const root = document.getElementById(rootId);
  if (!root) return;
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
      const box = new THREE.Box3().setFromObject(currentModel);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      currentModel.position.x += (currentModel.position.x - center.x);
      currentModel.position.y += -box.min.y;

      scene.add(currentModel);

      if (gltf.animations && gltf.animations.length) {
        mixer = new THREE.AnimationMixer(currentModel);
        mixer._clips = gltf.animations;
      }

      if (skeletonHelper) { scene.remove(skeletonHelper); skeletonHelper = null; }
      currentModel.traverse((c)=>{
        if (c.isSkinnedMesh) {
          skeletonHelper = new THREE.SkeletonHelper(c.skeleton.bones[0]);
          skeletonHelper.visible = false;
          scene.add(skeletonHelper);
        }
      });

      if (wireframeEnabled) {
        currentModel.traverse((c)=>{ if (c.isMesh && c.material) c.material.wireframe = true; });
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

function setWireframe(on) {
  wireframeEnabled = !!on;
  if (!currentModel) return;
  currentModel.traverse((c)=>{ if (c.isMesh && c.material) c.material.wireframe = wireframeEnabled; });
}

function setSkeletonVisible(on) {
  if (skeletonHelper) skeletonHelper.visible = !!on;
}

function setCameraPreset(p) {
  if (!camera) return;
  if (p === 'front') { camera.position.set(0,1.6,3); controls.target.set(0,1,0); }
  if (p === 'side') { camera.position.set(3,1.6,0); controls.target.set(0,1,0); }
  if (p === 'top') { camera.position.set(0,5,0.1); controls.target.set(0,0.8,0); }
  controls.update();
}

export default {
  loadModel: loadModel,
  listAnimationNames: listAnimationNames,
  play: play,
  pause: pause,
  setSpeed: setSpeed,
  setWireframe: setWireframe,
  setSkeletonVisible: setSkeletonVisible,
  setCameraPreset: setCameraPreset
};
