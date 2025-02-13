// console.clear();

// 创建场景对象 Scene
const scene = new THREE.Scene();

// 创建透视相机
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

//  创建渲染器对象
const renderer = new THREE.WebGLRenderer({
  antialias: true, //  是否执行抗锯齿。默认值为false。
});

// 设置颜色及其透明度
renderer.setClearColor(new THREE.Color("rgb(0,0,0)"));

// 将输 canvas 的大小调整为 (width, height) 并考虑设备像素比，且将视口从 (0, 0) 开始调整到适合大小
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 表示对象局部位置的 Vector3。默认值为(0, 0, 0)。
camera.position.z = 1.8;

// 轨迹球控制器
const controls = new THREE.TrackballControls(camera, renderer.domElement);
controls.noPan = true;
controls.maxDistance = 3;
controls.minDistance = 0.7;

// 物体
const group = new THREE.Group();
scene.add(group);

let heart = null;
let sampler = null;
let originHeart = null;

// OBJ加载器
new THREE.OBJLoader().load(
  "https://assets.codepen.io/127738/heart_2.obj",
  (obj) => {
    heart = obj.children[0];
    heart.geometry.rotateX(-Math.PI * 0.5);
    heart.geometry.scale(0.04, 0.04, 0.04);
    heart.geometry.translate(0, -0.4, 0);
    group.add(heart);

    // 基础网格材质
    heart.material = new THREE.MeshBasicMaterial({
      color: new THREE.Color("rgb(0,0,0)"),
    });
    originHeart = Array.from(heart.geometry.attributes.position.array);
    //console.log(originHeart); //101376 = 33792 * 3(3个坐标值)
    // 用于在网格表面上采样加权随机点的实用程序类。
    sampler = new THREE.MeshSurfaceSampler(heart).build();
    // 生成表皮
    init();
    // 每一帧都会调用
    renderer.setAnimationLoop(render);

    const positionAttribute = heart.geometry.getAttribute( 'position' );
    // // 创建一个新的 BufferGeometry 来存放随机选择的顶点
// const randomGeometry = new THREE.BufferGeometry();
// randomGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(randomVertices), 3));

// 确保有足够的顶点用于随机选择
if (heart.geometry.attributes.position.array.length / 3 < 13) {
  console.error("几何体中的顶点数少于13，无法进行随机选择");
}

// 获取所有的顶点数量
const vertexCount = heart.geometry.attributes.position.array.length / 3;

// 随机选择13个不同的顶点索引
let indices = [];
while (indices.length < 13) {
  let randomIndex = Math.floor(Math.random() * vertexCount);
  if (!indices.includes(randomIndex)) { // 确保不重复添加
      indices.push(randomIndex);
  }
}
console.log("indices: " + indices);

// 文字内容数组
const texts = "慧宝我想和你一直一直在一起".split('');

// 根据随机选择的索引提取顶点位置并创建文字精灵
for (let i = 0; i < indices.length; i++) {
  let startIndex = indices[i] * 3; // 每个顶点占用三个连续的数组元素：x, y, z
  const x = heart.geometry.attributes.position.array[startIndex];
  const y = heart.geometry.attributes.position.array[startIndex + 1];
  const z = heart.geometry.attributes.position.array[startIndex + 2];

  const textSprite = createTextSprite(texts[i], x, y, z);
  scene.add(textSprite);
  console.log(textSprite);
}
  }
);

// 会卡死
// function createTextAtVertices(positionAttribute) {
//   const textMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
//   const textSize = 0.3; // 文字大小

//   // 遍历所有顶点
//   for (let i = 0; i < positionAttribute.count; i++) {
//     // 获取顶点坐标
//     const x = positionAttribute.getX(i);
//     const y = positionAttribute.getY(i);
//     const z = positionAttribute.getZ(i);
//     console.log(x, y, z)
//     // 创建文字几何体
//     const loader = new THREE.FontLoader();
//     loader.load(
//     //'fonts/FangSong_Regular.json' // err: as been blocked by CORS policy!
//     'https://be1fdb21.resources-1vr.pages.dev/fonts/FangSong_hui.json' //使用Cloudflare的cdn服务(单文件<25M, jsDelivr<20M)
// , (font) => {
//     const textGeometry = new THREE.TextGeometry('慧', {
//       font: font,
//       size: 10,
//       height: 0.05,
//     });
//     const textMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
//     // 创建文字网格
//     const textMesh = new THREE.Mesh(
//       textGeometry,
//       textMaterial
//     );

//     // 计算文字居中偏移（默认文字原点在左下角）
//     textGeometry.computeBoundingBox();
//     const centerOffset = -0.5 * (textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x);
//     textMesh.position.set(x + centerOffset, y, z);

//     // 添加到场景
//     scene.add(textMesh);

//   
//   }
// }

