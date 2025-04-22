import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

let scene, camera, renderer, instancedMesh, mouse = { x: 0, y: 0 };

const raycaster = new THREE.Raycaster();
const mouseVector = new THREE.Vector2();

// Init scene
scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x000000, 50, 300); // Black fog starting at 50 units and ending at 300 units

camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 150;

renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x000000); // Match the background color to the fog
document.body.appendChild(renderer.domElement);

// Cube setup
const cubeCount = 2028; // Number of cubes
const size = 100;
const geometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
const material = new THREE.MeshBasicMaterial({ color: 993333, transparent: true, opacity: 0.8 });

instancedMesh = new THREE.InstancedMesh(geometry, material, cubeCount);

const gridSize = Math.cbrt(cubeCount); // Calculate grid size (assuming cubeCount is a perfect cube)
const spacing = size / gridSize; // Spacing between cubes

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
      dummy.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      dummy.updateMatrix();
      instancedMesh.setMatrixAt(index++, dummy.matrix);
    }
  }
}

scene.add(instancedMesh);

// Thunderbolt particle system setup
const thunderboltShape = new THREE.Shape();
thunderboltShape.moveTo(0, 0);
thunderboltShape.lineTo(0.2, 0.5);
thunderboltShape.lineTo(-0.1, 0.5);
thunderboltShape.lineTo(0.1, 1);
thunderboltShape.lineTo(-0.2, 0.5);
thunderboltShape.lineTo(0, 0);

const thunderboltGeometry = new THREE.ShapeGeometry(thunderboltShape);
const thunderboltMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, side: THREE.DoubleSide });

const particlesGroup = new THREE.Group();
const particleCount = 5000; // Number of particles

// Create particles that move between cubes
for (let i = 0; i < particleCount; i++) {
  const particle = new THREE.Mesh(thunderboltGeometry, thunderboltMaterial);

  // Initialize with a starting position within the cube grid bounds
  const startPos = new THREE.Vector3(
    (Math.random() - 0.5) * gridSize * spacing,
    (Math.random() - 0.5) * gridSize * spacing,
    (Math.random() - 0.5) * gridSize * spacing
  );
  particle.position.copy(startPos);

  // Random scale for variation
  const scale = Math.random() * 0.5 + 0.1;
  particle.scale.set(scale, scale, scale);

  // Random rotation
  particle.rotation.set(
    Math.random() * Math.PI,
    Math.random() * Math.PI,
    Math.random() * Math.PI
  );

  // Save movement info: current target & speed (in userData)
  particle.userData = {
    target: new THREE.Vector3(
      (Math.random() - 0.5) * gridSize * spacing,
      (Math.random() - 0.5) * gridSize * spacing,
      (Math.random() - 0.5) * gridSize * spacing
    ),
    speed: 0.05 , // control speed factor
  };

  particlesGroup.add(particle);
}

instancedMesh.add(particlesGroup);

// Mouse interaction
window.addEventListener('mousemove', (e) => {
  mouse.x = (e.clientX / window.innerWidth) - 0.5;
  mouse.y = (e.clientY / window.innerHeight) - 0.5;
});

// Responsive resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Smooth camera movement based on mouse position
  const targetX = mouse.x * 20; // Reduced sensitivity
  const targetY = mouse.y * 20;

  camera.position.x += (targetX - camera.position.x) * 0.05; // Smooth transition
  camera.position.y += (targetY - camera.position.y) * 0.05;

  // Keep the camera looking at the center of the scene
  camera.lookAt(scene.position);

  // Rotate the instanced mesh with reduced sensitivity
  instancedMesh.rotation.x += 0.001 + mouse.y * 0.01;
  instancedMesh.rotation.y += 0.001 + mouse.x * 0.01;

  // Rotate the particle group for a dynamic effect
  // particlesGroup.rotation.x += 0.001;
  // particlesGroup.rotation.y += 0.002;

  particlesGroup.children.forEach(particle => {
    const target = particle.userData.target;
    const speed = particle.userData.speed;

    // Move the particle gradually towards its target
    particle.position.lerp(target, speed);

    // Set a new target if the particle is near its current target
    if (particle.position.distanceTo(target) < 1) {
      particle.userData.target.set(
        (Math.random() - 0.5) * gridSize * spacing,
        (Math.random() - 0.5) * gridSize * spacing,
        (Math.random() - 0.5) * gridSize * spacing
      );
    }
  });

  // Render the scene
  renderer.render(scene, camera);
}

animate();
