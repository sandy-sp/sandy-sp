import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

let scene, camera, renderer, instancedMesh, mouse = { x: 0, y: 0 };

const raycaster = new THREE.Raycaster();
const mouseVector = new THREE.Vector2();

// Initialize scene
scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xffffff, 50, 300);

camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 150;

renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff, 0);
document.body.appendChild(renderer.domElement);

// Update theme colors dynamically
const updateTheme = () => {
  const isDark = document.querySelector('.theme-toggle-input')?.checked;
  const backgroundColor = isDark ? 0x000000 : 0xffffff;
  scene.fog.color.setHex(backgroundColor);
  renderer.setClearColor(backgroundColor, 0);

  const canvas = document.querySelector('canvas');
  if (canvas) {
    canvas.style.backgroundColor = isDark ? '#000000' : '#ffffff';
  }
};

updateTheme();
document.querySelector('.theme-toggle-input')?.addEventListener('change', updateTheme);

// Create cube mesh
const cubeCount = 2028;
const size = 100;
const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
const material = new THREE.MeshBasicMaterial({ color: 0x334954, transparent: true, opacity: 0.8 });

instancedMesh = new THREE.InstancedMesh(geometry, material, cubeCount);
scene.add(instancedMesh);

const gridSize = Math.cbrt(cubeCount);
const spacing = size / gridSize;

const dummy = new THREE.Object3D();
let index = 0;

for (let x = 0; x < gridSize; x++) {
  for (let y = 0; y < gridSize; y++) {
    for (let z = 0; z < gridSize; z++) {
      dummy.position.set(
        (x - gridSize / 2) * spacing,
        (y - gridSize / 2) * spacing,
        (z - gridSize / 2) * spacing
      );
      dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
      dummy.updateMatrix();
      instancedMesh.setMatrixAt(index++, dummy.matrix);
    }
  }
}

// Create thunderbolt particle effect
const thunderboltShape = new THREE.Shape();
thunderboltShape.moveTo(0, 0);
thunderboltShape.lineTo(0.2, 0.5);
thunderboltShape.lineTo(-0.1, 0.5);
thunderboltShape.lineTo(0.1, 1);
thunderboltShape.lineTo(-0.2, 0.5);
thunderboltShape.lineTo(0, 0);

const thunderboltGeometry = new THREE.ShapeGeometry(thunderboltShape);
thunderboltGeometry.scale(3, 3, 3);
const thunderboltMaterial = new THREE.MeshBasicMaterial({ color: 0xFFA500, side: THREE.DoubleSide });

const particlesGroup = new THREE.Group();
const particleCount = 5000;

for (let i = 0; i < particleCount; i++) {
  const particle = new THREE.Mesh(thunderboltGeometry, thunderboltMaterial);
  const startPos = new THREE.Vector3(
    (Math.random() - 0.5) * gridSize * spacing,
    (Math.random() - 0.5) * gridSize * spacing,
    (Math.random() - 0.5) * gridSize * spacing
  );
  particle.position.copy(startPos);

  const scale = Math.random() * 0.5 + 0.1;
  particle.scale.set(scale, scale, scale);

  particle.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

  particle.userData = {
    target: new THREE.Vector3(
      (Math.random() - 0.5) * gridSize * spacing,
      (Math.random() - 0.5) * gridSize * spacing,
      (Math.random() - 0.5) * gridSize * spacing
    ),
    speed: 0.05,
  };

  particlesGroup.add(particle);
}

instancedMesh.add(particlesGroup);

// Mouse interaction
window.addEventListener('mousemove', (e) => {
  mouse.x = (e.clientX / window.innerWidth) - 0.5;
  mouse.y = (e.clientY / window.innerHeight) - 0.5;
});

// Responsive
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  const targetX = mouse.x * 20;
  const targetY = mouse.y * 20;

  camera.position.x += (targetX - camera.position.x) * 0.05;
  camera.position.y += (targetY - camera.position.y) * 0.05;
  camera.lookAt(scene.position);

  instancedMesh.rotation.x += 0.001 + mouse.y * 0.01;
  instancedMesh.rotation.y += 0.001 + mouse.x * 0.01;

  particlesGroup.children.forEach(particle => {
    const target = particle.userData.target;
    const speed = particle.userData.speed;

    particle.position.lerp(target, speed);

    if (particle.position.distanceTo(target) < 1) {
      particle.userData.target.set(
        (Math.random() - 0.5) * gridSize * spacing,
        (Math.random() - 0.5) * gridSize * spacing,
        (Math.random() - 0.5) * gridSize * spacing
      );
    }
  });

  renderer.render(scene, camera);
}

animate();
