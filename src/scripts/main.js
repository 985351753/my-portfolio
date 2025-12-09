// import '../style/style.css'
// import javascriptLogo from './javascript.svg'
// import viteLogo from '/vite.svg'
// import { setupCounter } from './counter.js'

// document.querySelector('#app').innerHTML = `
//   <div>
//     <a href="https://vite.dev" target="_blank">
//       <img src="${viteLogo}" class="logo" alt="Vite logo" />
//     </a>
//     <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank">
//       <img src="${javascriptLogo}" class="logo vanilla" alt="JavaScript logo" />
//     </a>
//     <h1>Hello Vite!</h1>
//     <div class="card">
//       <button id="counter" type="button"></button>
//     </div>
//     <p class="read-the-docs">
//       Click on the Vite logo to learn more
//     </p>
//   </div>
// `

// Single-file WebGL2 example: 10 instanced spheres sharing geometry buffers.
// Features:
// - Shared vertex/index buffers for sphere geometry (GPU load reduction)
// - Per-instance attributes (position+scale, color) updated each frame with bufferSubData
// - Simple CPU physics: random velocities, boundary bounce, sphere-sphere elastic collisions
// - GLSL vertex+fragment shaders (written below)

const NUM = 10;
const BOUNDS = 6.0; // world box half-extent

const canvas = document.getElementById('glcanvas');
const gl = canvas.getContext('webgl2');
if (!gl) { alert('This demo requires WebGL2'); }

function resize(){
  canvas.width = Math.floor(canvas.clientWidth * devicePixelRatio);
  canvas.height = Math.floor(canvas.clientHeight * devicePixelRatio);
  gl.viewport(0,0,canvas.width,canvas.height);
}
window.addEventListener('resize', resize);
resize();

// --- Shaders ---
const vsSrc = `#version 300 es
precision highp float;

layout(location=0) in vec3 aPosition;
layout(location=1) in vec3 aNormal;
layout(location=2) in vec4 aInstPosScale; // x,y,z, scale
layout(location=3) in vec3 aInstColor;

uniform mat4 uViewProj;
uniform vec3 uLightDir;

out vec3 vNormal;
out vec3 vColor;
out vec3 vWorldPos;

void main(){
  vec3 scaledPos = aPosition * aInstPosScale.w;
  vec3 worldPos = scaledPos + aInstPosScale.xyz;
  gl_Position = uViewProj * vec4(worldPos, 1.0);
  // normal transform: scale by scale, so for uniform scale it's fine
  vNormal = normalize(aNormal);
  vColor = aInstColor;
  vWorldPos = worldPos;
}
`;

const fsSrc = `#version 300 es
precision highp float;
in vec3 vNormal;
in vec3 vColor;
in vec3 vWorldPos;
out vec4 outColor;

uniform vec3 uLightDir;
uniform vec3 uCamPos;

void main(){
  vec3 N = normalize(vNormal);
  float lambert = max(dot(N, -uLightDir), 0.0);
  vec3 base = vColor * 0.3 ;
  vec3 diffuse = base * lambert;
  vec3 viewDir = normalize(uCamPos - vWorldPos);
  float spec = pow(max(dot(reflect(uLightDir, N), viewDir), 0.0), 32.0);
  vec3 color = diffuse;
  outColor = vec4(color, 0.05);
}
`;

function compileShader(src, type){
  const s = gl.createShader(type);
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if(!gl.getShaderParameter(s, gl.COMPILE_STATUS)){
    console.error(gl.getShaderInfoLog(s));
    throw new Error('Shader compile failed');
  }
  return s;
}
function createProgram(vs, fs){
  const p = gl.createProgram();
  gl.attachShader(p, compileShader(vs, gl.VERTEX_SHADER));
  gl.attachShader(p, compileShader(fs, gl.FRAGMENT_SHADER));
  gl.linkProgram(p);
  if(!gl.getProgramParameter(p, gl.LINK_STATUS)){
    console.error(gl.getProgramInfoLog(p));
    throw new Error('Program link failed');
  }
  return p;
}

