        import * as THREE from 'https://unpkg.com/three@0.160.0/build/three.module.js';

        // --- セットアップ ---
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 2;

        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        // --- マテリアルの作成 (シェーダー) ---
        const material = new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0.0 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float uTime;
                varying vec2 vUv;
                void main() {
                    // 円の中心を時間で動かす (0.2 〜 0.8 の範囲)
                    vec2 center = vec2(0.5 + sin(uTime) * 0.3, 0.5 + cos(uTime) * 0.3);
                    
                    // 現在のピクセルと中心の距離を計算
                    float dist = distance(vUv, center);
                    
                    // 距離が0.1より小さければ色を塗り、それ以外は透明に
                    float radius = 0.1;
                    float alpha = step(dist, radius); 
                    
                    if(alpha < 0.1) discard; // 背景を透過させる  
                    gl_FragColor = vec4(0.0, 0.8, 1.0, 1.0); // 水色の円
                }
            `,
            transparent: true
        });

        // --- メッシュの作成 ---
        const geometry = new THREE.PlaneGeometry(1, 1);
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // --- アニメーションループ ---
        const clock = new THREE.Clock();
        function animate() {
            requestAnimationFrame(animate);
            
            // 時間を更新してシェーダーに送る
            material.uniforms.uTime.value = clock.getElapsedTime();
            
            renderer.render(scene, camera);
        }
        animate();

        // リサイズ対応
        window.addEventListener('resize', () => {
            renderer.setSize(window.innerWidth, window.innerHeight);
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
        });
