// // スフィア（メタボール）の数を定義
// const METABALL_COUNT = 10;
// // スフィアが跳ね返る境界の大きさ
// const BOUNDARY_SIZE = 1.0; // 画面の境界 (正規化座標) 
// // 浮遊速度の調整
// const BASE_SPEED = 0.05;

// let scene, camera, renderer, clock;
// let metaballs = []; // メタボールの位置と速度を保持する配列
// let positions = new Float32Array(METABALL_COUNT * 3); // シェーダーに渡す位置情報の配列
// let strengths = new Float32Array(METABALL_COUNT); // ★追加: メタボールの強度（大きさ）の配列

// // --- シェーダーコードの定義 (GLSL) ---
// // Fragment Shader: 各ピクセルがどのような色になるかを計算します
// const fragmentShader = `
// uniform vec3 metaballPositions[${METABALL_COUNT}]; // JavaScriptから受け取るメタボールの位置
// uniform float metaballStrengths[${METABALL_COUNT}]; // ★追加: 各メタボールの強度（大きさ）
// uniform float threshold; // 液体として描画する境界値 (例: 1.0)
// uniform vec2 resolution; // 画面の解像度
// uniform float time; // アニメーション時間

// void main() {
//     // 画面上の現在のピクセルの座標 (0.0〜1.0に正規化)
//     vec2 p = gl_FragCoord.xy / resolution.xy;
    
//     // スクリーンスペース座標を3D空間の座標 (ビュー空間) に変換
//     // ここでは単純に画面中央を(0, 0)とし、縦横比を調整
//     vec3 viewPos = vec3(p.x * 2.0 - 1.0, p.y * 2.0 - 1.0, 0.0);
//     viewPos.x *= resolution.x / resolution.y; // アスペクト比補正

//     float value = 0.0;
    
//     // 全てのメタボールの影響を計算 (メタボールの核となるロジック)
//     for (int i = 0; i < ${METABALL_COUNT}; i++) {
//         vec3 ballPos = metaballPositions[i];
//         float ballStrength = metaballStrengths[i]; // ★追加: 強度を取得
        
//         // メタボールの中心から現在のピクセルまでの距離の二乗
//         float distSq = distance(viewPos.xy, ballPos.xy) * distance(viewPos.xy, ballPos.xy);
        
//         // 影響度の計算を修正: strength / 距離^2
//         // strengthが大きいほど、同じ距離でも大きな影響を与える（大きく見える）
//         value += ballStrength / distSq;
//     }
    
//     // しきい値処理: 影響度の合計がthresholdを超えたら描画
//     if (value > threshold) {
//         // しきい値を超えた部分を白で描画（液体本体）
//         gl_FragColor = vec4(0.8, 0.8, 0.8, 1.0);
//     } else {
//         // しきい値以下の部分は透明（背景）
//         discard;
//     }
// }
// `;

// // Vertex Shader: 頂点の位置を計算します (ここでは標準的なものを利用)
// const vertexShader = `
// void main() {
//     gl_Position = vec4( position, 1.0 );
// }
// `;
// // --- シェーダーコードの定義 終了 ---

// // --- 初期化処理 ---
// function init() {
//     clock = new THREE.Clock();

//     scene = new THREE.Scene();
//     scene.background = new THREE.Color(0xF3F3F3);
//     // カメラはシェーダーで計算するため、ここでは遠くから画面全体を見下ろすように設定
//     camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

//     renderer = new THREE.WebGLRenderer({ antialias: true });
//     renderer.setSize(window.innerWidth, window.innerHeight);
//     document.body.appendChild(renderer.domElement);

//     // 1. メタボールの初期位置と速度を設定 (CPU側のロジック)
//     initializeMetaballs();

//     // 2. シェーダーマテリアル (カスタム描画ロジック) を作成
//     const metaballMaterial = new THREE.ShaderMaterial({
//         uniforms: {
//             metaballPositions: { value: positions }, // 10個のボールの位置
//             metaballStrengths: { value: strengths }, // ★追加
//             threshold: { value: 2.0 }, // 描画の滑らかさを調整するしきい値
//             resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
//             time: { value: 0.0 }
//         },
//         vertexShader: vertexShader,
//         fragmentShader: fragmentShader,
//         transparent: true // discardを使うため透明度を有効に
//     });