function createTextAtVerticesOptimized(positionAttribute) {
//   const textSize = 100;
//   const textMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });

//   // ------------------------- 1. 创建基础文字几何体 -------------------------
//       const loader = new THREE.FontLoader();
//     loader.load(
//     //'fonts/FangSong_Regular.json' // err: as been blocked by CORS policy!
//     'https://be1fdb21.resources-1vr.pages.dev/fonts/FangSong_hui.json' //使用Cloudflare的cdn服务(单文件<25M, jsDelivr<20M)
// , (font) => {
//   const baseTextGeometry = new THREE.TextGeometry('慧', {
//     font: font,
//     size: 0.3,
//     height: 0.05,
//     curveSegments: 1,      // 将曲线分段从默认12降为1
//     bevelEnabled: false    // 禁用倒角
//   });

//   // 计算文字居中偏移（仅需计算一次）
//   baseTextGeometry.computeBoundingBox();
//   const centerOffset = -0.5 * (baseTextGeometry.boundingBox.max.x - baseTextGeometry.boundingBox.min.x);

//   // ------------------------- 2. 创建实例化网格 -------------------------
//   const instanceCount = positionAttribute.count;
//   const instancedMesh = new THREE.InstancedMesh(
//     baseTextGeometry,
//     textMaterial,
//     instanceCount
//   );

//   // ------------------------- 3. 设置实例变换矩阵 -------------------------
//   const matrix = new THREE.Matrix4();
//   const position = new THREE.Vector3();

//   for (let i = 0; i < instanceCount; i++) {
//     // 获取顶点坐标
//     position.set(
//       positionAttribute.getX(i),
//       positionAttribute.getY(i),
//       positionAttribute.getZ(i)
//     );

//     // 应用居中偏移
//     position.x += centerOffset;

//     // 构建变换矩阵（无旋转缩放，仅平移）
//     matrix.makeTranslation(position.x, position.y, position.z);
//     instancedMesh.setMatrixAt(i, matrix);
//   }

//   // 重要：更新实例矩阵缓冲区
//   instancedMesh.instanceMatrix.needsUpdate = true;

//   scene.add(instancedMesh);
// });

// 1. 创建文字纹理图集
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 256; canvas.height = 256;
ctx.fillStyle = '#ff0000'; // 文字颜色
ctx.fillText('慧', 128, 128); // 居中绘制文字

const texture = new THREE.CanvasTexture(canvas);

// 2. 创建点云几何体
const geometry = new THREE.BufferGeometry();
geometry.setAttribute('position', positionAttribute);

// 3. 点精灵材质
const material = new THREE.PointsMaterial({
  size: 0.5,
  map: texture,
  transparent: true
});

const points = new THREE.Points(geometry, material);
scene.add(points);
  
}

let positions = [];
let colors = [];
const geometry = new THREE.BufferGeometry();

const paletteMaterial = new THREE.PointsMaterial({
  vertexColors: true, // Let Three.js knows that each point has a different color
  size: 0.009,
});


const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 256; canvas.height = 256;
ctx.fillStyle = 'magenta'; // 文字颜色
ctx.font = "16px Arial";
ctx.fillText('慧', 128, 128); // 居中绘制文字
const texture = new THREE.CanvasTexture(canvas);

// 3. 点精灵材质
const textMaterial = new THREE.PointsMaterial({
  size: 0.5,
  map: texture,
  transparent: true
});

const textParticles = new THREE.Points(geometry, textMaterial);
const paletteParticles = new THREE.Points(geometry, paletteMaterial);
scene.add(textParticles);
group.add(paletteParticles);


// // 创建文字纹理并生成Sprite
// function createTextSprite(text, x, y, z) {
//   const canvas = document.createElement('canvas');
//   const context = canvas.getContext('2d');
//   const fontSize = 16;
//   const fontFamily = 'Arial';

//   // 设置字体大小和样式
//   context.font = `${fontSize}px ${fontFamily}`;
//   context.fillStyle = '#ff0000';
//   context.textAlign = 'center';
//   context.textBaseline = 'middle';

//   // 计算文本宽度
//   const metrics = context.measureText(text);
//   const textWidth = 256;
//   const textHeight = 256;

//   // 设置画布大小
//   canvas.width = textWidth;
//   canvas.height = textHeight;

//   // 绘制文本
//   context.fillText(text, textWidth / 2, textHeight / 2);

//   // 创建纹理
//   const texture = new THREE.CanvasTexture(canvas);
//   texture.colorSpace = THREE.SRGBColorSpace; // 关键：颜色空间校正
//   texture.needsUpdate = true;

//   const material = new THREE.SpriteMaterial({
//     map: texture,
//     transparent: true,    // 启用透明通道
//     alphaTest: 0.1,       // 剔除透明像素
//     color: 0xffffff,      // 强制材质颜色为白色（不干预纹理颜色）
//     depthWrite: false     // 提升渲染性能
//   });

//   // // 创建材质
//   // const material = new THREE.SpriteMaterial({ map: texture });

//   // 创建精灵
//   const sprite = new THREE.Sprite(material);
//   sprite.position.set(x, y, z);

//   return sprite;
// }