const program = createProgram(vsSrc, fsSrc);

// --- Sphere geometry (uv-sphere) ---
function createSphere(latBands=24,longBands=24){
  const positions = [];
  const normals = [];
  const indices = [];
  for(let lat=0; lat<=latBands; lat++){
    const theta = lat * Math.PI / latBands;
    const sinT = Math.sin(theta), cosT = Math.cos(theta);
    for(let lon=0; lon<=longBands; lon++){
      const phi = lon * 2 * Math.PI / longBands;
      const sinP = Math.sin(phi), cosP = Math.cos(phi);
      const x = cosP * sinT;
      const y = cosT;
      const z = sinP * sinT;
      positions.push(x,y,z);
      normals.push(x,y,z);
    }
  }
  for(let lat=0; lat<latBands; lat++){
    for(let lon=0; lon<longBands; lon++){
      const first = (lat * (longBands+1)) + lon;
      const second = first + longBands + 1;
      indices.push(first, second, first+1);
      indices.push(second, second+1, first+1);
    }
  }
  return {positions: new Float32Array(positions), normals: new Float32Array(normals), indices: new Uint32Array(indices)};
}

const sphere = createSphere(20, 20);

// --- Create shared GPU buffers ---
const vao = gl.createVertexArray();
gl.bindVertexArray(vao);

// Vertex buffer: positions + normals interleaved in separate buffers for clarity
const posBuf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
gl.bufferData(gl.ARRAY_BUFFER, sphere.positions, gl.STATIC_DRAW);
gl.enableVertexAttribArray(0);
gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);

const normalBuf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, normalBuf);
gl.bufferData(gl.ARRAY_BUFFER, sphere.normals, gl.STATIC_DRAW);
gl.enableVertexAttribArray(1);
gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);

// Index buffer
const idxBuf = gl.createBuffer();
gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, sphere.indices, gl.STATIC_DRAW);

// Instance buffers (positions+scale) and color
let instancePosScale = new Float32Array(NUM * 4);
let instanceColors = new Float32Array(NUM * 3);

const instPosBuf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, instPosBuf);
gl.bufferData(gl.ARRAY_BUFFER, instancePosScale.byteLength, gl.DYNAMIC_DRAW);
gl.enableVertexAttribArray(2);
gl.vertexAttribPointer(2, 4, gl.FLOAT, false, 0, 0);
gl.vertexAttribDivisor(2, 1);

const instColorBuf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, instColorBuf);
gl.bufferData(gl.ARRAY_BUFFER, instanceColors.byteLength, gl.DYNAMIC_DRAW);
gl.enableVertexAttribArray(3);
gl.vertexAttribPointer(3, 3, gl.FLOAT, false, 0, 0);
gl.vertexAttribDivisor(3, 1);

gl.bindVertexArray(null);

// Physics state (CPU)
const positions = new Float32Array(NUM*3);
const velocities = new Float32Array(NUM*3);
const scales = new Float32Array(NUM);
const colors = new Float32Array(NUM*3);

function rand(min,max){ return Math.random()*(max-min)+min; }
function init(){
  for(let i=0;i<NUM;i++){
    const base = i*3;
    positions[base+0] = rand(-BOUNDS*0.6, BOUNDS*0.6);
    positions[base+1] = rand(-BOUNDS*0.6, BOUNDS*0.6);
    positions[base+2] = rand(-BOUNDS*0.6, BOUNDS*0.6);
    velocities[base+0] = rand(-1.2,1.2);
    velocities[base+1] = rand(-1.2,1.2);
    velocities[base+2] = rand(-1.2,1.2);
    scales[i] = rand(0.6, 2);
    colors[base+0] = Math.random()*0 + 1;
    colors[base+1] = Math.random()*0 + 1;
    colors[base+2] = Math.random()*0 + 1;
  }
  updateInstanceBuffers();
}