//     // 3. 画面全体を覆う板状のジオメトリ（メッシュ）を作成
//     const plane = new THREE.PlaneGeometry(2, 2); // 画面いっぱいに広がる板
//     const mesh = new THREE.Mesh(plane, metaballMaterial);
//     scene.add(mesh);

//     window.addEventListener('resize', onWindowResize, false);
//     animate();
// }

// /**
//  * CPU側でメタボールの初期設定を行います。
//  */
// function initializeMetaballs() {
//   // 強度の範囲を設定 (例: 小さいものから大きいものまでランダムに)
//   const MIN_STRENGTH = 0.01;
//   const MAX_STRENGTH = 0.08; 
  
//   // 衝突判定に使うための擬似的な半径のベース
//   const BASE_RADIUS = 0.5; 

//   for (let i = 0; i < METABALL_COUNT; i++) {
//       // ランダムな強度を設定
//       const strength = MIN_STRENGTH + Math.random() * (MAX_STRENGTH - MIN_STRENGTH);
      
//       // 強度に基づいて、衝突判定用の擬似的な半径を設定
//       // 強度が大きいほど、擬似半径も大きくする
//       const collisionRadius = BASE_RADIUS * Math.sqrt(strength); 
      
//       // 初期位置を中央付近にランダムに設定
//       const x = (Math.random() - 0.5) * 1.5;
//       const y = (Math.random() - 0.5) * 1.5;
//       const z = 0; 

//       // 速度
//       const speed = BASE_SPEED * (0.5 + Math.random() * 0.5); 
//       const velocity = new THREE.Vector3(
//           (Math.random() - 0.5) * speed,
//           (Math.random() - 0.5) * speed,
//           0
//       );

//         metaballs.push({ 
//           position: new THREE.Vector3(x, y, z), 
//           velocity: velocity,
//           radius: collisionRadius, // 衝突判定に使用
//           strength: strength        // ★追加: 描画に使用
//       });
      
//       // positions配列に初期位置を設定
//       positions[i * 3 + 0] = x;
//       positions[i * 3 + 1] = y;
//       positions[i * 3 + 2] = z;
      
//       // ★strengths配列に初期強度を設定
//       strengths[i] = strength;
//   }
// }

// // --- アニメーション処理 ---
// function animate() {
//     requestAnimationFrame(animate);

//     const deltaTime = clock.getDelta();
//     const elapsedTime = clock.getElapsedTime();

//     // 1. CPU側でメタボールの位置と速度を更新 (物理シミュレーション)
//     updateMetaballs(deltaTime);

//     // 2. シェーダーのユニフォーム変数（入力値）を更新
//     renderer.render(scene, camera);
//     scene.children[0].material.uniforms.time.value = elapsedTime;
//     scene.children[0].material.uniforms.metaballPositions.value = positions;
// }

// /**
//  * メタボールの位置更新、壁衝突、簡易的なボール衝突を処理します。
//  * @param {number} dt デルタタイム（前フレームからの経過時間）
//  */
// function updateMetaballs(dt) {
//   const boundary = BOUNDARY_SIZE;

//     for (let i = 0; i < METABALL_COUNT; i++) {
//         const ballA = metaballs[i];
        
//         // 1. 位置更新
//         ballA.position.addScaledVector(ballA.velocity, dt * 10); // 速度に時間を乗じて移動
        
//         // 2. 壁衝突判定 (跳ね返り)
//         if (ballA.position.x > boundary || ballA.position.x < -boundary) {
//             ballA.velocity.x *= -1;
//             // 境界を超えないように補正
//             ballA.position.x = THREE.MathUtils.clamp(ballA.position.x, -boundary, boundary);
//         }
//         if (ballA.position.y > boundary || ballA.position.y < -boundary) {
//             ballA.velocity.y *= -1;
//             ballA.position.y = THREE.MathUtils.clamp(ballA.position.y, -boundary, boundary);
//         }

//         // 3. ボール同士の簡易衝突判定 (跳ね返り)
//         for (let j = i + 1; j < METABALL_COUNT; j++) {
//             const ballB = metaballs[j];
//             const distance = ballA.position.distanceTo(ballB.position);
//             const combinedRadius = ballA.radius + ballB.radius;
            
