import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Scene
const scene = new THREE.Scene();


const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

//camera
const camera = new THREE.PerspectiveCamera(
  45,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.set(1, 1, 2);
scene.add(camera);


// 平面のサイズ決定、メッシュ、追加
const geometry = new THREE.PlaneGeometry(1,1,32,32);
// const material = new THREE.MeshBasicMaterial({ color: 0x0000ff });
// // const texture =new THREE.TextureLoader().load("./Texturelabs_Wood_267M.jpg");
// // const material = new THREE.MeshBasicMaterial({ map:texture });

const count = geometry.attributes.position.count;
const randoms = new Float32Array(count);
for(let i = 0; i <count; i++) {
  randoms[i] = Math.random();
}
geometry.setAttribute("aRandom", new THREE.BufferAttribute(randoms, 1));
console.log(geometry);

const material = new THREE.RawShaderMaterial({
vertexShader:`uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

attribute vec3 position;
attribute float aRandom;

varying float vRandom;

void main()
{
    vec4 modelPosition = modelMatrix *vec4(position, 1.0);
    // modelPosition.x += 0.5;
    // modelPosition.z += sin(modelPosition.x * 20.0) * 0.1;
    modelPosition.z += aRandom * 0.1;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;
    gl_Position = projectionPosition;

    vRandom = aRandom;
}`,
fragmentShader:`precision mediump float;

varying float vRandom;

void main() {
    gl_FragColor = vec4(0.5, vRandom, 0.5, 1.0);
}`,
side: THREE.DoubleSide,
transparent: true,
});

const plane = new THREE.Mesh(geometry, material);
scene.add(plane);


// Renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

// Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

// Animate
const animate = () => {
  controls.update();

  renderer.render(scene, camera);
  window.requestAnimationFrame(animate);
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

animate();