function updateInstanceBuffers(){
  // fill instancePosScale and instanceColors
  for(let i=0;i<NUM;i++){
    const p3 = i*3, p4 = i*4;
    instancePosScale[p4+0] = positions[p3+0];
    instancePosScale[p4+1] = positions[p3+1];
    instancePosScale[p4+2] = positions[p3+2];
    instancePosScale[p4+3] = scales[i];

    instanceColors[p3+0] = colors[p3+0];
    instanceColors[p3+1] = colors[p3+1];
    instanceColors[p3+2] = colors[p3+2];
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, instPosBuf);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, instancePosScale);
  gl.bindBuffer(gl.ARRAY_BUFFER, instColorBuf);
  gl.bufferSubData(gl.ARRAY_BUFFER, 0, instanceColors);
}

// Simple collision resolution (sphere-sphere), equal mass elastic collision approximation
function resolveCollisions(){
  // pairwise
  for(let i=0;i<NUM;i++){
    const i3 = i*3;
    for(let j=i+1;j<NUM;j++){
      const j3 = j*3;
      const dx = positions[j3+0]-positions[i3+0];
      const dy = positions[j3+1]-positions[i3+1];
      const dz = positions[j3+2]-positions[i3+2];
      const dist2 = dx*dx+dy*dy+dz*dz;
      const r = scales[i] + scales[j];
      if(dist2 < r*r && dist2>0){
        const dist = Math.sqrt(dist2);
        const nx = dx/dist, ny = dy/dist, nz = dz/dist;
        // Move them apart (minimum translation)
        const penetration = r - dist;
        const half = penetration * 0.5;
        positions[i3+0] -= nx * half;
        positions[i3+1] -= ny * half;
        positions[i3+2] -= nz * half;
        positions[j3+0] += nx * half;
        positions[j3+1] += ny * half;
        positions[j3+2] += nz * half;
        // Exchange normal velocity components (equal mass)
        const vi_n = velocities[i3+0]*nx + velocities[i3+1]*ny + velocities[i3+2]*nz;
        const vj_n = velocities[j3+0]*nx + velocities[j3+1]*ny + velocities[j3+2]*nz;
        const vi_t_x = velocities[i3+0] - vi_n*nx;
        const vi_t_y = velocities[i3+1] - vi_n*ny;
        const vi_t_z = velocities[i3+2] - vi_n*nz;
        const vj_t_x = velocities[j3+0] - vj_n*nx;
        const vj_t_y = velocities[j3+1] - vj_n*ny;
        const vj_t_z = velocities[j3+2] - vj_n*nz;
        // swap normal parts
        const vi_n_after = vj_n;
        const vj_n_after = vi_n;
        velocities[i3+0] = vi_t_x + vi_n_after*nx;
        velocities[i3+1] = vi_t_y + vi_n_after*ny;
        velocities[i3+2] = vi_t_z + vi_n_after*nz;
        velocities[j3+0] = vj_t_x + vj_n_after*nx;
        velocities[j3+1] = vj_t_y + vj_n_after*ny;
        velocities[j3+2] = vj_t_z + vj_n_after*nz;
      }
    }
  }
}

function integrate(dt){
  for(let i=0;i<NUM;i++){
    const i3 = i*3;
    positions[i3+0] += velocities[i3+0] * dt;
    positions[i3+1] += velocities[i3+1] * dt;
    positions[i3+2] += velocities[i3+2] * dt;
    // boundary collisions with box [-BOUNDS, BOUNDS]
    for(let k=0;k<3;k++){
      const idx = i3 + k;
      const s = scales[i];
      if(positions[idx] > BOUNDS - s){ positions[idx] = BOUNDS - s; velocities[idx] *= -1; }
      if(positions[idx] < -BOUNDS + s){ positions[idx] = -BOUNDS + s; velocities[idx] *= -1; }
    }
  }
}

