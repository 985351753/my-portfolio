import * as THREE from 'three';

// 1. シーン・カメラ・レンダラーの基本設定
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 2. 共通のジオメトリ
const geometry = new THREE.PlaneGeometry(1.5, 1.5);

// 3. 各シェーダーのソース（簡易版）
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// 4. マテリアルの作成関数
function createMaterial(fragmentShader) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 }
    },
    vertexShader,
    fragmentShader,
    side: THREE.DoubleSide
  });
}

// 4つの異なるフラグメントシェーダーを定義
const fragments = [
  `varying vec2 vUv;
void main() {
    vec3 colorA = vec3(0.0, 0.0, 1.0); // 青
    vec3 colorB = vec3(0.0, 1.0, 1.0); // 水色
    // vUv.y は下から上に向かって 0.0 → 1.0 に変化する
    vec3 finalColor = mix(colorA, colorB, vUv.y);
    gl_FragColor = vec4(finalColor, 1.0); }`,
  `varying vec2 vUv;
void main() {
    vec3 colorA = vec3(1.0, 0.0, 0.0); // 赤
    vec3 colorB = vec3(1.0, 1.0, 0.0); // 黄色
    // vUv.x は左から右に向かって 0.0 → 1.0 に変化する
    vec3 finalColor = mix(colorA, colorB, vUv.x);
    gl_FragColor = vec4(finalColor, 1.0); }`,
  `varying vec2 vUv;
void main() {
    vec3 centerColor = vec3(1.0, 1.0, 1.0); // 白
    vec3 outerColor  = vec3(0.5, 0.0, 1.0); // 紫
    // 中心(0.5, 0.5)からの距離を算出（最大は約0.707）
    float d = distance(vUv, vec2(0.5));
    // 距離に応じて色を混ぜる
    vec3 finalColor = mix(centerColor, outerColor, d);
    gl_FragColor = vec4(finalColor, 1.0); }`,
  `varying vec2 vUv;
void main() {
    vec3 colorA = vec3(0.0, 1.0, 0.0); // 緑
    vec3 colorB = vec3(0.0, 0.0, 0.0); // 黒
    // xとyを組み合わせると斜め方向のグラデーションになる
    float strength = (vUv.x + vUv.y) * 0.5;
    vec3 finalColor = mix(colorA, colorB, strength);
    gl_FragColor = vec4(finalColor, 1.0); }`
];

// 5. メッシュの生成と配置
const meshes = fragments.map((frag, i) => {
  const material = createMaterial(frag);
  const mesh = new THREE.Mesh(geometry, material);
  
  // 2x2のグリッドに並べる
  mesh.position.x = (i % 2) * 2 - 1;
  mesh.position.y = Math.floor(i / 2) * -2 + 1;
  
  scene.add(mesh);
  return mesh;
});

// 6. アニメーションループ
const clock = new THREE.Clock();

function animate() {
  const elapsedTime = clock.getElapsedTime();

  // すべてのメッシュの uTime ユニフォームを更新
  meshes.forEach(mesh => {
    mesh.material.uniforms.uTime.value = elapsedTime;
  });

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();

// ウィンドウリサイズ対応
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});