<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import LoginForm from './components/LoginForm.vue'
import RegisterForm from './components/RegisterForm.vue'

const isFlipped = ref(false)
const router = useRouter()
const route = useRoute()

// === Canvas particle system ===
const canvasRef = ref<HTMLCanvasElement | null>(null)
const pageRef = ref<HTMLDivElement | null>(null)

const COLORS = [
  '#18a058',
  '#2080f0',
  '#f0a020',
  '#d03050',
  '#22c55e',
  '#6366f1',
]

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  alpha: number
}

interface Meteor {
  x: number
  y: number
  vx: number
  vy: number
  length: number
  alpha: number
  color: string
}

let particles: Particle[] = []
const meteors: Meteor[] = []
let animationId = 0
const mouse = { x: -1000, y: -1000, radius: 180 }
let meteorSpawnTimer = 0

let cleanupCanvas: (() => void) | null = null
let cleanupParallax: (() => void) | null = null

function initCanvas(canvas: HTMLCanvasElement) {
  const ctxOrNull = canvas.getContext('2d')
  if (!ctxOrNull)
    return
  const ctx: CanvasRenderingContext2D = ctxOrNull

  const resize = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
  window.addEventListener('resize', resize)
  resize()

  particles = []
  const density
    = Math.min(window.innerWidth, window.innerHeight) < 768 ? 8000 : 5000
  const count = Math.min(
    Math.floor((canvas.width * canvas.height) / density),
    200,
  )
  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      size: Math.random() * 2.5 + 1,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: Math.random() * 0.5 + 0.3,
    })
  }

  const onMove = (e: MouseEvent) => {
    mouse.x = e.clientX
    mouse.y = e.clientY
  }
  const onLeave = () => {
    mouse.x = -1000
    mouse.y = -1000
  }
  window.addEventListener('mousemove', onMove)
  window.addEventListener('mouseleave', onLeave)

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    meteorSpawnTimer++
    if (meteorSpawnTimer > 120 + Math.random() * 180) {
      meteorSpawnTimer = 0
      const angle = Math.PI / 4 + (Math.random() - 0.5) * 0.3
      const speed = 4 + Math.random() * 3
      meteors.push({
        x: Math.random() * canvas.width * 1.2 - canvas.width * 0.1,
        y: -20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        length: 60 + Math.random() * 80,
        alpha: 0.6 + Math.random() * 0.4,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      })
    }

    for (let m = meteors.length - 1; m >= 0; m--) {
      const met = meteors[m]
      met.x += met.vx
      met.y += met.vy
      met.alpha -= 0.003

      const grad = ctx.createLinearGradient(
        met.x,
        met.y,
        met.x - met.vx * met.length,
        met.y - met.vy * met.length,
      )
      grad.addColorStop(0, `rgba(255, 255, 255, ${met.alpha})`)
      grad.addColorStop(0.3, met.color)
      grad.addColorStop(1, 'transparent')
      ctx.beginPath()
      ctx.moveTo(met.x, met.y)
      ctx.lineTo(met.x - met.vx * met.length, met.y - met.vy * met.length)
      ctx.strokeStyle = grad
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(met.x, met.y, 2.5, 0, Math.PI * 2)
      ctx.fillStyle = '#fff'
      ctx.globalAlpha = met.alpha * 0.9
      ctx.fill()
      ctx.globalAlpha = 1

      if (
        met.alpha <= 0
        || met.x > canvas.width + 50
        || met.y > canvas.height + 50
      ) {
        meteors.splice(m, 1)
      }
    }

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]

      const dx = mouse.x - p.x
      const dy = mouse.y - p.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < mouse.radius) {
        const force = (mouse.radius - dist) / mouse.radius
        const angle = Math.atan2(dy, dx)
        p.vx -= Math.cos(angle) * force * 0.4
        p.vy -= Math.sin(angle) * force * 0.4
      }

      p.x += p.vx
      p.y += p.vy

      p.vx *= 0.98
      p.vy *= 0.98

      if (p.x < -10)
        p.x = canvas.width + 10
      if (p.x > canvas.width + 10)
        p.x = -10
      if (p.y < -10)
        p.y = canvas.height + 10
      if (p.y > canvas.height + 10)
        p.y = -10

      ctx.beginPath()
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
      ctx.fillStyle = p.color
      ctx.globalAlpha = p.alpha
      ctx.fill()

      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j]
        const dx2 = p.x - p2.x
        const dy2 = p.y - p2.y
        const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2)
        if (dist2 < 150) {
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(p2.x, p2.y)
          ctx.strokeStyle = p.color
          ctx.globalAlpha = (1 - dist2 / 150) * 0.2
          ctx.lineWidth = 0.8
          ctx.stroke()
        }
      }
    }

    ctx.globalAlpha = 1
    animationId = requestAnimationFrame(animate)
  }

  animate()

  cleanupCanvas = () => {
    cancelAnimationFrame(animationId)
    window.removeEventListener('resize', resize)
    window.removeEventListener('mousemove', onMove)
    window.removeEventListener('mouseleave', onLeave)
  }
}

const mouseX = ref(-200)
const mouseY = ref(-200)
const cardTilt = ref({ x: 0, y: 0 })
const cardTiltStyle = computed(() => ({
  transform: `rotateX(${cardTilt.value.x}deg) rotateY(${cardTilt.value.y}deg)`,
}))
const cardRef = ref<HTMLDivElement | null>(null)