//             // 衝突判定
//             if (distance < combinedRadius) {
//                 // 簡易的な跳ね返り: 速度を交換
//                 const tempVel = ballA.velocity.clone();
//                 ballA.velocity.copy(ballB.velocity);
//                 ballB.velocity.copy(tempVel);
                
//                 // 貫通を防ぐため、少し離す
//                 const direction = new THREE.Vector3().subVectors(ballA.position, ballB.position).normalize();
//                 const overlap = combinedRadius - distance;
//                 ballA.position.addScaledVector(direction, overlap / 2);
//                 ballB.position.addScaledVector(direction, -overlap / 2);
//             }
//         }

//         // 4. positions配列を更新 (シェーダーに渡すための準備)
//         positions[i * 3 + 0] = ballA.position.x;
//         positions[i * 3 + 1] = ballA.position.y;
//         positions[i * 3 + 2] = ballA.position.z;
//     }
// }


// // --- ウィンドウリサイズ時の処理 ---
// function onWindowResize() {
//     renderer.setSize(window.innerWidth, window.innerHeight);
//     // resolution uniformも更新
//     scene.children[0].material.uniforms.resolution.value.set(window.innerWidth, window.innerHeight);
// }

// // スクリプトが読み込まれたら初期化処理を開始
// init();

import * as THREE from 'three';
// スフィアの数を定義
const SPHERE_COUNT = 10;
// スフィアが跳ね返る境界の大きさ
const BOUNDARY_SIZE = 15; // x, y方向の壁の位置
const BOUNDARY_SIZE_Z = 3; // z方向の壁の位置（狭めたい場合はこの値を小さくする）

// Three.jsの基本的な要素を設定します
let scene, camera, renderer;
const spheres = []; // 作成したスフィアを格納する配列

// --- 初期化処理 ---
function init() {
    // 1. シーンの作成 (3D空間)
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf3f3f3);

    // 2. カメラの作成 (視点)
    // カメラをZ軸方向に少し奥に引く。境界が25なので、50あれば全体が見える
    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = BOUNDARY_SIZE * 2; 

    // 3. レンダラーの作成 (描画エンジン)
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // 4. ライトの追加 (物体を照らす)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); 
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // 5. スフィアの作成と配置
    createSpheres();

    // 6. ウィンドウのリサイズ処理
    window.addEventListener('resize', onWindowResize, false);

    // 7. アニメーションループの開始
    animate();
}

/**
 * ランダムなスフィアを作成し、初期速度も設定します。
 */
function createSpheres() {
    const material = new THREE.MeshPhongMaterial({ color: 0xf4f4f4 });

    for (let i = 0; i < SPHERE_COUNT; i++) {
        // 半径
        const radius = 1.0 + Math.random() * 3.0; 
        const geometry = new THREE.SphereGeometry(radius, 32, 32);

        const sphere = new THREE.Mesh(geometry, material);

        // ランダムな初期位置を設定
        sphere.position.x = (Math.random() - 0.5) * (BOUNDARY_SIZE * 2 - radius * 2);
        sphere.position.y = (Math.random() - 0.5) * (BOUNDARY_SIZE * 2 - radius * 2);
        sphere.position.z = (Math.random() - 0.5) * (BOUNDARY_SIZE_Z * 2 - radius * 2);

        // 浮遊アニメーション用のランダムな移動速度/オフセットをオブジェクトに追加
        // speedは少し速くしました (0.01〜0.1)
        const baseSpeed = 0.01 + Math.random() * 0.09; 
        sphere.userData.radius = radius;
        sphere.userData.velocity = new THREE.Vector3(
            (Math.random() - 0.5) * baseSpeed,
            (Math.random() - 0.5) * baseSpeed,
            (Math.random() - 0.5) * baseSpeed
        );

        scene.add(sphere);
        spheres.push(sphere);
    }
}

// --- アニメーション処理 ---
function animate() {
    requestAnimationFrame(animate);

    // 1. 各スフィアの位置更新と壁衝突判定
    spheres.forEach(sphere => {
        // 速度に基づいて位置を更新
        sphere.position.add(sphere.userData.velocity);

        // 壁衝突判定 (跳ね返り)
        checkWallCollision(sphere);
    });

    // 2. ボール同士の衝突判定
    checkSphereCollisions();

    // 描画
    renderer.render(scene, camera);
}