// --- Simple camera / matrix helpers ---
function perspective(out, fovy, aspect, near, far){
  const f = 1.0/Math.tan(fovy/2), nf = 1/(near - far);
  out[0]=f/aspect; out[1]=0; out[2]=0; out[3]=0;
  out[4]=0; out[5]=f; out[6]=0; out[7]=0;
  out[8]=0; out[9]=0; out[10]=(far+near)*nf; out[11]=-1;
  out[12]=0; out[13]=0; out[14]=(2*far*near)*nf; out[15]=0;
}
function lookAt(out, eye, center, up){
  const x0=0,x1=0,x2=0,y0=0,y1=0,y2=0,z0=0,z1=0,z2=0;
  let zx = eye[0]-center[0], zy = eye[1]-center[1], zz = eye[2]-center[2];
  let len = Math.hypot(zx,zy,zz);
  zx/=len; zy/=len; zz/=len;
  let xx = up[1]*zz - up[2]*zy;
  let xy = up[2]*zx - up[0]*zz;
  let xz = up[0]*zy - up[1]*zx;
  len = Math.hypot(xx,xy,xz);
  xx/=len; xy/=len; xz/=len;
  let yx = zy*xz - zz*xy;
  let yy = zz*xx - zx*xz;
  let yz = zx*xy - zy*xx;
  out[0]=xx; out[1]=yx; out[2]=zx; out[3]=0;
  out[4]=xy; out[5]=yy; out[6]=zy; out[7]=0;
  out[8]=xz; out[9]=yz; out[10]=zz; out[11]=0;
  out[12]=-(xx*eye[0]+xy*eye[1]+xz*eye[2]);
  out[13]=-(yx*eye[0]+yy*eye[1]+yz*eye[2]);
  out[14]=-(zx*eye[0]+zy*eye[1]+zz*eye[2]);
  out[15]=1;
}
function multiply(out,a,b){
  for(let i=0;i<4;i++){
    for(let j=0;j<4;j++){
      out[j*4+i] = a[i]*b[j*4] + a[i+4]*b[j*4+1] + a[i+8]*b[j*4+2] + a[i+12]*b[j*4+3];
    }
  }
}

let camPos = [0,0,16];
const view = new Float32Array(16);
const proj = new Float32Array(16);
const viewProj = new Float32Array(16);

// --- GL State ---
gl.enable(gl.DEPTH_TEST);

// Uniform locations
const loc = {
  uViewProj: gl.getUniformLocation(program, 'uViewProj'),
  uLightDir: gl.getUniformLocation(program, 'uLightDir'),
  uCamPos: gl.getUniformLocation(program, 'uCamPos')
};

// Animation loop
let last = performance.now();
function frame(now){
  const dt = Math.min(0.03, (now-last)/1000);
  last = now;

  // physics
  integrate(dt);
  resolveCollisions();
  updateInstanceBuffers();

  // camera
  const aspect = canvas.width / canvas.height;
  perspective(proj, Math.PI*0.35, aspect, 0.1, 100.0);
  lookAt(view, camPos, [0,0,0], [0,1,0]);
  multiply(viewProj, proj, view);

  // draw
  gl.clearColor(0.953, 0.953, 0.953, 1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.useProgram(program);
  gl.uniformMatrix4fv(loc.uViewProj, false, viewProj);
  gl.uniform3fv(loc.uLightDir, [0.8, 0.5, 0.5]);
  gl.uniform3fv(loc.uCamPos, camPos);
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);

  gl.drawElementsInstanced(gl.TRIANGLES, sphere.indices.length, gl.UNSIGNED_INT, 0, NUM);
  gl.bindVertexArray(null);

  requestAnimationFrame(frame);
}

// initialize and start
init();
requestAnimationFrame(frame);