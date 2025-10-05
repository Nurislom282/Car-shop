// Anime.js Animations
anime
  .timeline({
    easing: "easeOutExpo",
  })
  .add({
    targets: ".pill-badge",
    opacity: [0, 1],
    translateY: [20, 0],
    duration: 1000,
  })
  .add(
    {
      targets: ".title-word",
      opacity: [0, 1],
      translateY: [40, 0],
      duration: 1200,
      delay: anime.stagger(150),
    },
    "-=600"
  )
  .add(
    {
      targets: ".hero-subtitle",
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 1000,
    },
    "-=400"
  )
  .add(
    {
      targets: ".cta-group",
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 1000,
    },
    "-=600"
  )
  .add(
    {
      targets: ".floating-stats",
      opacity: [0, 1],
      translateY: [20, 0],
      duration: 1000,
    },
    "-=800"
  )
  .add(
    {
      targets: ".car-3d-container",
      opacity: [0, 1],
      scale: [0.8, 1],
      duration: 1400,
    },
    "-=1200"
  );

// Feature cards animation on scroll
const observerOptions = {
  threshold: 0.2,
  rootMargin: "0px 0px -100px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      anime({
        targets: entry.target,
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 1000,
        easing: "easeOutExpo",
      });
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll(".feature-card, .dashboard-card").forEach((card) => {
  observer.observe(card);
});

// Liquid Gradient Background with Three.js
const canvas = document.getElementById("gradientCanvas");
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
  alpha: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

// Create gradient mesh
const geometry = new THREE.PlaneGeometry(20, 20, 32, 32);
const material = new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 0 },
    color1: { value: new THREE.Color(0x2ecc71) }, // Yashil
    color2: { value: new THREE.Color(0x27ae60) }, // Qoraroq yashil
    color3: { value: new THREE.Color(0x1abc9c) }, // Teal
  },
  vertexShader: `
    varying vec2 vUv;
    uniform float time;
    
    void main() {
      vUv = uv;
      vec3 pos = position;
      float wave = sin(pos.x * 0.5 + time) * cos(pos.y * 0.5 + time) * 0.5;
      pos.z += wave;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    uniform vec3 color1;
    uniform vec3 color2;
    uniform vec3 color3;
    uniform float time;
    
    void main() {
      vec2 uv = vUv;
      float wave1 = sin(uv.x * 3.0 + time * 0.5) * 0.5 + 0.5;
      float wave2 = cos(uv.y * 3.0 + time * 0.3) * 0.5 + 0.5;
      
      vec3 color = mix(color1, color2, wave1);
      color = mix(color, color3, wave2);
      
      gl_FragColor = vec4(color, 1.0);
    }
  `,
});

const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

// Animation loop for background
function animateBackground() {
  requestAnimationFrame(animateBackground);
  material.uniforms.time.value += 0.01;
  mesh.rotation.z = Math.sin(Date.now() * 0.0001) * 0.1;
  renderer.render(scene, camera);
}
animateBackground();

// 3D Car Model
const carContainer = document.getElementById("car3d");
const carRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
carRenderer.setSize(carContainer.clientWidth, carContainer.clientHeight);
carRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
carRenderer.setClearColor(0x000000, 0);
carContainer.appendChild(carRenderer.domElement);

const carScene = new THREE.Scene();
const carCamera = new THREE.PerspectiveCamera(
  50,
  carContainer.clientWidth / carContainer.clientHeight,
  0.1,
  1000
);
carCamera.position.set(5, 3, 8);
carCamera.lookAt(0, 0, 0);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
carScene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 10, 5);
carScene.add(directionalLight);

const spotLight = new THREE.SpotLight(0xa78bfa, 1);
spotLight.position.set(-5, 5, 5);
carScene.add(spotLight);

// Create car body
const carGroup = new THREE.Group();

// Main body
const bodyGeometry = new THREE.BoxGeometry(4, 1, 2);
const bodyMaterial = new THREE.MeshPhongMaterial({
  color: 0xa78bfa,
  shininess: 100,
  specular: 0x444444,
});
const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
body.position.y = 1;
carGroup.add(body);

// Cabin
const cabinGeometry = new THREE.BoxGeometry(2.5, 1, 1.8);
const cabin = new THREE.Mesh(cabinGeometry, bodyMaterial);
cabin.position.set(-0.3, 2, 0);
carGroup.add(cabin);