function createTextSprite(text, x, y, z) {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  const fontSize = 8; // 增大字体尺寸确保清晰度
  const padding = 10;  // 留白避免边缘裁剪
  const fontFamily = 'Arial';

  // ------------------------- 1. 计算动态画布尺寸 -------------------------
  context.font = `${fontSize}px ${fontFamily}`;
  const metrics = context.measureText(text);
  const textWidth = Math.ceil(metrics.width + padding * 2);
  const textHeight = Math.ceil(fontSize + padding * 2);

  // 设置画布尺寸
  canvas.width = textWidth;
  canvas.height = textHeight;

  // ------------------------- 2. 绘制带背景的文字 -------------------------
  context.font = `${fontSize}px ${fontFamily}`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';

  // 填充背景色（可选调试）
  context.fillStyle = 'rgba(0,0,0,0)'; // 完全透明背景
  context.fillRect(0, 0, canvas.width, canvas.height);

  // 绘制红色文字
  context.fillStyle = 'red'; // 确保颜色填充
  context.fillText(text, canvas.width / 2, canvas.height / 2);

  // ------------------------- 3. 创建 Three.js 材质 -------------------------
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace; // 关键：颜色空间校正
  texture.needsUpdate = true;

  const material = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,    // 启用透明通道
    alphaTest: 0.1,       // 剔除透明像素
    color: 0xffffff,      // 强制材质颜色为白色（不干预纹理颜色）
    depthWrite: false     // 提升渲染性能
  });

  // ------------------------- 4. 创建精灵并定位 -------------------------
  const sprite = new THREE.Sprite(material);
  sprite.position.set(x, y, z);
  sprite.scale.set(textWidth / 100, textHeight / 100, 1); // 按需缩放

  return sprite;
}

const simplex = new SimplexNoise();
const pos = new THREE.Vector3();
const palette = [
  new THREE.Color("#ffd4ee"),
  new THREE.Color("#ff77fc"),
  new THREE.Color("#ff77ae"),
  new THREE.Color("#ff1775"),
];
class SparkPoint {
  constructor() {
    sampler.sample(pos);
    this.color = palette[Math.floor(Math.random() * palette.length)];
    this.rand = Math.random() * 0.03;
    this.pos = pos.clone();
    this.one = null;
    this.two = null;
  }
  update(a) {
    const noise =
      simplex.noise4D(this.pos.x * 1, this.pos.y * 1, this.pos.z * 1, 0.1) +
      1.5;
    const noise2 =
      simplex.noise4D(this.pos.x * 500, this.pos.y * 500, this.pos.z * 500, 1) +
      1;
    this.one = this.pos.clone().multiplyScalar(1.01 + noise * 0.15 * beat.a);
    this.two = this.pos
      .clone()
      .multiplyScalar(1 + noise2 * 1 * (beat.a + 0.3) - beat.a * 1.2);
  }
}

let spikes = [];
function init(a) {
  positions = [];
  colors = [];
  for (let i = 0; i < 10000; i++) {
    const g = new SparkPoint();
    spikes.push(g);
  }
}

const beat = { a: 0 };
gsap
  .timeline({
    repeat: -1,
    repeatDelay: 0.3,
  })
  .to(beat, {
    a: 0.5,
    duration: 0.6,
    ease: "power2.in",
  })
  .to(beat, {
    a: 0.0,
    duration: 0.6,
    ease: "power3.out",
  });

// 0.22954521554974774 -0.22854083083283794
const maxZ = 0.23;
const rateZ = 0.5;

function render(a) {
  positions = [];
  colors = [];
  spikes.forEach((g, i) => {
    g.update(a);
    const rand = g.rand;
    const color = g.color;
    if (maxZ * rateZ + rand > g.one.z && g.one.z > -maxZ * rateZ - rand) {
      positions.push(g.one.x, g.one.y, g.one.z);
      colors.push(color.r, color.g, color.b);
    }
    if (
      maxZ * rateZ + rand * 2 > g.one.z &&
      g.one.z > -maxZ * rateZ - rand * 2
    ) {
      positions.push(g.two.x, g.two.y, g.two.z);
      colors.push(color.r, color.g, color.b);
    }
  });
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array(positions), 3)
  );

  geometry.setAttribute(
    "color",
    new THREE.BufferAttribute(new Float32Array(colors), 3)
  );

  const vs = heart.geometry.attributes.position.array;
  for (let i = 0; i < vs.length; i += 3) {
    const v = new THREE.Vector3(
      originHeart[i],
      originHeart[i + 1],
      originHeart[i + 2]
    );
    const noise =
      simplex.noise4D(
        originHeart[i] * 1.5,
        originHeart[i + 1] * 1.5,
        originHeart[i + 2] * 1.5,
        a * 0.0005
      ) + 1;
    v.multiplyScalar(0 + noise * 0.15 * beat.a);
    vs[i] = v.x;
    vs[i + 1] = v.y;
    vs[i + 2] = v.z;
  }
  heart.geometry.attributes.position.needsUpdate = true;

  controls.update();
  renderer.render(scene, camera);
}

window.addEventListener("resize", onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
