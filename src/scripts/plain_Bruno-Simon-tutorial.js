import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const scene = new THREE.Scene();

const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

const camera = new THREE.PerspectiveCamera(
  75,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(0, 0, 2);
scene.add(camera);

const geometry = new THREE.PlaneGeometry(1, 1)
const material = new THREE.ShaderMaterial({
  vertexShader:`
  varying vec2 vUv;
  void main() {
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      vUv = uv;
  }`,
  fragmentShader:`
  varying vec2 vUv;
  void main() {
      gl_FragColor = vec4(vUv.x, vUv.x, vUv.x, 0.5);
  }`,
  side: THREE.DoubleSide,
  transparent: true,
  });

const plane = new THREE.Mesh(geometry, material);
scene.add(plane);
const plane2 = new THREE.Mesh(geometry, material);
scene.add(plane2);

plane.position.x = -1;
plane2.position.x = 1;

// const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
// scene.add(ambientLight);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const animate = () => {
  controls.update();

  renderer.render(scene, camera);
  window.requestAnimationFrame(animate);
};

window.addEventListener("resize",() =>{
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
});

animate();