// Windows
const windowMaterial = new THREE.MeshPhongMaterial({
  color: 0x222222,
  transparent: true,
  opacity: 0.8,
  shininess: 200,
});

const windowGeometry = new THREE.BoxGeometry(2.4, 0.9, 1.7);
const windows = new THREE.Mesh(windowGeometry, windowMaterial);
windows.position.set(-0.3, 2, 0);
carGroup.add(windows);

// Wheels
const wheelGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.3, 32);
const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });

const wheel1 = new THREE.Mesh(wheelGeometry, wheelMaterial);
wheel1.rotation.z = Math.PI / 2;
wheel1.position.set(1.2, 0.4, 1.1);
carGroup.add(wheel1);

const wheel2 = new THREE.Mesh(wheelGeometry, wheelMaterial);
wheel2.rotation.z = Math.PI / 2;
wheel2.position.set(1.2, 0.4, -1.1);
carGroup.add(wheel2);

const wheel3 = new THREE.Mesh(wheelGeometry, wheelMaterial);
wheel3.rotation.z = Math.PI / 2;
wheel3.position.set(-1.2, 0.4, 1.1);
carGroup.add(wheel3);

const wheel4 = new THREE.Mesh(wheelGeometry, wheelMaterial);
wheel4.rotation.z = Math.PI / 2;
wheel4.position.set(-1.2, 0.4, -1.1);
carGroup.add(wheel4);

// Hood
const hoodGeometry = new THREE.BoxGeometry(1, 0.3, 1.8);
const hood = new THREE.Mesh(hoodGeometry, bodyMaterial);
hood.position.set(2.3, 1.2, 0);
carGroup.add(hood);

// Headlights
const headlightGeometry = new THREE.SphereGeometry(0.15, 16, 16);
const headlightMaterial = new THREE.MeshPhongMaterial({
  color: 0xffff00,
  emissive: 0xffff00,
  emissiveIntensity: 0.5,
});

const headlight1 = new THREE.Mesh(headlightGeometry, headlightMaterial);
headlight1.position.set(2.8, 1, 0.6);
carGroup.add(headlight1);

const headlight2 = new THREE.Mesh(headlightGeometry, headlightMaterial);
headlight2.position.set(2.8, 1, -0.6);
carGroup.add(headlight2);

carScene.add(carGroup);

// Animate car
function animateCar() {
  requestAnimationFrame(animateCar);

  carGroup.rotation.y += 0.005;
  carGroup.position.y = Math.sin(Date.now() * 0.001) * 0.2;

  // Rotate wheels
  wheel1.rotation.x -= 0.05;
  wheel2.rotation.x -= 0.05;
  wheel3.rotation.x -= 0.05;
  wheel4.rotation.x -= 0.05;

  carRenderer.render(carScene, carCamera);
}
animateCar();

// Mouse interaction for car
let mouseX = 0;
let mouseY = 0;

document.addEventListener("mousemove", (e) => {
  mouseX = (e.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(e.clientY / window.innerHeight) * 2 + 1;

  anime({
    targets: carGroup.rotation,
    y: carGroup.rotation.y + mouseX * 0.05,
    x: mouseY * 0.1,
    duration: 1000,
    easing: "easeOutQuad",
  });
});

// Handle resize
window.addEventListener("resize", () => {
  // Background
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Car
  const width = carContainer.clientWidth;
  const height = carContainer.clientHeight;
  carCamera.aspect = width / height;
  carCamera.updateProjectionMatrix();
  carRenderer.setSize(width, height);
});

// Button hover effects
document
  .querySelectorAll(".btn-primary, .btn-secondary, .glass-button")
  .forEach((btn) => {
    btn.addEventListener("mouseenter", (e) => {
      anime({
        targets: e.currentTarget,
        scale: 1.05,
        duration: 300,
        easing: "easeOutQuad",
      });
    });

    btn.addEventListener("mouseleave", (e) => {
      anime({
        targets: e.currentTarget,
        scale: 1,
        duration: 300,
        easing: "easeOutQuad",
      });
    });
  });

// Feature cards hover effect
document.querySelectorAll(".feature-card").forEach((card) => {
  card.addEventListener("mouseenter", (e) => {
    anime({
      targets: e.currentTarget.querySelector(".feature-icon"),
      rotate: "1turn",
      duration: 600,
      easing: "easeOutQuad",
    });
  });
});
