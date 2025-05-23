import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

let scene, camera, renderer, instancedMesh, mouse = { x: 0, y: 0 };

const raycaster = new THREE.Raycaster();
const mouseVector = new THREE.Vector2();

// Init scene
scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xffffff, 50, 300); // White fog starting at 50 units and ending at 300 units

camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 150;

renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xffffff, 0); // Match the background color to white
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

// Add neuron firing simulation logic
const neuronStates = new Array(cubeCount).fill(false);
const activationDuration = 3000; // Duration of activation in milliseconds

// Add pulse effect to activated neurons
function pulseNeuron(index) {
  const scale = { value: 1 };
  const targetScale = 1.5; // Scale up by 1.5x
  const duration = 500; // Pulse duration in milliseconds

  const animateScale = () => {
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const scaleVector = new THREE.Vector3();

    instancedMesh.getMatrixAt(index, matrix);
    matrix.decompose(position, quaternion, scaleVector);

    scaleVector.set(scale.value, scale.value, scale.value);
    matrix.compose(position, quaternion, scaleVector);

    instancedMesh.setMatrixAt(index, matrix);
    instancedMesh.instanceMatrix.needsUpdate = true;
  };

  // Animate the scale up and down
  const startTime = performance.now();
  const animate = () => {
    const elapsedTime = performance.now() - startTime;
    if (elapsedTime < duration) {
      scale.value = 1 + (targetScale - 1) * (elapsedTime / duration);
      animateScale();
      requestAnimationFrame(animate);
    } else {
      scale.value = 1; // Reset scale
      animateScale();
    }
  };

  animate();
}

// Update activateNeuron to include pulse effect
function activateNeuron(index) {
  neuronStates[index] = true;
  instancedMesh.setColorAt(index, new THREE.Color(0xffff00)); // Bright yellow for firing
  instancedMesh.instanceColor.needsUpdate = true;

  pulseNeuron(index); // Add pulse effect

  setTimeout(() => {
    neuronStates[index] = false;
    instancedMesh.setColorAt(index, new THREE.Color(0x993333)); // Original color
    instancedMesh.instanceColor.needsUpdate = true;
  }, activationDuration);
}

// Modify simulateNeuronFiring to activate neurons in a sequence
let currentNeuronIndex = 0;

function simulateNeuronFiring() {
  if (!neuronStates[currentNeuronIndex]) {
    activateNeuron(currentNeuronIndex);
  }

  // Move to the next neuron in sequence
  currentNeuronIndex = (currentNeuronIndex + 1) % cubeCount;
}

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

  // Simulate neuron firing
  simulateNeuronFiring();

  // Render the scene
  renderer.render(scene, camera);
}

animate();