function setupParallax(page: HTMLDivElement) {
  const onMove = (e: MouseEvent) => {
    mouseX.value = e.clientX
    mouseY.value = e.clientY

    const rect = page.getBoundingClientRect()
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const tiltX = ((e.clientY - centerY) / centerY) * 3
    const tiltY = ((e.clientX - centerX) / centerX) * 3
    cardTilt.value = { x: -tiltX, y: tiltY }
  }

  window.addEventListener('mousemove', onMove, { passive: true })
  cleanupParallax = () => window.removeEventListener('mousemove', onMove)
}

onBeforeUnmount(() => {
  cleanupCanvas?.()
  cleanupParallax?.()
})

onMounted(() => {
  if (canvasRef.value)
    initCanvas(canvasRef.value)
  if (pageRef.value)
    setupParallax(pageRef.value)
})

function flipToRegister() {
  isFlipped.value = true
}
function flipToLogin() {
  isFlipped.value = false
}
function handleLoginSuccess() {
  const redirect
    = (route.query?.redirect as string)
      || import.meta.env.VITE_HOME_PATH
      || '/home'
  router.push(redirect.startsWith('/') ? redirect : `/${redirect}`)
}
function handleRegisterSuccess() {
  flipToLogin()
  window.$message?.success?.('注册成功，请登录')
}
</script>

<template>
  <div ref="pageRef" class="login-page wh-full flex-center">
    <!-- Canvas particle system -->
    <canvas ref="canvasRef" class="bg-canvas" />

    <!-- Mouse-reactive glow overlay -->
    <div
      class="mouse-glow"
      :style="{
        left: `${mouseX}px`,
        top: `${mouseY}px`,
      }"
    />

    <!-- Glass card container with parallax tilt -->
    <div
      ref="cardRef"
      class="glass-wrapper"
      :class="{ flipped: isFlipped }"
      :style="cardTiltStyle"
    >
      <div class="glass-inner">
        <!-- Front: Login -->
        <div class="glass-face front">
          <div class="glass-header">
            <div class="logo-icon">
              <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
                <rect
                  width="32"
                  height="32"
                  rx="8"
                  fill="rgba(24,160,88,0.9)"
                />
                <text
                  x="16"
                  y="22"
                  font-size="18"
                  font-weight="bold"
                  fill="white"
                  text-anchor="middle"
                >
                  J
                </text>
              </svg>
            </div>
            <h2 class="title">
              欢迎回来
            </h2>
            <p class="subtitle">
              登录您的账号以继续
            </p>
          </div>
          <LoginForm
            @success="handleLoginSuccess"
            @switch-to-register="flipToRegister"
          />
        </div>

        <!-- Back: Register -->
        <div class="glass-face back">
          <div class="glass-header">
            <div class="logo-icon">
              <svg width="40" height="40" viewBox="0 0 32 32" fill="none">
                <rect
                  width="32"
                  height="32"
                  rx="8"
                  fill="rgba(24,160,88,0.9)"
                />
                <text
                  x="16"
                  y="22"
                  font-size="18"
                  font-weight="bold"
                  fill="white"
                  text-anchor="middle"
                >
                  J
                </text>
              </svg>
            </div>
            <h2 class="title">
              创建账号
            </h2>
            <p class="subtitle">
              注册一个新账号开始使用
            </p>
          </div>
          <RegisterForm
            @success="handleRegisterSuccess"
            @switch-to-login="flipToLogin"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(135deg, #070b16 0%, #141b2d 50%, #070b16 100%);
  overflow: hidden;
}

/* ===== Canvas Particle Background ===== */
.bg-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

/* ===== Mouse Reactive Glow ===== */
.mouse-glow {
  position: absolute;
  width: 500px;
  height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(24, 160, 88, 0.08), transparent 60%);
  pointer-events: none;
  z-index: 0;
  transform: translate(-50%, -50%);
  transition:
    left 0.15s ease-out,
    top 0.15s ease-out;
}

/* ===== Glass Card ===== */
.glass-wrapper {
  perspective: 1200px;
  width: 420px;
  position: relative;
  z-index: 1;
}

.glass-inner {
  display: grid;
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
  will-change: transform;
}

.glass-face {
  grid-area: 1 / 1 / 1 / 1;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;

  /* Enhanced Glassmorphism */
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(20px) saturate(1.6);
  -webkit-backdrop-filter: blur(20px) saturate(1.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 40px 36px;
  box-shadow:
    0 8px 40px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    0 0 80px rgba(24, 160, 88, 0.05);
}

.glass-face::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 24px;
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.06) 0%,
    transparent 40%,
    transparent 60%,
    rgba(255, 255, 255, 0.03) 100%
  );
  pointer-events: none;
}

.glass-face::after {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: 24px;
  padding: 1px;
  background: conic-gradient(
    from 0deg at 50% 50%,
    transparent,
    rgba(24, 160, 88, 0.15),
    transparent,
    rgba(32, 128, 240, 0.1),
    transparent,
    rgba(24, 160, 88, 0.15),
    transparent
  );
  -webkit-mask:
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  animation: borderSpin 8s linear infinite;
}

@keyframes borderSpin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.glass-face.back {
  transform: rotateY(180deg);
}

.glass-wrapper.flipped .glass-inner {
  transform: rotateY(180deg);
}

.glass-wrapper.flipped .glass-inner .glass-face::after {
  animation-duration: 6s;
  animation-direction: reverse;
}

/* ===== Header ===== */
.glass-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo-icon {
  display: inline-flex;
  margin-bottom: 16px;
  filter: drop-shadow(0 0 12px rgba(24, 160, 88, 0.4));
}

.title {
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  margin: 0 0 6px;
  letter-spacing: -0.02em;
}

.subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.45);
  margin: 0;
}
</style>