/**
 * 画面の境界（壁）との衝突をチェックし、跳ね返りを処理します。
 * @param {THREE.Mesh} sphere 対象のスフィア
 */
function checkWallCollision(sphere) {
    const radius = sphere.userData.radius;
    const velocity = sphere.userData.velocity;
    const pos = sphere.position;
    const boundary = BOUNDARY_SIZE;
    const boundaryZ = BOUNDARY_SIZE_Z;

    // X軸の壁
    if (pos.x + radius > boundary || pos.x - radius < -boundary) {
        // 衝突したらX軸の速度を反転させ、壁から少し離す
        velocity.x *= -1;
        // 壁を貫通しないように位置を補正
        if (pos.x + radius > boundary) pos.x = boundary - radius;
        if (pos.x - radius < -boundary) pos.x = -boundary + radius;
    }

    // Y軸の壁
    if (pos.y + radius > boundary || pos.y - radius < -boundary) {
        velocity.y *= -1;
        if (pos.y + radius > boundary) pos.y = boundary - radius;
        if (pos.y - radius < -boundary) pos.y = -boundary + radius;
    }

    // Z軸の壁
    if (pos.z + radius > boundaryZ || pos.z - radius < -boundaryZ) {
        velocity.z *= -1;
        if (pos.z + radius > boundaryZ) pos.z = boundaryZ - radius;
        if (pos.z - radius < -boundaryZ) pos.z = -boundaryZ + radius;
    }
}

/**
 * 全てのスフィアのペアに対して衝突判定を行います。（簡易的な応答）
 */
function checkSphereCollisions() {
    for (let i = 0; i < SPHERE_COUNT; i++) {
        for (let j = i + 1; j < SPHERE_COUNT; j++) {
            const sphereA = spheres[i];
            const sphereB = spheres[j];

            // 1. 距離を計算
            const distanceVector = new THREE.Vector3().subVectors(sphereA.position, sphereB.position);
            const distance = distanceVector.length();

            const combinedRadius = sphereA.userData.radius + sphereB.userData.radius;

            // 2. 衝突判定: 2つの中心間の距離が半径の合計より小さいか
            if (distance < combinedRadius) {
                // 衝突が発生!
                
                // 3. 貫通を防ぐため、互いを押し返す（位置補正）
                const overlap = combinedRadius - distance;
                // 押し戻す方向（正規化）
                const direction = distanceVector.clone().normalize();
                
                // 半分ずつ押し戻す
                sphereA.position.addScaledVector(direction, overlap / 2);
                sphereB.position.addScaledVector(direction, -overlap / 2);

                // 4. 簡易的な衝突応答 (速度の反転)
                // 運動量保存則を無視し、単純に速度を入れ替える（跳ね返す）
                // 衝突方向(direction)に沿った速度成分を反転させます
                
                const velA = sphereA.userData.velocity;
                const velB = sphereB.userData.velocity;

                // 衝突ベクトル(direction)と現在の速度(velA, velB)の内積を計算
                // 内積は、速度が衝突方向にどれだけ向かっているかを示す
                const dotA = velA.dot(direction);
                const dotB = velB.dot(direction);

                // 速度を交換・反転させて、跳ね返りをシミュレート
                // 衝突方向の速度成分を交換し、それ以外の速度成分は維持する
                
                // 衝突前の速度から衝突方向の速度成分を引く (維持する速度)
                const velA_perp = velA.clone().addScaledVector(direction, -dotA); 
                const velB_perp = velB.clone().addScaledVector(direction, -dotB);

                // 新しい速度は、維持する速度 + 相手の衝突方向の速度
                sphereA.userData.velocity = velA_perp.addScaledVector(direction, dotB);
                sphereB.userData.velocity = velB_perp.addScaledVector(direction, dotA);
                
                // (さらに単純な方法: 速度を単純に反転させるだけでも「跳ね返っている」ように見えますが、物理的なリアリティを出すために上記の処理にしました。)
            }
        }
    }
}


// --- ウィンドウリサイズ時の処理 ---
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// スクリプトが読み込まれたら初期化処理を開始
init();