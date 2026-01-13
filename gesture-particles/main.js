/* ======================
   THREE.JS SETUP
====================== */
const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
)
camera.position.z = 120

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

/* ======================
   PARTICLES
====================== */
const particleCount = 3000
const geometry = new THREE.BufferGeometry()
const positions = new Float32Array(particleCount * 3)
const colors = new Float32Array(particleCount * 3)

let basePositions = []
// Per-particle motion parameters
const phases = []
const speeds = []
const amplitudes = []

for (let i = 0; i < particleCount; i++) {
  const x = (Math.random() - 0.5) * 80
  const y = (Math.random() - 0.5) * 80
  const z = (Math.random() - 0.5) * 80

  positions[i * 3] = x
  positions[i * 3 + 1] = y
  positions[i * 3 + 2] = z

  // Initialize RGB colors (will be animated)
  colors[i * 3] = Math.random()
  colors[i * 3 + 1] = Math.random()
  colors[i * 3 + 2] = Math.random()

  basePositions.push(new THREE.Vector3(x, y, z))

  // Unique motion parameters per particle for organic, irregular motion
  phases.push(Math.random() * Math.PI * 2)
  speeds.push(0.3 + Math.random() * 1.2)
  amplitudes.push(2 + Math.random() * 8)
}

geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

const material = new THREE.PointsMaterial({
  vertexColors: true,
  size: 1.6,
  sizeAttenuation: true,
  transparent: true,
  opacity: 0.9,
  blending: THREE.AdditiveBlending
})

const particles = new THREE.Points(geometry, material)
scene.add(particles)

/* ======================
   UI CONTROLS
====================== */
document.getElementById('colorPicker').addEventListener('input', e => {
  material.color.set(e.target.value)
})

document.getElementById('fullscreenBtn').onclick = () => {
  if (!document.fullscreenElement) {
    document.body.requestFullscreen()
  } else {
    document.exitFullscreen()
  }
}

// Heart pattern generator (finger-heart / love shape)
function generateHeartPositions() {
  basePositions = []
  const scale = 1.6
  for (let i = 0; i < particleCount; i++) {
    const t = Math.random() * Math.PI * 2
    const x = 16 * Math.pow(Math.sin(t), 3)
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)
    const z = (Math.random() - 0.5) * 6
    basePositions.push(new THREE.Vector3(x * 0.08 * scale * 6, y * 0.08 * scale * 6, z))
  }
}

document.getElementById('patternSelect').addEventListener('change', e => {
  applyPattern(e.target.value)
})

/* ======================
   PATTERNS
====================== */
function applyPattern(type) {
  basePositions = []
  currentPattern = type

  for (let i = 0; i < particleCount; i++) {
    let x, y, z

    if (type === 'sphere') {
      const r = 40
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      x = r * Math.sin(phi) * Math.cos(theta)
      y = r * Math.sin(phi) * Math.sin(theta)
      z = r * Math.cos(phi)
    }

    if (type === 'wave') {
      x = (i - particleCount / 2) * 0.05
      y = Math.sin(i * 0.1) * 15
      z = 0
    }

    if (type === 'spiral') {
      const angle = i * 0.1
      x = Math.cos(angle) * angle * 0.3
      y = Math.sin(angle) * angle * 0.3
      z = i * 0.01
    }

    basePositions.push(new THREE.Vector3(x, y, z))
  }
}

/* ======================
   MEDIAPIPE HANDS
====================== */
const video = document.getElementById('video')

const hands = new Hands({
  locateFile: file =>
    `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
})

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.7
})

let gestureValue = 1
let handX = 0
let handY = 0
let isHeartGesture = false
let heartConfidence = 0
let currentPattern = 'sphere'
let lastPattern = 'sphere'

hands.onResults(results => {
  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    const hand = results.multiHandLandmarks[0]
    const thumb = hand[4]
    const index = hand[8]

    handX = (0.5 - hand[0].x) * 200
    handY = -(hand[0].y - 0.5) * 200

    const dx = thumb.x - index.x
    const dy = thumb.y - index.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    gestureValue = THREE.MathUtils.clamp(distance * 6, 0.3, 3)

    // Finger-heart detection: thumb and index close -> increase confidence
    if (distance < 0.04) {
      heartConfidence = Math.min(1, heartConfidence + 0.18)
    } else {
      heartConfidence = Math.max(0, heartConfidence - 0.12)
    }

    if (heartConfidence > 0.65 && !isHeartGesture) {
      isHeartGesture = true
      lastPattern = currentPattern
      generateHeartPositions()
      currentPattern = 'heart'
    }

    if (heartConfidence < 0.25 && isHeartGesture) {
      isHeartGesture = false
      applyPattern(lastPattern || 'sphere')
    }
  } else {
    // No hand detected: reset to default values
    gestureValue = 1
    handX = 0
    handY = 0
    heartConfidence = Math.max(0, heartConfidence - 0.06)
    if (heartConfidence < 0.25 && isHeartGesture) {
      isHeartGesture = false
      applyPattern(lastPattern || 'sphere')
    }
  }
})

const cameraFeed = new Camera(video, {
  onFrame: async () => {
    await hands.send({ image: video })
  },
  width: 640,
  height: 480
})
cameraFeed.start()

// Ensure an initial pattern is applied
applyPattern(currentPattern)

/* ======================
   ANIMATION LOOP
====================== */
function animate() {
  requestAnimationFrame(animate)

  const pos = geometry.attributes.position.array
  const col = geometry.attributes.color.array
  const t = performance.now() * 0.001

  for (let i = 0; i < particleCount; i++) {
    const ix = i * 3

    // Base target from pattern scaled by gestureValue
    const bx = basePositions[i].x * gestureValue
    const by = basePositions[i].y * gestureValue
    const bz = basePositions[i].z * gestureValue

    // Organic noise offsets (several frequencies blended)
    const n1 = Math.sin(t * speeds[i] + phases[i]) * amplitudes[i]
    const n2 = Math.cos(t * (speeds[i] * 1.3) + phases[i] * 0.7) * (amplitudes[i] * 0.6)
    const n3 = Math.sin(t * (speeds[i] * 0.6) - phases[i] * 0.4) * (amplitudes[i] * 0.8)

    // Slight influence from hand position for interactivity
    const handInfluenceX = handX * 0.02
    const handInfluenceY = handY * 0.02

    const tx = bx + n1 + n2 * 0.5 + handInfluenceX
    const ty = by + n2 + n3 * 0.5 + handInfluenceY
    const tz = bz + n3 + n1 * 0.3

    // Smoothly move particle toward the noisy target
    pos[ix] += (tx - pos[ix]) * 0.06
    pos[ix + 1] += (ty - pos[ix + 1]) * 0.06
    pos[ix + 2] += (tz - pos[ix + 2]) * 0.06

    // Animate RGB subtly for shimmering effect
    col[ix] = 0.5 + 0.5 * Math.sin(t * 1.2 + phases[i])
    col[ix + 1] = 0.5 + 0.5 * Math.sin(t * 1.7 + phases[i] * 1.1)
    col[ix + 2] = 0.5 + 0.5 * Math.sin(t * 2.1 + phases[i] * 0.9)
  }

  geometry.attributes.position.needsUpdate = true
  geometry.attributes.color.needsUpdate = true
  particles.rotation.y += 0.002

  renderer.render(scene, camera)
}

animate()

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})
