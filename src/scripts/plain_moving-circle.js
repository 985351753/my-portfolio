import * as THREE from 'three';

// --- セットアップ ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// --- 背景（白い平面） ---
const planeSize = 10;
const planeGeometry = new THREE.PlaneGeometry(planeSize, planeSize);
const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);

camera.position.z = 8;

// --- 円（ボール）の設定 ---
const balls = [];
const ballRadius = 0.5;

for (let i = 0; i < 3; i++) {
    // ジオメトリとマテリアル（水色）
    const geometry = new THREE.CircleGeometry(ballRadius, 32);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ffff });
    const ball = new THREE.Mesh(geometry, material);

    // 初期位置をランダムに設定
    ball.position.set(
        (Math.random() - 0.5) * (planeSize - 1),
        (Math.random() - 0.5) * (planeSize - 1),
        0.01 // 平面より少し手前に配置
    );

    // 移動速度をランダムに設定
    ball.userData.velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.1,
        (Math.random() - 0.5) * 0.1,
        0
    );

    balls.push(ball);
    scene.add(ball);
}

// --- アニメーションループ ---
function animate() {
    requestAnimationFrame(animate);

    balls.forEach((ball, i) => {
        // 位置の更新
        ball.position.add(ball.userData.velocity);

        // 1. 壁との衝突判定（境界で跳ね返る）
        const boundary = planeSize / 2 - ballRadius;
        if (Math.abs(ball.position.x) > boundary) {
            ball.userData.velocity.x *= -1;
            ball.position.x = Math.sign(ball.position.x) * boundary;
        }
        if (Math.abs(ball.position.y) > boundary) {
            ball.userData.velocity.y *= -1;
            ball.position.y = Math.sign(ball.position.y) * boundary;
        }

        // 2. 円同士の衝突判定
        for (let j = i + 1; j < balls.length; j++) {
            const otherBall = balls[j];
            const distance = ball.position.distanceTo(otherBall.position);

            if (distance < ballRadius * 2) {
                // 簡易的な速度の入れ替え（跳ね返り）
                const tempV = ball.userData.velocity.clone();
                ball.userData.velocity.copy(otherBall.userData.velocity);
                otherBall.userData.velocity.copy(tempV);
                
                // 重なり防止の補正
                const overlap = ballRadius * 2 - distance;
                const direction = ball.position.clone().sub(otherBall.position).normalize();
                ball.position.add(direction.multiplyScalar(overlap / 2));
            }
        }
    });

    renderer.render(scene, camera);
}

animate();

// リサイズ対応
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});